package com.nexus.repository;

import com.nexus.entity.Hashtag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface HashtagRepository extends JpaRepository<Hashtag, Long> {

    Optional<Hashtag> findByName(String name);

    @Query("SELECT h FROM Hashtag h ORDER BY h.postCount DESC")
    Page<Hashtag> findTrending(Pageable pageable);

    @Query("SELECT h FROM Hashtag h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY h.postCount DESC")
    Page<Hashtag> searchByName(@Param("q") String query, Pageable pageable);
}
