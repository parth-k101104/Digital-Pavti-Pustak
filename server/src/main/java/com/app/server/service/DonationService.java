package com.app.server.service;

import com.app.server.dto.DonationRequest;
import com.app.server.dto.DonationResponse;
import com.app.server.model.Donation;
import com.app.server.model.User;
import com.app.server.repository.DonationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonationTableService donationTableService;
    private final JwtService jwtService;

    /**
     * Create a new donation entry
     */
    public DonationResponse createDonation(DonationRequest request) {
        try {
            // Get current user information
            String currentUser = getCurrentUserFullName();
            if (currentUser == null) {
                return DonationResponse.failure("Authentication required");
            }

            // Validate request
            if (!request.isValidPhoneFormat()) {
                return DonationResponse.failure("Invalid phone number format");
            }

            // Get current year and ensure table exists
            int currentYear = LocalDate.now().getYear();
            donationTableService.ensureTableExistsForYear(currentYear);

            // Create donation entity
            Donation donation = new Donation(
                request.getDonorName().trim(),
                request.getDonorAddress().trim(),
                request.getCleanPhoneNumber(),
                request.getDonationAmount(),
                request.getDonationType() != null ? request.getDonationType().trim() : "Cash",
                request.getNotes() != null ? request.getNotes().trim() : null,
                currentUser
            );

            // Save donation
            Donation savedDonation = donationRepository.save(donation, currentYear);
            
            // Create response data
            DonationResponse.DonationData responseData = new DonationResponse.DonationData(savedDonation);
            
            log.info("Successfully created donation ID {} for donor {} by user {}", 
                    savedDonation.getId(), savedDonation.getDonorName(), currentUser);
            
            return DonationResponse.success("Donation created successfully", responseData);
            
        } catch (Exception e) {
            log.error("Error creating donation: {}", e.getMessage());
            return DonationResponse.failure("Failed to create donation: " + e.getMessage());
        }
    }

    /**
     * Get donations for a specific year with role-based filtering
     */
    public DonationResponse getDonationsByYear(int year) {
        try {
            String currentUser = getCurrentUserFullName();
            User.Role userRole = getCurrentUserRole();
            
            if (currentUser == null || userRole == null) {
                return DonationResponse.failure("Authentication required");
            }

            // Check if table exists for the year
            if (!donationTableService.tableExists(year)) {
                return DonationResponse.success("No donations found for year " + year, 
                        List.of(), 0, String.valueOf(year));
            }

            List<Donation> donations;
            
            // Role-based data access
            if (userRole == User.Role.ADMIN) {
                // Admins can see all donations
                donations = donationRepository.findAllByYear(year);
            } else {
                // Users can only see their own donations
                donations = donationRepository.findByCreatedByAndYear(currentUser, year);
            }

            // Convert to response data with permissions
            List<DonationResponse.DonationData> responseData = donations.stream()
                    .map(donation -> {
                        boolean canEdit = userRole == User.Role.ADMIN;
                        boolean canDelete = userRole == User.Role.ADMIN;
                        return new DonationResponse.DonationData(donation, canEdit, canDelete);
                    })
                    .toList();

            log.info("Retrieved {} donations for year {} for user {} (role: {})", 
                    donations.size(), year, currentUser, userRole);
            
            return DonationResponse.success("Donations retrieved successfully", 
                    responseData, donations.size(), String.valueOf(year));
            
        } catch (Exception e) {
            log.error("Error retrieving donations for year {}: {}", year, e.getMessage());
            return DonationResponse.failure("Failed to retrieve donations: " + e.getMessage());
        }
    }

    /**
     * Get all donations across all years (ADMIN only)
     */
    public DonationResponse getAllDonations() {
        try {
            User.Role userRole = getCurrentUserRole();
            String currentUser = getCurrentUserFullName();
            
            if (userRole != User.Role.ADMIN) {
                return DonationResponse.failure("Access denied. Admin privileges required.");
            }

            List<Integer> existingYears = donationTableService.getExistingTableYears();
            List<DonationResponse.DonationData> allDonations = existingYears.stream()
                    .flatMap(year -> donationRepository.findAllByYear(year).stream())
                    .map(donation -> new DonationResponse.DonationData(donation, true, true))
                    .toList();

            log.info("Retrieved {} total donations across {} years for admin user {}", 
                    allDonations.size(), existingYears.size(), currentUser);
            
            return DonationResponse.success("All donations retrieved successfully", 
                    allDonations, allDonations.size(), "all");
            
        } catch (Exception e) {
            log.error("Error retrieving all donations: {}", e.getMessage());
            return DonationResponse.failure("Failed to retrieve all donations: " + e.getMessage());
        }
    }

    /**
     * Update an existing donation (ADMIN only)
     */
    public DonationResponse updateDonation(Long donationId, int year, DonationRequest request) {
        try {
            User.Role userRole = getCurrentUserRole();
            String currentUser = getCurrentUserFullName();
            
            if (userRole != User.Role.ADMIN) {
                return DonationResponse.failure("Access denied. Admin privileges required.");
            }

            // Validate request
            if (!request.isValidPhoneFormat()) {
                return DonationResponse.failure("Invalid phone number format");
            }

            // Find existing donation
            Optional<Donation> existingDonation = donationRepository.findByIdAndYear(donationId, year);
            if (existingDonation.isEmpty()) {
                return DonationResponse.failure("Donation not found");
            }

            // Update donation fields
            Donation donation = existingDonation.get();
            donation.setDonorName(request.getDonorName().trim());
            donation.setDonorAddress(request.getDonorAddress().trim());
            donation.setDonorPhone(request.getCleanPhoneNumber());
            donation.setDonationAmount(request.getDonationAmount());
            donation.setDonationType(request.getDonationType() != null ? request.getDonationType().trim() : "Cash");
            donation.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

            // Save updated donation
            boolean updated = donationRepository.update(donation, year, currentUser);
            
            if (!updated) {
                return DonationResponse.failure("Failed to update donation");
            }

            DonationResponse.DonationData responseData = new DonationResponse.DonationData(donation, true, true);
            
            log.info("Successfully updated donation ID {} in year {} by admin user {}", 
                    donationId, year, currentUser);
            
            return DonationResponse.success("Donation updated successfully", responseData);
            
        } catch (Exception e) {
            log.error("Error updating donation ID {} in year {}: {}", donationId, year, e.getMessage());
            return DonationResponse.failure("Failed to update donation: " + e.getMessage());
        }
    }

    /**
     * Delete a donation (ADMIN only)
     */
    public DonationResponse deleteDonation(Long donationId, int year) {
        try {
            User.Role userRole = getCurrentUserRole();
            String currentUser = getCurrentUserFullName();
            
            if (userRole != User.Role.ADMIN) {
                return DonationResponse.failure("Access denied. Admin privileges required.");
            }

            // Check if donation exists
            Optional<Donation> existingDonation = donationRepository.findByIdAndYear(donationId, year);
            if (existingDonation.isEmpty()) {
                return DonationResponse.failure("Donation not found");
            }

            // Delete donation
            boolean deleted = donationRepository.deleteByIdAndYear(donationId, year);
            
            if (!deleted) {
                return DonationResponse.failure("Failed to delete donation");
            }

            log.info("Successfully deleted donation ID {} from year {} by admin user {}", 
                    donationId, year, currentUser);
            
            return DonationResponse.success("Donation deleted successfully");
            
        } catch (Exception e) {
            log.error("Error deleting donation ID {} from year {}: {}", donationId, year, e.getMessage());
            return DonationResponse.failure("Failed to delete donation: " + e.getMessage());
        }
    }

    /**
     * Get current user's full name from security context
     */
    private String getCurrentUserFullName() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName(); // This should be the fullName from JWT
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get current user's role from security context
     */
    private User.Role getCurrentUserRole() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                // Extract role from authorities
                return authentication.getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .filter(auth -> auth.startsWith("ROLE_"))
                        .map(auth -> auth.substring(5)) // Remove "ROLE_" prefix
                        .map(User.Role::valueOf)
                        .findFirst()
                        .orElse(null);
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting current user role: {}", e.getMessage());
            return null;
        }
    }
}
