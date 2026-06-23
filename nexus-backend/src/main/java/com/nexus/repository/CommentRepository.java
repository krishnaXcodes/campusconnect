package com.nexus.repository;

import com.nexus.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByPostIdAndParentIsNullOrderByCreatedAtDesc(Long postId, Pageable pageable);
    List<Comment> findByPostIdAndParentIsNullOrderByCreatedAtDesc(Long postId);
    long countByPostId(Long postId);
}
