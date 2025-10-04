package com.app.server.repository;

import com.app.server.model.Donation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DonationRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Donation> donationRowMapper = (rs, rowNum) -> {
        Donation donation = new Donation();
        donation.setId(rs.getLong("id"));
        donation.setDonorName(rs.getString("donor_name"));
        donation.setDonorAddress(rs.getString("donor_address"));
        donation.setDonorPhone(rs.getString("donor_phone"));
        donation.setDonationAmount(rs.getBigDecimal("donation_amount"));
        donation.setDonationType(rs.getString("donation_type"));
        donation.setNotes(rs.getString("notes"));
        donation.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        donation.setCreatedDate(rs.getDate("created_date").toLocalDate());
        donation.setCreatedBy(rs.getString("created_by"));
        
        if (rs.getTimestamp("updated_at") != null) {
            donation.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }
        if (rs.getString("updated_by") != null) {
            donation.setUpdatedBy(rs.getString("updated_by"));
        }
        
        return donation;
    };

    /**
     * Save a new donation to the appropriate year table
     */
    public Donation save(Donation donation, int year) {
        String tableName = "donations_" + year;
        
        String sql = """
            INSERT INTO %s (donor_name, donor_address, donor_phone, donation_amount, 
                           donation_type, notes, created_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """.formatted(tableName);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        try {
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, donation.getDonorName());
                ps.setString(2, donation.getDonorAddress());
                ps.setString(3, donation.getDonorPhone());
                ps.setBigDecimal(4, donation.getDonationAmount());
                ps.setString(5, donation.getDonationType());
                ps.setString(6, donation.getNotes());
                ps.setDate(7, java.sql.Date.valueOf(donation.getCreatedDate()));
                ps.setString(8, donation.getCreatedBy());
                return ps;
            }, keyHolder);

            // Get the generated ID from the key holder
            Long generatedId = null;
            try {
                Number generatedKey = keyHolder.getKey();
                if (generatedKey != null) {
                    generatedId = generatedKey.longValue();
                    donation.setId(generatedId);
                }
            } catch (Exception e) {
                // Fallback: try to get ID from keys map
                Map<String, Object> keys = keyHolder.getKeys();
                if (keys != null && keys.containsKey("ID")) {
                    generatedId = ((Number) keys.get("ID")).longValue();
                    donation.setId(generatedId);
                } else {
                    throw new RuntimeException("Failed to retrieve generated ID");
                }
            }

            log.info("Successfully saved donation with ID {} to table {}", generatedId, tableName);
            return donation;
            
        } catch (Exception e) {
            log.error("Error saving donation to table {}: {}", tableName, e.getMessage());
            throw new RuntimeException("Failed to save donation", e);
        }
    }

    /**
     * Find donation by ID and year
     */
    public Optional<Donation> findByIdAndYear(Long id, int year) {
        String tableName = "donations_" + year;
        String sql = "SELECT * FROM " + tableName + " WHERE id = ?";
        
        try {
            List<Donation> donations = jdbcTemplate.query(sql, donationRowMapper, id);
            return donations.isEmpty() ? Optional.empty() : Optional.of(donations.get(0));
        } catch (Exception e) {
            log.error("Error finding donation by ID {} in table {}: {}", id, tableName, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Find all donations for a specific year
     */
    public List<Donation> findAllByYear(int year) {
        String tableName = "donations_" + year;
        String sql = "SELECT * FROM " + tableName + " ORDER BY created_date DESC, created_at DESC";
        
        try {
            return jdbcTemplate.query(sql, donationRowMapper);
        } catch (Exception e) {
            log.error("Error finding donations for year {}: {}", year, e.getMessage());
            return List.of();
        }
    }

    /**
     * Find donations by creator for a specific year (for USER role)
     */
    public List<Donation> findByCreatedByAndYear(String createdBy, int year) {
        String tableName = "donations_" + year;
        String sql = "SELECT * FROM " + tableName + " WHERE created_by = ? ORDER BY created_date DESC, created_at DESC";
        
        try {
            return jdbcTemplate.query(sql, donationRowMapper, createdBy);
        } catch (Exception e) {
            log.error("Error finding donations by creator {} for year {}: {}", createdBy, year, e.getMessage());
            return List.of();
        }
    }

    /**
     * Update an existing donation
     */
    public boolean update(Donation donation, int year, String updatedBy) {
        String tableName = "donations_" + year;
        
        String sql = """
            UPDATE %s SET 
                donor_name = ?, donor_address = ?, donor_phone = ?, 
                donation_amount = ?, donation_type = ?, notes = ?,
                updated_at = ?, updated_by = ?
            WHERE id = ?
            """.formatted(tableName);

        try {
            int rowsAffected = jdbcTemplate.update(sql,
                donation.getDonorName(),
                donation.getDonorAddress(),
                donation.getDonorPhone(),
                donation.getDonationAmount(),
                donation.getDonationType(),
                donation.getNotes(),
                LocalDateTime.now(),
                updatedBy,
                donation.getId()
            );
            
            boolean success = rowsAffected > 0;
            log.info("Update donation ID {} in table {}: {}", donation.getId(), tableName, 
                    success ? "SUCCESS" : "NO_ROWS_AFFECTED");
            return success;
            
        } catch (Exception e) {
            log.error("Error updating donation ID {} in table {}: {}", donation.getId(), tableName, e.getMessage());
            return false;
        }
    }

    /**
     * Delete a donation by ID and year
     */
    public boolean deleteByIdAndYear(Long id, int year) {
        String tableName = "donations_" + year;
        String sql = "DELETE FROM " + tableName + " WHERE id = ?";
        
        try {
            int rowsAffected = jdbcTemplate.update(sql, id);
            boolean success = rowsAffected > 0;
            log.info("Delete donation ID {} from table {}: {}", id, tableName, 
                    success ? "SUCCESS" : "NO_ROWS_AFFECTED");
            return success;
            
        } catch (Exception e) {
            log.error("Error deleting donation ID {} from table {}: {}", id, tableName, e.getMessage());
            return false;
        }
    }

    /**
     * Get total donation amount for a specific year
     */
    public BigDecimal getTotalAmountByYear(int year) {
        String tableName = "donations_" + year;
        String sql = "SELECT COALESCE(SUM(donation_amount), 0) FROM " + tableName;
        
        try {
            return jdbcTemplate.queryForObject(sql, BigDecimal.class);
        } catch (Exception e) {
            log.error("Error getting total amount for year {}: {}", year, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Get donation count for a specific year
     */
    public int getCountByYear(int year) {
        String tableName = "donations_" + year;
        String sql = "SELECT COUNT(*) FROM " + tableName;
        
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error getting count for year {}: {}", year, e.getMessage());
            return 0;
        }
    }
}
