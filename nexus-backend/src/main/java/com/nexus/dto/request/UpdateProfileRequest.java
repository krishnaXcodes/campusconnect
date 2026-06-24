package com.nexus.dto.request;

import lombok.*;
import java.util.List;

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
    private List<String> skills;
    private String interests;
    private Boolean isPrivate;
}
