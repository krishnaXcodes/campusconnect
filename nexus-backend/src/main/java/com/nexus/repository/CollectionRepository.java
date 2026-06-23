package com.nexus.repository;

import com.nexus.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CollectionRepository extends JpaRepository<Collection, Long> {

    List<Collection> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Collection> findByUserIdAndIsDefaultTrue(Long userId);
}
