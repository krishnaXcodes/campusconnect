package com.nexus.dto.response;

import com.nexus.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private Long senderId;
    private String senderUsername;
    private String senderProfileImage;
    private Long postId;
    private String postThumbnail;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
