package com.app.server.controller;

import com.app.server.dto.DonationRequest;
import com.app.server.dto.DonationResponse;
import com.app.server.service.DonationService;
import com.app.server.service.DonationTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class DonationController {

    private final DonationService donationService;
    private final DonationTableService donationTableService;

    /**
     * Create a new donation entry
     * Available to both ADMIN and USER roles
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<DonationResponse> createDonation(@Valid @RequestBody DonationRequest request) {
        log.info("Creating new donation for donor: {}", request.getDonorName());
        
        DonationResponse response = donationService.createDonation(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get donations for a specific year
     * ADMIN: Can see all donations for the year
     * USER: Can see only their own donations for the year
     */
    @GetMapping("/{year}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<DonationResponse> getDonationsByYear(@PathVariable int year) {
        log.info("Retrieving donations for year: {}", year);
        
        // Validate year
        int currentYear = LocalDate.now().getYear();
        if (year < 2000 || year > currentYear + 1) {
            DonationResponse errorResponse = DonationResponse.failure("Invalid year. Year must be between 2000 and " + (currentYear + 1));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        DonationResponse response = donationService.getDonationsByYear(year);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all donations across all years
     * Available only to ADMIN role
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DonationResponse> getAllDonations() {
        log.info("Retrieving all donations across all years");
        
        DonationResponse response = donationService.getAllDonations();
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing donation
     * Available only to ADMIN role
     */
    @PutMapping("/{year}/{donationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DonationResponse> updateDonation(
            @PathVariable int year,
            @PathVariable Long donationId,
            @Valid @RequestBody DonationRequest request) {
        
        log.info("Updating donation ID {} for year {}", donationId, year);
        
        DonationResponse response = donationService.updateDonation(donationId, year, request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Delete a donation
     * Available only to ADMIN role
     */
    @DeleteMapping("/{year}/{donationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DonationResponse> deleteDonation(
            @PathVariable int year,
            @PathVariable Long donationId) {
        
        log.info("Deleting donation ID {} from year {}", donationId, year);
        
        DonationResponse response = donationService.deleteDonation(donationId, year);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get available years with donation data
     * Available to both ADMIN and USER roles
     */
    @GetMapping("/years")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getAvailableYears() {
        log.info("Retrieving available donation years");
        
        try {
            List<Integer> years = donationTableService.getExistingTableYears();
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Available years retrieved successfully",
                "years", years,
                "currentYear", LocalDate.now().getYear()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving available years: {}", e.getMessage());
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Failed to retrieve available years: " + e.getMessage()
            );
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get statistics for a specific year
     * Available to both ADMIN and USER roles
     */
    @GetMapping("/{year}/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getYearStats(@PathVariable int year) {
        log.info("Retrieving statistics for year: {}", year);
        
        try {
            DonationTableService.TableStats stats = donationTableService.getTableStats(year);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Statistics retrieved successfully",
                "year", stats.year(),
                "totalRecords", stats.totalRecords(),
                "firstDonationDate", stats.firstDonationDate(),
                "lastDonationDate", stats.lastDonationDate()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving statistics for year {}: {}", year, e.getMessage());
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Failed to retrieve statistics: " + e.getMessage()
            );
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Health check endpoint for donation service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            int currentYear = LocalDate.now().getYear();
            boolean currentYearTableExists = donationTableService.tableExists(currentYear);
            List<Integer> availableYears = donationTableService.getExistingTableYears();
            
            Map<String, Object> response = Map.of(
                "status", "UP",
                "service", "Donation Management Service",
                "currentYear", currentYear,
                "currentYearTableExists", currentYearTableExists,
                "availableYears", availableYears,
                "totalYears", availableYears.size()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Health check failed: {}", e.getMessage());
            
            Map<String, Object> errorResponse = Map.of(
                "status", "DOWN",
                "service", "Donation Management Service",
                "error", e.getMessage()
            );
            
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }
}
