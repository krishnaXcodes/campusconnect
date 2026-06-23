package com.nexus.service;

import com.nexus.dto.request.CreateStoryRequest;
import com.nexus.dto.response.StoryGroupResponse;
import com.nexus.dto.response.StoryResponse;
import com.nexus.entity.*;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final StoryViewRepository storyViewRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    @Transactional
    public StoryResponse createStory(CreateStoryRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Story story = Story.builder()
                .user(user)
                .mediaUrl(request.getMediaUrl())
                .mediaType(request.getMediaType())
                .caption(request.getCaption())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        story = storyRepository.save(story);
        return mapToResponse(story, false);
    }

    public List<StoryGroupResponse> getStoryFeed(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Long> followingIds = followRepository.findFollowingIds(user.getId());
        followingIds.add(user.getId()); // include own stories

        LocalDateTime now = LocalDateTime.now();
        List<Long> usersWithStories = storyRepository.findUserIdsWithActiveStories(followingIds, now);

        List<StoryGroupResponse> groups = new ArrayList<>();

        for (Long userId : usersWithStories) {
            User storyUser = userRepository.findById(userId).orElse(null);
            if (storyUser == null) continue;

            List<Story> stories = storyRepository.findActiveStoriesByUserId(userId, now);
            boolean hasUnviewed = stories.stream()
                    .anyMatch(s -> !storyViewRepository.existsByStoryIdAndViewerId(s.getId(), user.getId()));

            List<StoryResponse> storyResponses = stories.stream()
                    .map(s -> {
                        boolean viewed = storyViewRepository.existsByStoryIdAndViewerId(s.getId(), user.getId());
                        return mapToResponse(s, viewed);
                    })
                    .collect(Collectors.toList());

            groups.add(StoryGroupResponse.builder()
                    .userId(userId)
                    .username(storyUser.getUsername())
                    .userProfileImage(storyUser.getProfileImage())
                    .hasUnviewed(hasUnviewed)
                    .stories(storyResponses)
                    .build());
        }

        // Sort: own stories first, then unviewed, then viewed
        groups.sort((a, b) -> {
            if (a.getUserId().equals(user.getId())) return -1;
            if (b.getUserId().equals(user.getId())) return 1;
            if (a.getHasUnviewed() && !b.getHasUnviewed()) return -1;
            if (!a.getHasUnviewed() && b.getHasUnviewed()) return 1;
            return 0;
        });

        return groups;
    }

    @Transactional
    public void viewStory(Long storyId, String username) {
        User viewer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        if (!storyViewRepository.existsByStoryIdAndViewerId(storyId, viewer.getId())) {
            storyViewRepository.save(StoryView.builder().story(story).viewer(viewer).build());
            story.setViewCount(story.getViewCount() + 1);
            storyRepository.save(story);
        }
    }

    @Transactional
    public void deleteStory(Long storyId, String username) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getUser().getUsername().equals(username)) {
            throw new com.nexus.exception.UnauthorizedException("Not authorized");
        }
        storyRepository.delete(story);
    }

    private StoryResponse mapToResponse(Story story, boolean viewed) {
        return StoryResponse.builder()
                .id(story.getId())
                .userId(story.getUser().getId())
                .username(story.getUser().getUsername())
                .userProfileImage(story.getUser().getProfileImage())
                .mediaUrl(story.getMediaUrl())
                .mediaType(story.getMediaType())
                .caption(story.getCaption())
                .viewCount(story.getViewCount())
                .viewed(viewed)
                .expiresAt(story.getExpiresAt())
                .createdAt(story.getCreatedAt())
                .build();
    }
}
