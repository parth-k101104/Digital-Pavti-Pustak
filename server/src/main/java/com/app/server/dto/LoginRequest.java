package com.app.server.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Name is required in format 'firstName_lastName'")
    private String name;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * Parse the name field to extract firstName
     */
    public String getFirstName() {
        if (name != null && name.contains("_")) {
            return name.split("_")[0];
        }
        return null;
    }

    /**
     * Parse the name field to extract lastName
     */
    public String getLastName() {
        if (name != null && name.contains("_")) {
            String[] parts = name.split("_");
            if (parts.length > 1) {
                return parts[1];
            }
        }
        return null;
    }

    /**
     * Validate the name format
     */
    public boolean isValidNameFormat() {
        return name != null && name.contains("_") && name.split("_").length == 2
                && !name.startsWith("_") && !name.endsWith("_");
    }
}
