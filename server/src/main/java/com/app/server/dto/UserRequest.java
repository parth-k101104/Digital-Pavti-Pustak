package com.app.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank
    private String firstName;

    private String lastName;

    @NotBlank
    private String password;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    @NotBlank
    private String role; // ADMIN or USER

    private boolean isActive;
}
