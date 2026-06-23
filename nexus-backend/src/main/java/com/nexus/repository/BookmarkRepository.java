package com.nexus.repository;

import com.nexus.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    boolean existsByUserIdAndPostId(Long userId, Long postId);
    Optional<Bookmark> findByUserIdAndPostId(Long userId, Long postId);
    Page<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Bookmark> findByCollectionId(Long collectionId);
    Page<Bookmark> findByCollectionIdOrderByCreatedAtDesc(Long collectionId, Pageable pageable);
    long countByCollectionId(Long collectionId);
    void deleteByUserIdAndPostId(Long userId, Long postId);
}
