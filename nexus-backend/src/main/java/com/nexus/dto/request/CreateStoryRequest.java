package com.nexus.dto.request;

import com.nexus.enums.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateStoryRequest {
    @NotBlank private String mediaUrl;
    @NotNull private MediaType mediaType;
    private String caption;
}
