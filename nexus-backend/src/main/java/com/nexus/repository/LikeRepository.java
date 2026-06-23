package com.nexus.repository;

import com.nexus.entity.Like;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {

    boolean existsByUserIdAndPostId(Long userId, Long postId);
    Optional<Like> findByUserIdAndPostId(Long userId, Long postId);
    Page<Like> findByPostIdOrderByCreatedAtDesc(Long postId, Pageable pageable);
    long countByPostId(Long postId);
}
