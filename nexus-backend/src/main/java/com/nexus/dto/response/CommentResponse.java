package com.nexus.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Long authorId;
    private String authorUsername;
    private String authorProfileImage;
    private Integer likeCount;
    private Long parentId;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;
}
