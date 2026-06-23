package com.nexus.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderUsername;
    private String senderProfileImage;
    private String content;
    private String mediaUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
