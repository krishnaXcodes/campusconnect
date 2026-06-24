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

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Long> followingIds = followRepository.findFollowingIds(user.getId());
        followingIds.add(user.getId()); // include own posts

        Pageable pageable = PageRequest.of(page, size);

        if (followingIds.size() <= 1) {
            // New user with no follows — show trending
            return postRepository.findTrendingPosts(pageable)
                    .map(p -> mapToResponse(p, username, FeedReasonType.TRENDING, "Trending on CampusConnect"));
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

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public Page<PostResponse> getUserPosts(Long userId, int page, int size, String username) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.findByAuthorId(userId, pageable)
                .map(post -> mapToResponse(post, username, null, null));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByHashtag(Long hashtagId, int page, int size, String username) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByHashtagId(hashtagId, pageable)
                .map(post -> mapToResponse(post, username, FeedReasonType.HASHTAG, "Hashtag"));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> searchPosts(String query, int page, int size, String username) {
        return postRepository.searchPosts(query, PageRequest.of(page, size))
                .map(post -> mapToResponse(post, username, null, null));
    }

    @Transactional(readOnly = true)
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

    @Transactional
    public void seedDevPosts() {
        List<User> users = userRepository.findAll();
        String[] sampleImages = {
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800"
        };
        String[] captions = {
            "Just finished a great coding session! #devlife",
            "Loving the new tech stack. So much faster. \uD83D\uDE80 #programming",
            "Campus looks beautiful today! #campusconnect",
            "Working on my final year project. Wish me luck! \uD83D\uDCBB",
            "Anyone up for a hackathon this weekend? #hackathon"
        };
        
        java.util.Random rand = new java.util.Random();
        for (User user : users) {
            for (int i = 0; i < 2; i++) {
                Post post = Post.builder()
                        .caption(captions[rand.nextInt(captions.length)])
                        .mediaUrls(sampleImages[rand.nextInt(sampleImages.length)])
                        .postType(com.nexus.enums.PostType.IMAGE)
                        .author(user)
                        .build();
                postRepository.save(post);
            }
        }
    }
}
