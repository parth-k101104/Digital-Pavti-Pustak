package com.app.server.dto;

import com.app.server.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String firstName;
    private String lastName;
    private String fullName; // firstName_lastName format
    private User.Role role;
    private String redirectTo;
    private String message;
    private boolean success;

    public static LoginResponse success(String token, String firstName, String lastName, User.Role role,
            String redirectTo) {
        String fullName = firstName + "_" + lastName;
        return new LoginResponse(token, firstName, lastName, fullName, role, redirectTo, "Login successful", true);
    }

    public static LoginResponse failure(String message) {
        return new LoginResponse(null, null, null, null, null, null, message, false);
    }
}
