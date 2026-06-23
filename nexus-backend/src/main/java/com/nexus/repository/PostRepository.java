package com.nexus.repository;

import com.nexus.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthorId(Long authorId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.author.id IN :followingIds ORDER BY p.createdAt DESC")
    Page<Post> findFeedPosts(@Param("followingIds") List<Long> followingIds, Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY p.likeCount DESC, p.createdAt DESC")
    Page<Post> findTrendingPosts(Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.author.college = :college ORDER BY p.likeCount DESC, p.createdAt DESC")
    Page<Post> findTrendingByCollege(@Param("college") String college, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE LOWER(p.caption) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Post> searchPosts(@Param("q") String query, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.postHashtags ph WHERE ph.hashtag.id = :hashtagId ORDER BY p.createdAt DESC")
    Page<Post> findByHashtagId(@Param("hashtagId") Long hashtagId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.author.id NOT IN :followingIds AND p.createdAt > :since ORDER BY p.likeCount DESC")
    Page<Post> findExplorePosts(@Param("followingIds") List<Long> followingIds, @Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.author.id = :userId")
    long countByAuthorId(@Param("userId") Long userId);
}
