package com.nexus.service;

import com.nexus.dto.response.PostResponse;
import com.nexus.entity.Bookmark;
import com.nexus.entity.Post;
import com.nexus.entity.User;
import com.nexus.exception.BadRequestException;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.BookmarkRepository;
import com.nexus.repository.LikeRepository;
import com.nexus.repository.PostRepository;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    @Transactional
    public void bookmarkPost(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (bookmarkRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            throw new BadRequestException("Already bookmarked");
        }

        bookmarkRepository.save(Bookmark.builder().user(user).post(post).build());
    }

    @Transactional
    public void removeBookmark(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Bookmark bookmark = bookmarkRepository.findByUserIdAndPostId(user.getId(), postId)
                .orElseThrow(() -> new BadRequestException("Not bookmarked"));
        bookmarkRepository.delete(bookmark);
    }

    public Page<PostResponse> getBookmarks(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(b -> {
                    Post post = b.getPost();
                    boolean liked = likeRepository.existsByUserIdAndPostId(user.getId(), post.getId());
                    List<String> mediaUrls = post.getMediaUrls() != null
                            ? Arrays.asList(post.getMediaUrls().split("\\|\\|\\|")) : new ArrayList<>();

                    return PostResponse.builder()
                            .id(post.getId())
                            .caption(post.getCaption())
                            .mediaUrls(mediaUrls)
                            .location(post.getLocation())
                            .postType(post.getPostType())
                            .authorId(post.getAuthor().getId())
                            .authorUsername(post.getAuthor().getUsername())
                            .authorFullName(post.getAuthor().getFullName())
                            .authorProfileImage(post.getAuthor().getProfileImage())
                            .likeCount(post.getLikeCount())
                            .commentCount(post.getCommentCount())
                            .shareCount(post.getShareCount())
                            .liked(liked)
                            .bookmarked(true)
                            .createdAt(post.getCreatedAt())
                            .build();
                });
    }
}
