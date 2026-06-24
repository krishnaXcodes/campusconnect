package com.nexus.controller;

import com.nexus.dto.request.CreatePostRequest;
import com.nexus.dto.response.PostResponse;
import com.nexus.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest request, Authentication auth) {
        return ResponseEntity.ok(postService.createPost(request, auth.getName()));
    }

    @PostMapping("/dev/seed")
    public ResponseEntity<Void> seedPosts() {
        postService.seedDevPosts();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id, Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(postService.getPostById(id, username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, @Valid @RequestBody CreatePostRequest request, Authentication auth) {
        return ResponseEntity.ok(postService.updatePost(id, request, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication auth) {
        postService.deletePost(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponse>> getFeed(Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(postService.getFeed(auth.getName(), page, size));
    }

    @GetMapping("/explore")
    public ResponseEntity<Page<PostResponse>> explore(Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(postService.getExplorePosts(username, page, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostResponse>> getUserPosts(@PathVariable Long userId, Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(postService.getUserPosts(userId, page, size, username));
    }

    @GetMapping("/hashtag/{hashtagId}")
    public ResponseEntity<Page<PostResponse>> getByHashtag(@PathVariable Long hashtagId, Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(postService.getPostsByHashtag(hashtagId, page, size, username));
    }

    @GetMapping("/trending")
    public ResponseEntity<Page<PostResponse>> getCampusTrending(@RequestParam String college, Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(postService.getCampusTrending(college, page, size, username));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PostResponse>> searchPosts(@RequestParam String q, Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(postService.searchPosts(q, page, size, username));
    }
}
