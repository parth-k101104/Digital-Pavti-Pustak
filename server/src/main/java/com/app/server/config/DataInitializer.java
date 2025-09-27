package com.app.server.config;

import com.app.server.model.User;
import com.app.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
    }

    private void initializeUsers() {
        log.info("Initializing default users...");

        // Create admin user if not exists
        if (!userRepository.existsByFirstNameAndLastName("System", "Administrator")) {
            User admin = new User();
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setPhoneNumber("9999999999");
            admin.setIsActive(true);

            userRepository.save(admin);
            log.info("Created admin user: System_Administrator/admin123");
        }

        // Create regular user if not exists
        if (!userRepository.existsByFirstNameAndLastName("Regular", "User")) {
            User user = new User();
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(User.Role.USER);
            user.setFirstName("Regular");
            user.setLastName("User");
            user.setPhoneNumber("8888888888");
            user.setIsActive(true);

            userRepository.save(user);
            log.info("Created regular user: Regular_User/user123");
        }

        // Create demo users
        if (!userRepository.existsByFirstNameAndLastName("Demo", "Admin")) {
            User demoAdmin = new User();
            demoAdmin.setPassword(passwordEncoder.encode("demo123"));
            demoAdmin.setRole(User.Role.ADMIN);
            demoAdmin.setFirstName("Demo");
            demoAdmin.setLastName("Admin");
            demoAdmin.setPhoneNumber("9876543210");
            demoAdmin.setIsActive(true);

            userRepository.save(demoAdmin);
            log.info("Created demo admin user: Demo_Admin/demo123");
        }

        if (!userRepository.existsByFirstNameAndLastName("Demo", "User")) {
            User demoUser = new User();
            demoUser.setPassword(passwordEncoder.encode("demo123"));
            demoUser.setRole(User.Role.USER);
            demoUser.setFirstName("Demo");
            demoUser.setLastName("User");
            demoUser.setPhoneNumber("9876543211");
            demoUser.setIsActive(true);

            userRepository.save(demoUser);
            log.info("Created demo user: Demo_User/demo123");
        }

        log.info("User initialization completed. Total users: {}", userRepository.count());
    }
}
