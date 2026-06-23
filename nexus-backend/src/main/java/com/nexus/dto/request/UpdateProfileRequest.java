package com.nexus.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateProfileRequest {
    private String fullName;
    private String bio;
    private String profileImage;
    private String coverImage;
    private String website;
    private String college;
    private String department;
    private String year;
    private String skills;
    private String interests;
    private Boolean isPrivate;
}
