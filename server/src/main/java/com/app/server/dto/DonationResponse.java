package com.app.server.dto;

import com.app.server.model.Donation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {

    private boolean success;
    private String message;
    private DonationData data;
    private List<DonationData> donations;
    private int totalCount;
    private String year;

    // Static factory methods for different response types
    public static DonationResponse success(String message) {
        return new DonationResponse(true, message, null, null, 0, null);
    }

    public static DonationResponse success(String message, DonationData data) {
        return new DonationResponse(true, message, data, null, 0, null);
    }

    public static DonationResponse success(String message, List<DonationData> donations, int totalCount, String year) {
        return new DonationResponse(true, message, null, donations, totalCount, year);
    }

    public static DonationResponse failure(String message) {
        return new DonationResponse(false, message, null, null, 0, null);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DonationData {
        private Long id;
        private String donorName;
        private String donorAddress;
        private String donorPhone;
        private BigDecimal donationAmount;
        private String donationType;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDate createdDate;
        private String createdBy;
        private LocalDateTime updatedAt;
        private String updatedBy;
        private boolean canEdit;
        private boolean canDelete;

        // Constructor from Donation entity
        public DonationData(Donation donation, boolean canEdit, boolean canDelete) {
            this.id = donation.getId();
            this.donorName = donation.getDonorName();
            this.donorAddress = donation.getDonorAddress();
            this.donorPhone = donation.getDonorPhone();
            this.donationAmount = donation.getDonationAmount();
            this.donationType = donation.getDonationType();
            this.notes = donation.getNotes();
            this.createdAt = donation.getCreatedAt();
            this.createdDate = donation.getCreatedDate();
            this.createdBy = donation.getCreatedBy();
            this.updatedAt = donation.getUpdatedAt();
            this.updatedBy = donation.getUpdatedBy();
            this.canEdit = canEdit;
            this.canDelete = canDelete;
        }

        // Constructor from Donation entity with default permissions
        public DonationData(Donation donation) {
            this(donation, false, false);
        }
    }
}
