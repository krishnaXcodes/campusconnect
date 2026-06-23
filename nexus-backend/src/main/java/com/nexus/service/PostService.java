package com.nexus.service;

import com.nexus.dto.request.CreatePostRequest;
import com.nexus.dto.response.PostResponse;
import com.nexus.entity.*;
import com.nexus.enums.FeedReasonType;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.exception.UnauthorizedException;
import com.nexus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final HashtagRepository hashtagRepository;
    private final PostHashtagRepository postHashtagRepository;

    @Transactional
    public PostResponse createPost(CreatePostRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String mediaUrlsJson = request.getMediaUrls() != null
                ? String.join("|||", request.getMediaUrls()) : null;

        Post post = Post.builder()
                .caption(request.getCaption())
                .mediaUrls(mediaUrlsJson)
                .location(request.getLocation())
                .postType(request.getPostType())
                .author(author)
                .build();

        post = postRepository.save(post);

        // Process hashtags
        if (request.getHashtags() != null) {
            for (String tagName : request.getHashtags()) {
                String cleaned = tagName.toLowerCase().replaceAll("[^a-z0-9_]", "");
                if (cleaned.isEmpty()) continue;
                Hashtag hashtag = hashtagRepository.findByName(cleaned)
                        .orElseGet(() -> hashtagRepository.save(Hashtag.builder().name(cleaned).postCount(0).build()));
                hashtag.setPostCount(hashtag.getPostCount() + 1);
                hashtagRepository.save(hashtag);
                postHashtagRepository.save(PostHashtag.builder().post(post).hashtag(hashtag).build());
            }
        }

        // Also extract hashtags from caption
        if (request.getCaption() != null) {
            extractHashtagsFromCaption(request.getCaption(), post);
        }

        // Update user post count
        author.setPostCount(author.getPostCount() + 1);
        userRepository.save(author);

        return mapToResponse(post, username, FeedReasonType.FOLLOWING, "You created this");
    }

    public PostResponse getPostById(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        return mapToResponse(post, username, null, null);
    }

    @Transactional
    public PostResponse updatePost(Long id, CreatePostRequest request, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new UnauthorizedException("Not authorized to update this post");
        }
        post.setCaption(request.getCaption());
        if (request.getMediaUrls() != null) {
            post.setMediaUrls(String.join("|||", request.getMediaUrls()));
        }
        post.setLocation(request.getLocation());
        post = postRepository.save(post);
        return mapToResponse(post, username, null, null);
    }

    @Transactional
    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!post.getAuthor().getUsername().equals(username) && !user.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Not authorized to delete this post");
        }
        User author = post.getAuthor();
        postRepository.delete(post);
        author.setPostCount(Math.max(0, author.getPostCount() - 1));
        userRepository.save(author);
    }

    public Page<PostResponse> getFeed(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Long> followingIds = followRepository.findFollowingIds(user.getId());
        followingIds.add(user.getId()); // include own posts

        Pageable pageable = PageRequest.of(page, size);

        if (followingIds.size() <= 1) {
            // New user with no follows — show trending
            return postRepository.findTrendingPosts(pageable)
                    .map(p -> mapToResponse(p, username, FeedReasonType.TRENDING, "Trending on Nexus"));
        }

        Page<Post> feedPosts = postRepository.findFeedPosts(followingIds, pageable);

        return feedPosts.map(post -> {
            FeedReasonType reason;
            String detail;
            if (post.getAuthor().getId().equals(user.getId())) {
                reason = FeedReasonType.FOLLOWING;
                detail = "Your post";
            } else if (post.getAuthor().getCollege() != null && post.getAuthor().getCollege().equals(user.getCollege())) {
                reason = FeedReasonType.CAMPUS_TRENDING;
                detail = "From your campus — " + post.getAuthor().getCollege();
            } else {
                reason = FeedReasonType.FOLLOWING;
                detail = "By @" + post.getAuthor().getUsername() + " you follow";
            }
            return mapToResponse(post, username, reason, detail);
        });
    }

    public Page<PostResponse> getExplorePosts(String username, int page, int size) {
        User user = userRepository.findByUsername(username).orElse(null);
        Pageable pageable = PageRequest.of(page, size);

        if (user != null) {
            List<Long> followingIds = followRepository.findFollowingIds(user.getId());
            followingIds.add(user.getId());
            return postRepository.findExplorePosts(followingIds, LocalDateTime.now().minusDays(7), pageable)
                    .map(p -> mapToResponse(p, username, FeedReasonType.SUGGESTED, "Suggested for you"));
        }
        return postRepository.findTrendingPosts(pageable)
                .map(p -> mapToResponse(p, null, FeedReasonType.TRENDING, "Trending"));
    }

    public Page<PostResponse> getUserPosts(Long userId, int page, int size, String username) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.findByAuthorId(userId, pageable)
                .map(post -> mapToResponse(post, username, null, null));
    }

    public Page<PostResponse> getPostsByHashtag(Long hashtagId, int page, int size, String username) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByHashtagId(hashtagId, pageable)
                .map(post -> mapToResponse(post, username, FeedReasonType.HASHTAG, "Hashtag"));
    }

    public Page<PostResponse> searchPosts(String query, int page, int size, String username) {
        return postRepository.searchPosts(query, PageRequest.of(page, size))
                .map(post -> mapToResponse(post, username, null, null));
    }

    public Page<PostResponse> getCampusTrending(String college, int page, int size, String username) {
        return postRepository.findTrendingByCollege(college, PageRequest.of(page, size))
                .map(p -> mapToResponse(p, username, FeedReasonType.CAMPUS_TRENDING, "Trending at " + college));
    }

    private PostResponse mapToResponse(Post post, String username, FeedReasonType reasonType, String reasonDetail) {
        boolean liked = false;
        boolean bookmarked = false;

        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                liked = likeRepository.existsByUserIdAndPostId(user.getId(), post.getId());
                bookmarked = bookmarkRepository.existsByUserIdAndPostId(user.getId(), post.getId());
            }
        }

        List<String> mediaUrls = post.getMediaUrls() != null
                ? Arrays.asList(post.getMediaUrls().split("\\|\\|\\|")) : new ArrayList<>();

        List<String> hashtags = post.getPostHashtags() != null
                ? post.getPostHashtags().stream().map(ph -> ph.getHashtag().getName()).collect(Collectors.toList())
                : new ArrayList<>();

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
                .bookmarked(bookmarked)
                .hashtags(hashtags)
                .feedReason(reasonType != null ? reasonType.name() : null)
                .feedReasonDetail(reasonDetail)
                .createdAt(post.getCreatedAt())
                .build();
    }

    private void extractHashtagsFromCaption(String caption, Post post) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("#(\\w+)");
        java.util.regex.Matcher matcher = pattern.matcher(caption);
        while (matcher.find()) {
            String tagName = matcher.group(1).toLowerCase();
            // Check if already linked
            boolean exists = post.getPostHashtags().stream()
                    .anyMatch(ph -> ph.getHashtag().getName().equals(tagName));
            if (!exists) {
                Hashtag hashtag = hashtagRepository.findByName(tagName)
                        .orElseGet(() -> hashtagRepository.save(Hashtag.builder().name(tagName).postCount(0).build()));
                hashtag.setPostCount(hashtag.getPostCount() + 1);
                hashtagRepository.save(hashtag);
                postHashtagRepository.save(PostHashtag.builder().post(post).hashtag(hashtag).build());
            }
        }
    }
}
