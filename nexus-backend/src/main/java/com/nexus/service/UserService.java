package com.nexus.service;

import com.nexus.dto.request.UpdateProfileRequest;
import com.nexus.dto.response.UserResponse;
import com.nexus.entity.User;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.FollowRepository;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public UserResponse getUserProfile(Long userId, String currentUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Boolean isFollowing = false;
        if (currentUsername != null) {
            User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null && !currentUser.getId().equals(userId)) {
                isFollowing = followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), userId);
            }
        }

        return mapToResponse(user, isFollowing);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request, String username) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getUsername().equals(username)) {
            throw new com.nexus.exception.UnauthorizedException("Not authorized to update this profile");
        }

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getCoverImage() != null) user.setCoverImage(request.getCoverImage());
        if (request.getWebsite() != null) user.setWebsite(request.getWebsite());
        if (request.getCollege() != null) user.setCollege(request.getCollege());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getYear() != null) user.setYear(request.getYear());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getInterests() != null) user.setInterests(request.getInterests());
        if (request.getIsPrivate() != null) user.setIsPrivate(request.getIsPrivate());

        user = userRepository.save(user);
        return mapToResponse(user, false);
    }

    public Page<UserResponse> searchUsers(String query, int page, int size) {
        return userRepository.searchUsers(query, PageRequest.of(page, size))
                .map(u -> mapToResponse(u, false));
    }

    public Page<UserResponse> getSuggestions(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String college = user.getCollege() != null ? user.getCollege() : "";
        String skill = user.getSkills() != null && !user.getSkills().isEmpty()
                ? user.getSkills().split(",")[0].trim() : "";
        String interest = user.getInterests() != null && !user.getInterests().isEmpty()
                ? user.getInterests().split(",")[0].trim() : "";

        return userRepository.findSuggestedUsers(user.getId(), college, skill, interest, PageRequest.of(page, size))
                .map(u -> {
                    Boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(user.getId(), u.getId());
                    return mapToResponse(u, isFollowing);
                });
    }

    private UserResponse mapToResponse(User user, Boolean isFollowing) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profileImage(user.getProfileImage())
                .coverImage(user.getCoverImage())
                .website(user.getWebsite())
                .college(user.getCollege())
                .department(user.getDepartment())
                .year(user.getYear())
                .skills(user.getSkills())
                .interests(user.getInterests())
                .followerCount(user.getFollowerCount())
                .followingCount(user.getFollowingCount())
                .postCount(user.getPostCount())
                .isPrivate(user.getIsPrivate())
                .isVerified(user.getIsVerified())
                .isFollowing(isFollowing)
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
