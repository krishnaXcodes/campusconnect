package com.nexus.dto.request;

import com.nexus.enums.PostType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePostRequest {
    private String caption;
    private List<String> mediaUrls;
    private String location;
    private List<String> hashtags;
    @NotNull private PostType postType;
}
