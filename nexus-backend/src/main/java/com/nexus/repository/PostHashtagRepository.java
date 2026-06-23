package com.nexus.repository;

import com.nexus.entity.PostHashtag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostHashtagRepository extends JpaRepository<PostHashtag, Long> {

    void deleteByPostId(Long postId);
}
