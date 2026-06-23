package com.nexus.service;

import com.nexus.dto.response.UserResponse;
import com.nexus.entity.Follow;
import com.nexus.entity.Notification;
import com.nexus.entity.User;
import com.nexus.enums.NotificationType;
import com.nexus.exception.BadRequestException;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.FollowRepository;
import com.nexus.repository.NotificationRepository;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void follow(Long targetUserId, String username) {
        User follower = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        if (follower.getId().equals(targetUserId)) {
            throw new BadRequestException("Cannot follow yourself");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(follower.getId(), targetUserId)) {
            throw new BadRequestException("Already following this user");
        }

        followRepository.save(Follow.builder().follower(follower).following(following).build());

        follower.setFollowingCount(follower.getFollowingCount() + 1);
        following.setFollowerCount(following.getFollowerCount() + 1);
        userRepository.save(follower);
        userRepository.save(following);

        // Notification
        notificationRepository.save(Notification.builder()
                .recipient(following).sender(follower)
                .type(NotificationType.FOLLOW)
                .message(follower.getUsername() + " started following you")
                .build());
    }

    @Transactional
    public void unfollow(Long targetUserId, String username) {
        User follower = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Follow follow = followRepository.findByFollowerIdAndFollowingId(follower.getId(), targetUserId)
                .orElseThrow(() -> new BadRequestException("Not following this user"));

        followRepository.delete(follow);

        follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
        User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        following.setFollowerCount(Math.max(0, following.getFollowerCount() - 1));
        userRepository.save(follower);
        userRepository.save(following);
    }

    public Page<UserResponse> getFollowers(Long userId, int page, int size) {
        return followRepository.findByFollowingIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(f -> mapUserResponse(f.getFollower()));
    }

    public Page<UserResponse> getFollowing(Long userId, int page, int size) {
        return followRepository.findByFollowerIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(f -> mapUserResponse(f.getFollowing()));
    }

    private UserResponse mapUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .followerCount(user.getFollowerCount())
                .followingCount(user.getFollowingCount())
                .postCount(user.getPostCount())
                .isVerified(user.getIsVerified())
                .build();
    }
}
