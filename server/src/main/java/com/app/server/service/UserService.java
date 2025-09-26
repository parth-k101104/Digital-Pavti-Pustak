package com.app.server.service;

import com.app.server.dto.LoginRequest;
import com.app.server.dto.LoginResponse;
import com.app.server.model.User;
import com.app.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    /**
     * Authenticate user and return login response with role-based routing
     */
    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        try {
            log.debug("Attempting to authenticate user: {}", loginRequest.getUsername());
            
            Optional<User> userOptional = userRepository.findActiveUserByUsername(loginRequest.getUsername());
            
            if (userOptional.isEmpty()) {
                log.warn("User not found or inactive: {}", loginRequest.getUsername());
                return LoginResponse.failure("Invalid username or password");
            }
            
            User user = userOptional.get();
            
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                log.warn("Invalid password for user: {}", loginRequest.getUsername());
                return LoginResponse.failure("Invalid username or password");
            }
            
            // Generate JWT token
            String token = jwtService.generateToken(user);
            
            // Determine redirect based on role
            String redirectTo = determineRedirectPath(user.getRole());
            
            log.info("User authenticated successfully: {} with role: {}", user.getUsername(), user.getRole());
            
            return LoginResponse.success(token, user.getUsername(), user.getRole(), redirectTo);
            
        } catch (Exception e) {
            log.error("Error during authentication for user: {}", loginRequest.getUsername(), e);
            return LoginResponse.failure("Authentication failed. Please try again.");
        }
    }
    
    /**
     * Determine redirect path based on user role
     */
    private String determineRedirectPath(User.Role role) {
        return switch (role) {
            case ADMIN -> "HomePage";
            case USER -> "DonationsPage";
        };
    }
    
    /**
     * Create a new user with encrypted password
     */
    public User createUser(User user) {
        log.debug("Creating new user: {}", user.getUsername());
        
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }
        
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        
        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully: {}", savedUser.getUsername());
        
        return savedUser;
    }
    
    /**
     * Find user by username
     */
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Get all active users
     */
    @Transactional(readOnly = true)
    public List<User> getAllActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }
    
    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findActiveUsersByRole(role);
    }
    
    /**
     * Deactivate user
     */
    public void deactivateUser(String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsActive(false);
            userRepository.save(user);
            log.info("User deactivated: {}", username);
        }
    }
    
    /**
     * Update user password
     */
    public void updatePassword(String username, String newPassword) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            log.info("Password updated for user: {}", username);
        }
    }
}
