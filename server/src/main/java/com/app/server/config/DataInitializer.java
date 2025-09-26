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
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setEmail("admin@digitalpavti.com");
            admin.setIsActive(true);
            
            userRepository.save(admin);
            log.info("Created admin user: admin/admin123");
        }
        
        // Create regular user if not exists
        if (!userRepository.existsByUsername("user")) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(User.Role.USER);
            user.setFirstName("Regular");
            user.setLastName("User");
            user.setEmail("user@digitalpavti.com");
            user.setIsActive(true);
            
            userRepository.save(user);
            log.info("Created regular user: user/user123");
        }
        
        // Create demo users
        if (!userRepository.existsByUsername("demo_admin")) {
            User demoAdmin = new User();
            demoAdmin.setUsername("demo_admin");
            demoAdmin.setPassword(passwordEncoder.encode("demo123"));
            demoAdmin.setRole(User.Role.ADMIN);
            demoAdmin.setFirstName("Demo");
            demoAdmin.setLastName("Admin");
            demoAdmin.setEmail("demo.admin@digitalpavti.com");
            demoAdmin.setPhoneNumber("+91-9876543210");
            demoAdmin.setIsActive(true);
            
            userRepository.save(demoAdmin);
            log.info("Created demo admin user: demo_admin/demo123");
        }
        
        if (!userRepository.existsByUsername("demo_user")) {
            User demoUser = new User();
            demoUser.setUsername("demo_user");
            demoUser.setPassword(passwordEncoder.encode("demo123"));
            demoUser.setRole(User.Role.USER);
            demoUser.setFirstName("Demo");
            demoUser.setLastName("User");
            demoUser.setEmail("demo.user@digitalpavti.com");
            demoUser.setPhoneNumber("+91-9876543211");
            demoUser.setIsActive(true);
            
            userRepository.save(demoUser);
            log.info("Created demo user: demo_user/demo123");
        }
        
        log.info("User initialization completed. Total users: {}", userRepository.count());
    }
}
