package com.app.server.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class UserResponse {
    private boolean success;
    private String message;
    private List<Map<String, Object>> users;
    private Map<String, Object> user;

    public static UserResponse success(String message, List<Map<String, Object>> users) {
        return UserResponse.builder()
                .success(true)
                .message(message)
                .users(users)
                .build();
    }

    public static UserResponse success(String message, Map<String, Object> user) {
        return UserResponse.builder()
                .success(true)
                .message(message)
                .user(user)
                .build();
    }

    public static UserResponse failure(String message) {
        return UserResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
