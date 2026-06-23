package com.nexus.repository;

import com.nexus.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE (c.user1.id = :userId OR c.user2.id = :userId) ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE (c.user1.id = :u1 AND c.user2.id = :u2) OR (c.user1.id = :u2 AND c.user2.id = :u1)")
    Optional<Conversation> findByUserPair(@Param("u1") Long u1, @Param("u2") Long u2);
}
