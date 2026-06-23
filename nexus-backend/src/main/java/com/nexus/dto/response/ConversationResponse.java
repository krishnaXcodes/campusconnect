package com.nexus.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConversationResponse {
    private Long id;
    private Long otherUserId;
    private String otherUsername;
    private String otherUserProfileImage;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
