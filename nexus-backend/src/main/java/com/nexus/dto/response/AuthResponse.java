package com.nexus.dto.response;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String profileImage;
    private String role;
    private String college;
    private String department;
    private Boolean campusVerified;
    private Boolean openToConnect;
    private List<String> skills;
}
