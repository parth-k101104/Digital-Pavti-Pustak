package com.app.server.controller;

import com.app.server.dto.LoginRequest;
import com.app.server.dto.LoginResponse;
import com.app.server.model.User;
import com.app.server.service.JwtService;
import com.app.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getName());

        try {
            LoginResponse response = userService.authenticateUser(loginRequest);

            if (response.isSuccess()) {
                log.info("Login successful for user: {} with role: {}",
                        response.getFullName(), response.getRole());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Login failed for user: {}", loginRequest.getName());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

        } catch (Exception e) {
            log.error("Login error for user: {}", loginRequest.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(LoginResponse.failure("Internal server error"));
        }
    }

    /**
     * Validate token endpoint
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("valid", false);
                response.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String token = authHeader.substring(7);
            String fullName = jwtService.extractFullName(token);
            String role = jwtService.extractRole(token);

            if (jwtService.validateToken(token, fullName)) {
                response.put("valid", true);
                response.put("fullName", fullName);
                response.put("firstName", jwtService.extractFirstName(token));
                response.put("lastName", jwtService.extractLastName(token));
                response.put("role", role);
                response.put("redirectTo", role.equals("ADMIN") ? "HomePage" : "DonationsPage");
                return ResponseEntity.ok(response);
            } else {
                response.put("valid", false);
                response.put("message", "Token expired or invalid");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

        } catch (Exception e) {
            log.error("Token validation error", e);
            response.put("valid", false);
            response.put("message", "Token validation failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Logout endpoint (client-side token removal)
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }

    /**
     * Get current user info
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("error", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String token = authHeader.substring(7);
            String fullName = jwtService.extractFullName(token);
            String firstName = jwtService.extractFirstName(token);
            String lastName = jwtService.extractLastName(token);

            if (jwtService.validateToken(token, fullName)) {
                User user = userService.findByFirstNameAndLastName(firstName, lastName).orElse(null);
                if (user != null) {
                    response.put("id", user.getId());
                    response.put("fullName", fullName);
                    response.put("role", user.getRole());
                    response.put("firstName", user.getFirstName());
                    response.put("lastName", user.getLastName());
                    response.put("phoneNumber", user.getPhoneNumber());
                    response.put("isActive", user.getIsActive());
                    return ResponseEntity.ok(response);
                }
            }

            response.put("error", "User not found or token invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            log.error("Error getting current user", e);
            response.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Admin endpoint to get all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String token = authHeader.substring(7);
            String role = jwtService.extractRole(token);

            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<User> users = userService.getAllActiveUsers();
            return ResponseEntity.ok(users);

        } catch (Exception e) {
            log.error("Error getting all users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
