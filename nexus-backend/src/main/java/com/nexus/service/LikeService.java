package com.nexus.service;

import com.nexus.entity.*;
import com.nexus.enums.NotificationType;
import com.nexus.exception.BadRequestException;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void likePost(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (likeRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            throw new BadRequestException("Already liked this post");
        }

        likeRepository.save(Like.builder().user(user).post(post).build());
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);

        // Notification (don't notify self)
        if (!post.getAuthor().getId().equals(user.getId())) {
            notificationRepository.save(Notification.builder()
                    .recipient(post.getAuthor()).sender(user)
                    .type(NotificationType.LIKE).postId(postId)
                    .message(user.getUsername() + " liked your post")
                    .build());
        }
    }

    @Transactional
    public void unlikePost(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Like like = likeRepository.findByUserIdAndPostId(user.getId(), postId)
                .orElseThrow(() -> new BadRequestException("Not liked this post"));

        likeRepository.delete(like);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        postRepository.save(post);
    }
}
