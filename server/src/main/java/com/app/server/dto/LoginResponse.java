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
    private String username;
    private User.Role role;
    private String redirectTo;
    private String message;
    private boolean success;
    
    public static LoginResponse success(String token, String username, User.Role role, String redirectTo) {
        return new LoginResponse(token, username, role, redirectTo, "Login successful", true);
    }
    
    public static LoginResponse failure(String message) {
        return new LoginResponse(null, null, null, null, message, false);
    }
}
