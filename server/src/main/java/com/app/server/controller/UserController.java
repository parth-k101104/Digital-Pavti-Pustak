package com.app.server.controller;

import com.app.server.model.User;
import com.app.server.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;

    /**
     * Create a new user
     * Only ADMIN can create users
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {
        try {
            log.info("Creating new user: {}_{}", user.getFirstName(), user.getLastName());
            User createdUser = userService.createUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "User created successfully",
                    "user", createdUser
            ));
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get all active users
     * Only ADMIN can view all users
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllActiveUsers() {
        log.info("Fetching all active users");
        List<User> users = userService.getAllActiveUsers();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Active users retrieved successfully",
                "users", users,
                "totalCount", users.size()
        ));
    }

    /**
     * Get users by role
     * Only ADMIN can access this
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUsersByRole(@PathVariable String role) {
        try {
            log.info("Fetching users with role: {}", role);
            User.Role roleEnum = User.Role.valueOf(role.toUpperCase());
            List<User> users = userService.getUsersByRole(roleEnum);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Users fetched by role successfully",
                    "users", users,
                    "totalCount", users.size()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", "Invalid role specified. Must be ADMIN or USER."
            ));
        }
    }

    /**
     * Deactivate a user
     * Only ADMIN can deactivate users
     */
    @PutMapping("/deactivate/{firstName}/{lastName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deactivateUser(
            @PathVariable String firstName,
            @PathVariable String lastName) {

        try {
            userService.deactivateUser(firstName, lastName);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User deactivated successfully"
            ));
        } catch (Exception e) {
            log.error("Error deactivating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to deactivate user: " + e.getMessage()
            ));
        }
    }

    /**
     * Update a user's password
     * Accessible to ADMIN and USER
     */
    @PutMapping("/update-password/{firstName}/{lastName}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> updatePassword(
            @PathVariable String firstName,
            @PathVariable String lastName,
            @RequestParam String newPassword) {

        try {
            userService.updatePassword(firstName, lastName, newPassword);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to update password: " + e.getMessage()
            ));
        }
    }

    /**
     * Health check endpoint for User service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "User Management Service"
        ));
    }
}
