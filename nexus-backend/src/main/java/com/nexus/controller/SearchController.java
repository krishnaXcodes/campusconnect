package com.nexus.controller;

import com.nexus.dto.response.HashtagResponse;
import com.nexus.dto.response.PostResponse;
import com.nexus.dto.response.UserResponse;
import com.nexus.repository.HashtagRepository;
import com.nexus.service.PostService;
import com.nexus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserService userService;
    private final PostService postService;
    private final HashtagRepository hashtagRepository;

    @GetMapping
    public ResponseEntity<?> search(@RequestParam String q, @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        String username = auth != null ? auth.getName() : null;

        if ("users".equals(type)) {
            return ResponseEntity.ok(userService.searchUsers(q, page, size));
        } else if ("skills".equals(type)) {
            return ResponseEntity.ok(userService.searchUsersBySkill(q, page, size));
        } else if ("hashtags".equals(type)) {
            Page<HashtagResponse> hashtags = hashtagRepository.searchByName(q, PageRequest.of(page, size))
                    .map(h -> HashtagResponse.builder().id(h.getId()).name(h.getName()).postCount(h.getPostCount()).build());
            return ResponseEntity.ok(hashtags);
        } else if ("posts".equals(type)) {
            return ResponseEntity.ok(postService.searchPosts(q, page, size, username));
        }

        // Return users + hashtags for "all"
        Page<UserResponse> users = userService.searchUsers(q, 0, 5);
        Page<HashtagResponse> hashtags = hashtagRepository.searchByName(q, PageRequest.of(0, 5))
                .map(h -> HashtagResponse.builder().id(h.getId()).name(h.getName()).postCount(h.getPostCount()).build());
        Page<PostResponse> posts = postService.searchPosts(q, 0, 10, username);

        return ResponseEntity.ok(java.util.Map.of("users", users.getContent(), "hashtags", hashtags.getContent(), "posts", posts.getContent()));
    }
}
