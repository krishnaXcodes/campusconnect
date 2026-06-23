package com.nexus.service;

import com.nexus.dto.request.CreateCommentRequest;
import com.nexus.dto.response.CommentResponse;
import com.nexus.entity.*;
import com.nexus.enums.NotificationType;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public CommentResponse addComment(Long postId, CreateCommentRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .author(author)
                .post(post)
                .build();

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
            comment.setParent(parent);
        }

        comment = commentRepository.save(comment);
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        // Notification
        if (!post.getAuthor().getId().equals(author.getId())) {
            notificationRepository.save(Notification.builder()
                    .recipient(post.getAuthor()).sender(author)
                    .type(NotificationType.COMMENT).postId(postId)
                    .message(author.getUsername() + " commented on your post")
                    .build());
        }

        return mapToResponse(comment);
    }

    public Page<CommentResponse> getComments(Long postId, int page, int size) {
        return commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Transactional
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getAuthor().getUsername().equals(username)) {
            throw new com.nexus.exception.UnauthorizedException("Not authorized");
        }
        Post post = comment.getPost();
        commentRepository.delete(comment);
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorId(comment.getAuthor().getId())
                .authorUsername(comment.getAuthor().getUsername())
                .authorProfileImage(comment.getAuthor().getProfileImage())
                .likeCount(comment.getLikeCount())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .replies(comment.getReplies() != null
                        ? comment.getReplies().stream().map(this::mapToResponse).collect(Collectors.toList())
                        : null)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
