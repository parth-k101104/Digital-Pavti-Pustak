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
            // Validate name format
            if (!loginRequest.isValidNameFormat()) {
                log.warn("Invalid name format provided: {}", loginRequest.getName());
                return LoginResponse.failure("Invalid name format. Please use 'firstName_lastName' format.");
            }

            String firstName = loginRequest.getFirstName();
            String lastName = loginRequest.getLastName();

            log.debug("Attempting to authenticate user: {}_{}", firstName, lastName);

            Optional<User> userOptional = userRepository.findActiveUserByFirstNameAndLastName(firstName, lastName);

            if (userOptional.isEmpty()) {
                log.warn("User not found or inactive: {}_{}", firstName, lastName);
                return LoginResponse.failure("Invalid name or password");
            }

            User user = userOptional.get();

            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                log.warn("Invalid password for user: {}_{}", firstName, lastName);
                return LoginResponse.failure("Invalid name or password");
            }

            // Generate JWT token
            String token = jwtService.generateToken(user);

            // Determine redirect based on role
            String redirectTo = determineRedirectPath(user.getRole());

            log.info("User authenticated successfully: {}_{} with role: {}", firstName, lastName, user.getRole());

            return LoginResponse.success(token, firstName, lastName, user.getRole(), redirectTo);

        } catch (Exception e) {
            log.error("Error during authentication for user: {}", loginRequest.getName(), e);
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
        log.debug("Creating new user: {}_{}", user.getFirstName(), user.getLastName());

        if (userRepository.existsByFirstNameAndLastName(user.getFirstName(), user.getLastName())) {
            throw new RuntimeException("User already exists: " + user.getFirstName() + "_" + user.getLastName());
        }

        if (user.getPhoneNumber() != null && userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists: " + user.getPhoneNumber());
        }

        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set default values
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }

        User savedUser = userRepository.save(user);
        log.info("User created successfully: {}_{}", savedUser.getFirstName(), savedUser.getLastName());

        return savedUser;
    }

    /**
     * Find user by firstName and lastName
     */
    @Transactional(readOnly = true)
    public Optional<User> findByFirstNameAndLastName(String firstName, String lastName) {
        return userRepository.findByFirstNameAndLastName(firstName, lastName);
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
     * Deactivate user by firstName and lastName
     */
    public void deactivateUser(String firstName, String lastName) {
        Optional<User> userOptional = userRepository.findByFirstNameAndLastName(firstName, lastName);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsActive(false);
            userRepository.save(user);
            log.info("User deactivated: {}_{}", firstName, lastName);
        }
    }

    /**
     * Update user password by firstName and lastName
     */
    public void updatePassword(String firstName, String lastName, String newPassword) {
        Optional<User> userOptional = userRepository.findByFirstNameAndLastName(firstName, lastName);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            log.info("Password updated for user: {}_{}", firstName, lastName);
        }
    }
}
