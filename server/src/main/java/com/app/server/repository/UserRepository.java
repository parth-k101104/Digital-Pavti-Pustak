package com.app.server.repository;

import com.app.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by firstName and lastName for authentication
     */
    Optional<User> findByFirstNameAndLastName(String firstName, String lastName);

    /**
     * Find active user by firstName and lastName for authentication
     */
    @Query("SELECT u FROM User u WHERE u.firstName = :firstName AND u.lastName = :lastName AND u.isActive = true")
    Optional<User> findActiveUserByFirstNameAndLastName(@Param("firstName") String firstName,
            @Param("lastName") String lastName);

    /**
     * Check if firstName and lastName combination exists
     */
    boolean existsByFirstNameAndLastName(String firstName, String lastName);

    /**
     * Check if phone number exists
     */
    boolean existsByPhoneNumber(String phoneNumber);

    /**
     * Find all active users
     */
    List<User> findByIsActiveTrue();

    /**
     * Find users by role
     */
    List<User> findByRole(User.Role role);

    /**
     * Find active users by role
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true")
    List<User> findActiveUsersByRole(@Param("role") User.Role role);

    /**
     * Find users by firstName (for partial matching)
     */
    List<User> findByFirstNameContainingIgnoreCase(String firstName);

    /**
     * Find users by lastName (for partial matching)
     */
    List<User> findByLastNameContainingIgnoreCase(String lastName);
}
