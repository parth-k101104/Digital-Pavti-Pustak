package com.app.server.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Digital Pavti Pustak Backend");
        response.put("version", "1.0.0");
        
        log.debug("Health check requested");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "Digital Pavti Pustak");
        response.put("description", "Backend API for Digital Pavti Pustak with role-based authentication");
        response.put("version", "1.0.0");
        response.put("endpoints", Map.of(
            "login", "/api/auth/login",
            "validate", "/api/auth/validate",
            "me", "/api/auth/me",
            "health", "/api/health"
        ));
        
        return ResponseEntity.ok(response);
    }
}
