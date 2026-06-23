package com.nexus.dto.response;

import com.nexus.enums.MediaType;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoryResponse {
    private Long id;
    private Long userId;
    private String username;
    private String userProfileImage;
    private String mediaUrl;
    private MediaType mediaType;
    private String caption;
    private Integer viewCount;
    private Boolean viewed;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
