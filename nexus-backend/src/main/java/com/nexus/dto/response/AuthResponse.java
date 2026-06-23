package com.nexus.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String profileImage;
    private String role;
}
