package com.nexus.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String bio;
    private String profileImage;
    private String coverImage;
    private String website;
    private String college;
    private String department;
    private String year;
    private String skills;
    private String interests;
    private Integer followerCount;
    private Integer followingCount;
    private Integer postCount;
    private Boolean isPrivate;
    private Boolean isVerified;
    private Boolean isFollowing;
    private String role;
    private LocalDateTime createdAt;
}
