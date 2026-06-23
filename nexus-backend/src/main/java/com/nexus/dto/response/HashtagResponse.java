package com.nexus.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HashtagResponse {
    private Long id;
    private String name;
    private Integer postCount;
}
