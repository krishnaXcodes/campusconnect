package com.nexus.dto.response;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoryGroupResponse {
    private Long userId;
    private String username;
    private String userProfileImage;
    private Boolean hasUnviewed;
    private List<StoryResponse> stories;
}
