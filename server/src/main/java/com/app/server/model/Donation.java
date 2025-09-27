package com.app.server.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "donor_name", nullable = false)
    @NotBlank(message = "Donor name is required")
    @Size(min = 2, max = 100, message = "Donor name must be between 2 and 100 characters")
    private String donorName;

    @Column(name = "donor_address", nullable = false)
    @NotBlank(message = "Donor address is required")
    @Size(min = 5, max = 255, message = "Donor address must be between 5 and 255 characters")
    private String donorAddress;

    @Column(name = "donor_phone", nullable = false)
    @NotBlank(message = "Donor phone is required")
    @Size(min = 10, max = 15, message = "Donor phone must be between 10 and 15 characters")
    private String donorPhone;

    @Column(name = "donation_amount", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Donation amount is required")
    @Positive(message = "Donation amount must be positive")
    private BigDecimal donationAmount;

    @Column(name = "donation_type")
    @Size(max = 50, message = "Donation type must not exceed 50 characters")
    private String donationType = "Cash";

    @Column(name = "notes")
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    // Audit fields - automatically populated
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDate createdDate;

    @Column(name = "created_by", nullable = false, updatable = false)
    @NotBlank(message = "Created by is required")
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    // Constructor for creating new donations
    public Donation(String donorName, String donorAddress, String donorPhone, 
                   BigDecimal donationAmount, String donationType, String notes, String createdBy) {
        this.donorName = donorName;
        this.donorAddress = donorAddress;
        this.donorPhone = donorPhone;
        this.donationAmount = donationAmount;
        this.donationType = donationType;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdDate = LocalDate.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper method to get the table name for a specific year
    public static String getTableName(int year) {
        return "donations_" + year;
    }

    // Helper method to get current year table name
    public static String getCurrentYearTableName() {
        return getTableName(LocalDate.now().getYear());
    }

    // Enum for donation types
    public enum DonationType {
        CASH("Cash"),
        CHEQUE("Cheque"),
        ONLINE("Online Transfer"),
        KIND("In Kind"),
        OTHER("Other");

        private final String displayName;

        DonationType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
