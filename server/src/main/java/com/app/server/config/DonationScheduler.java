package com.app.server.config;

import com.app.server.service.DonationTableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DonationScheduler {

    private final DonationTableService donationTableService;

    /**
     * Initialize donation table for current year on application startup
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeCurrentYearTable() {
        try {
            int currentYear = LocalDate.now().getYear();
            log.info("Application startup: Checking donation table for current year {}", currentYear);
            
            if (!donationTableService.tableExists(currentYear)) {
                log.info("Creating donation table for current year: {}", currentYear);
                donationTableService.createTableForYear(currentYear);
                log.info("Successfully created donation table for year: {}", currentYear);
            } else {
                log.info("Donation table for current year {} already exists", currentYear);
            }
            
        } catch (Exception e) {
            log.error("Failed to initialize donation table for current year: {}", e.getMessage());
        }
    }

    /**
     * Daily check to ensure current year table exists
     * Runs every day at 1:00 AM
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void dailyTableCheck() {
        try {
            int currentYear = LocalDate.now().getYear();
            log.debug("Daily check: Ensuring donation table exists for year {}", currentYear);
            
            donationTableService.ensureTableExistsForYear(currentYear);
            
            log.debug("Daily table check completed successfully for year {}", currentYear);
            
        } catch (Exception e) {
            log.error("Daily table check failed: {}", e.getMessage());
        }
    }

    /**
     * New Year preparation job
     * Runs on January 1st at 12:01 AM to create the new year's table
     */
    @Scheduled(cron = "0 1 0 1 1 *")
    public void newYearTableCreation() {
        try {
            int newYear = LocalDate.now().getYear();
            log.info("New Year detected: Creating donation table for year {}", newYear);
            
            donationTableService.ensureTableExistsForYear(newYear);
            
            log.info("Successfully prepared donation table for new year: {}", newYear);
            
        } catch (Exception e) {
            log.error("Failed to create table for new year: {}", e.getMessage());
        }
    }

    /**
     * Weekly maintenance job
     * Runs every Sunday at 2:00 AM to perform maintenance tasks
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    public void weeklyMaintenance() {
        try {
            log.info("Starting weekly donation table maintenance");
            
            // Get all existing table years
            var existingYears = donationTableService.getExistingTableYears();
            log.info("Found donation tables for years: {}", existingYears);
            
            // Log statistics for each year
            for (Integer year : existingYears) {
                try {
                    var stats = donationTableService.getTableStats(year);
                    log.info("Year {} statistics: {} records, first: {}, last: {}", 
                            stats.year(), stats.totalRecords(), 
                            stats.firstDonationDate(), stats.lastDonationDate());
                } catch (Exception e) {
                    log.warn("Failed to get statistics for year {}: {}", year, e.getMessage());
                }
            }
            
            // Ensure current year table exists
            int currentYear = LocalDate.now().getYear();
            donationTableService.ensureTableExistsForYear(currentYear);
            
            log.info("Weekly maintenance completed successfully");
            
        } catch (Exception e) {
            log.error("Weekly maintenance failed: {}", e.getMessage());
        }
    }

    /**
     * Monthly report job
     * Runs on the 1st day of each month at 3:00 AM
     */
    @Scheduled(cron = "0 0 3 1 * *")
    public void monthlyReport() {
        try {
            log.info("Generating monthly donation system report");
            
            int currentYear = LocalDate.now().getYear();
            var existingYears = donationTableService.getExistingTableYears();
            
            log.info("=== MONTHLY DONATION SYSTEM REPORT ===");
            log.info("Report Date: {}", LocalDateTime.now());
            log.info("Current Year: {}", currentYear);
            log.info("Total Years with Data: {}", existingYears.size());
            log.info("Available Years: {}", existingYears);
            
            // Current year statistics
            if (donationTableService.tableExists(currentYear)) {
                var currentYearStats = donationTableService.getTableStats(currentYear);
                log.info("Current Year ({}) Statistics:", currentYear);
                log.info("  - Total Records: {}", currentYearStats.totalRecords());
                log.info("  - First Donation: {}", currentYearStats.firstDonationDate());
                log.info("  - Last Donation: {}", currentYearStats.lastDonationDate());
            } else {
                log.info("Current Year ({}) Table: NOT CREATED YET", currentYear);
            }
            
            log.info("=== END MONTHLY REPORT ===");
            
        } catch (Exception e) {
            log.error("Monthly report generation failed: {}", e.getMessage());
        }
    }

    /**
     * Emergency table creation method
     * Can be called manually if needed
     */
    public void createTableForYearIfNeeded(int year) {
        try {
            log.info("Manual table creation requested for year: {}", year);
            donationTableService.ensureTableExistsForYear(year);
            log.info("Manual table creation completed for year: {}", year);
        } catch (Exception e) {
            log.error("Manual table creation failed for year {}: {}", year, e.getMessage());
            throw new RuntimeException("Failed to create table for year " + year, e);
        }
    }
}
