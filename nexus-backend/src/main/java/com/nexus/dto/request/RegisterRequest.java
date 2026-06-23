package com.nexus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50) private String username;
    @NotBlank private String fullName;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6) private String password;
    private String college;
    private String department;
    private String year;
    private String skills;
    private String interests;
}
