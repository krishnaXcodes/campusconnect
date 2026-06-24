package com.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EditMessageRequest {
    @NotBlank(message = "Content cannot be blank")
    private String content;
}
