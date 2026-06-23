package com.nexus.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CollectionResponse {
    private Long id;
    private String name;
    private String coverImage;
    private Boolean isDefault;
    private Long postCount;
    private LocalDateTime createdAt;
}
