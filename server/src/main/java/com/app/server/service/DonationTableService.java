package com.app.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonationTableService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Check if a donation table exists for the given year
     */
    public boolean tableExists(int year) {
        String tableName = "donations_" + year;
        try {
            // Use H2-compatible query for checking table existence
            String sql = "SELECT COUNT(*) FROM information_schema.tables WHERE UPPER(table_name) = UPPER(?)";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName);
            boolean exists = count != null && count > 0;
            log.debug("Table {} exists: {}", tableName, exists);
            return exists;
        } catch (Exception e) {
            log.error("Error checking if table {} exists: {}", tableName, e.getMessage());
            return false;
        }
    }

    /**
     * Create a donation table for the given year
     */
    @Transactional
    public void createTableForYear(int year) {
        String tableName = "donations_" + year;
        
        if (tableExists(year)) {
            log.info("Table {} already exists, skipping creation", tableName);
            return;
        }

        try {
            // Create the main table first
            String createTableSql = """
                CREATE TABLE %s (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    donor_name VARCHAR(100) NOT NULL,
                    donor_address VARCHAR(255) NOT NULL,
                    donor_phone VARCHAR(15) NOT NULL,
                    donation_amount DECIMAL(10,2) NOT NULL,
                    donation_type VARCHAR(50) DEFAULT 'Cash',
                    notes VARCHAR(500),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_date DATE NOT NULL,
                    created_by VARCHAR(100) NOT NULL,
                    updated_at TIMESTAMP NULL,
                    updated_by VARCHAR(100) NULL
                )
                """.formatted(tableName);

            jdbcTemplate.execute(createTableSql);
            log.info("Successfully created donation table: {}", tableName);

            // Create indexes separately for H2 compatibility
            createIndexes(tableName);

        } catch (Exception e) {
            log.error("Failed to create table {}: {}", tableName, e.getMessage());
            throw new RuntimeException("Failed to create donation table for year " + year, e);
        }
    }

    /**
     * Ensure table exists for the current year
     */
    public void ensureCurrentYearTableExists() {
        int currentYear = LocalDate.now().getYear();
        ensureTableExistsForYear(currentYear);
    }

    /**
     * Ensure table exists for a specific year
     */
    public void ensureTableExistsForYear(int year) {
        if (!tableExists(year)) {
            log.info("Creating donation table for year: {}", year);
            createTableForYear(year);
        }
    }

    /**
     * Get all existing donation table years
     */
    public List<Integer> getExistingTableYears() {
        try {
            // Simple H2-compatible query for getting existing table years
            String sql = """
                SELECT table_name
                FROM information_schema.tables
                WHERE UPPER(table_name) LIKE 'DONATIONS_%'
                ORDER BY table_name DESC
                """;

            List<String> tableNames = jdbcTemplate.queryForList(sql, String.class);
            return tableNames.stream()
                    .filter(tableName -> tableName.toUpperCase().startsWith("DONATIONS_"))
                    .map(tableName -> tableName.substring(10)) // Remove "donations_" prefix
                    .filter(year -> year.matches("\\d{4}")) // Only 4-digit years
                    .map(Integer::parseInt)
                    .sorted((a, b) -> b.compareTo(a)) // Sort descending
                    .toList();
        } catch (Exception e) {
            log.error("Error getting existing table years: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Get table statistics for a specific year
     */
    public TableStats getTableStats(int year) {
        String tableName = "donations_" + year;
        
        if (!tableExists(year)) {
            return new TableStats(year, 0, null, null);
        }

        try {
            String countSql = "SELECT COUNT(*) FROM " + tableName;
            Integer totalRecords = jdbcTemplate.queryForObject(countSql, Integer.class);

            String minDateSql = "SELECT MIN(created_date) FROM " + tableName;
            String maxDateSql = "SELECT MAX(created_date) FROM " + tableName;
            
            LocalDate minDate = jdbcTemplate.queryForObject(minDateSql, LocalDate.class);
            LocalDate maxDate = jdbcTemplate.queryForObject(maxDateSql, LocalDate.class);

            return new TableStats(year, totalRecords != null ? totalRecords : 0, minDate, maxDate);
        } catch (Exception e) {
            log.error("Error getting table stats for {}: {}", tableName, e.getMessage());
            return new TableStats(year, 0, null, null);
        }
    }

    /**
     * Create indexes for a donation table
     */
    private void createIndexes(String tableName) {
        try {
            // Create indexes one by one for H2 compatibility
            String[] indexQueries = {
                "CREATE INDEX IF NOT EXISTS idx_%s_donor_name ON %s (donor_name)".formatted(tableName, tableName),
                "CREATE INDEX IF NOT EXISTS idx_%s_created_date ON %s (created_date)".formatted(tableName, tableName),
                "CREATE INDEX IF NOT EXISTS idx_%s_created_by ON %s (created_by)".formatted(tableName, tableName),
                "CREATE INDEX IF NOT EXISTS idx_%s_donation_amount ON %s (donation_amount)".formatted(tableName, tableName)
            };

            for (String indexQuery : indexQueries) {
                try {
                    jdbcTemplate.execute(indexQuery);
                    log.debug("Created index for table {}: {}", tableName, indexQuery);
                } catch (Exception e) {
                    log.warn("Failed to create index for table {}: {} - {}", tableName, indexQuery, e.getMessage());
                    // Continue with other indexes even if one fails
                }
            }

            log.info("Successfully created indexes for table: {}", tableName);

        } catch (Exception e) {
            log.error("Error creating indexes for table {}: {}", tableName, e.getMessage());
            // Don't throw exception as table creation was successful
        }
    }

    /**
     * Data class for table statistics
     */
    public record TableStats(int year, int totalRecords, LocalDate firstDonationDate, LocalDate lastDonationDate) {}
}
