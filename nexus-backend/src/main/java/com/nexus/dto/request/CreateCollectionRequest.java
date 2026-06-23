package com.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCollectionRequest {
    @NotBlank private String name;
    private String coverImage;
}
