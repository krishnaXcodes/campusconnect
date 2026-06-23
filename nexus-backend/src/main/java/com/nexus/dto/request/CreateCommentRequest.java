package com.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCommentRequest {
    @NotBlank private String content;
    private Long parentId;
}
