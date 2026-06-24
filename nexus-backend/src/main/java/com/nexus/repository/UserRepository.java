package com.nexus.repository;

import com.nexus.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<User> searchUsers(@Param("q") String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.college = :college AND u.id != :userId")
    Page<User> findByCollege(@Param("college") String college, @Param("userId") Long userId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.college = :college AND u.department = :department AND u.id != :userId")
    Page<User> findByCollegeAndDepartment(@Param("college") String college, @Param("department") String department, @Param("userId") Long userId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.id != :userId AND (u.college = :college OR u.skills LIKE CONCAT('%', :skill, '%') OR u.interests LIKE CONCAT('%', :interest, '%')) ORDER BY u.followerCount DESC")
    Page<User> findSuggestedUsers(@Param("userId") Long userId, @Param("college") String college, @Param("skill") String skill, @Param("interest") String interest, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.college = :college ORDER BY u.followerCount DESC")
    Page<User> findTopCreatorsByCollege(@Param("college") String college, Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u JOIN u.skills s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :skill, '%'))")
    Page<User> findUsersBySkill(@Param("skill") String skill, Pageable pageable);
}
