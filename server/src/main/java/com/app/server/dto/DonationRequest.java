package com.app.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequest {

    @NotBlank(message = "Donor name is required")
    @Size(min = 2, max = 100, message = "Donor name must be between 2 and 100 characters")
    private String donorName;

    @NotBlank(message = "Donor address is required")
    @Size(min = 5, max = 255, message = "Donor address must be between 5 and 255 characters")
    private String donorAddress;

    @NotBlank(message = "Donor phone is required")
    @Size(min = 10, max = 15, message = "Donor phone must be between 10 and 15 characters")
    private String donorPhone;

    @NotNull(message = "Donation amount is required")
    @Positive(message = "Donation amount must be positive")
    private BigDecimal donationAmount;

    @Size(max = 50, message = "Donation type must not exceed 50 characters")
    private String donationType = "Cash";

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    // Validation method for phone number format
    public boolean isValidPhoneFormat() {
        if (donorPhone == null) return false;
        // Remove all non-digit characters
        String cleanPhone = donorPhone.replaceAll("[^0-9]", "");
        // Check if it's between 10-15 digits
        return cleanPhone.length() >= 10 && cleanPhone.length() <= 15;
    }

    // Helper method to clean phone number
    public String getCleanPhoneNumber() {
        if (donorPhone == null) return null;
        return donorPhone.replaceAll("[^0-9+\\-\\s()]", "").trim();
    }
}
