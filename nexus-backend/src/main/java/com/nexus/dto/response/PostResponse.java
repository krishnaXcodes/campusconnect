package com.nexus.dto.response;

import com.nexus.enums.PostType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostResponse {
    private Long id;
    private String caption;
    private List<String> mediaUrls;
    private String location;
    private PostType postType;
    private Long authorId;
    private String authorUsername;
    private String authorFullName;
    private String authorProfileImage;
    private Integer likeCount;
    private Integer commentCount;
    private Integer shareCount;
    private Boolean liked;
    private Boolean bookmarked;
    private List<String> hashtags;
    private String feedReason;
    private String feedReasonDetail;
    private LocalDateTime createdAt;
}
