package com.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SendMessageRequest {
    @NotNull private Long receiverId;
    @NotBlank private String content;
    private String mediaUrl;
}
