package com.nexus.controller;

import com.nexus.dto.request.CreateCollectionRequest;
import com.nexus.dto.response.CollectionResponse;
import com.nexus.dto.response.PostResponse;
import com.nexus.service.BookmarkService;
import com.nexus.service.CollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final CollectionService collectionService;

    @PostMapping("/posts/{postId}/bookmark")
    public ResponseEntity<Void> bookmark(@PathVariable Long postId, Authentication auth) {
        bookmarkService.bookmarkPost(postId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{postId}/bookmark")
    public ResponseEntity<Void> removeBookmark(@PathVariable Long postId, Authentication auth) {
        bookmarkService.removeBookmark(postId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<Page<PostResponse>> getBookmarks(Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(bookmarkService.getBookmarks(auth.getName(), page, size));
    }

    @GetMapping("/collections")
    public ResponseEntity<List<CollectionResponse>> getCollections(Authentication auth) {
        return ResponseEntity.ok(collectionService.getUserCollections(auth.getName()));
    }

    @PostMapping("/collections")
    public ResponseEntity<CollectionResponse> createCollection(@Valid @RequestBody CreateCollectionRequest request, Authentication auth) {
        return ResponseEntity.ok(collectionService.createCollection(request, auth.getName()));
    }

    @DeleteMapping("/collections/{id}")
    public ResponseEntity<Void> deleteCollection(@PathVariable Long id, Authentication auth) {
        collectionService.deleteCollection(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/collections/{collectionId}/posts/{postId}")
    public ResponseEntity<Void> addToCollection(@PathVariable Long collectionId, @PathVariable Long postId, Authentication auth) {
        collectionService.addPostToCollection(collectionId, postId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/collections/{collectionId}/posts/{postId}")
    public ResponseEntity<Void> removeFromCollection(@PathVariable Long collectionId, @PathVariable Long postId, Authentication auth) {
        collectionService.removePostFromCollection(collectionId, postId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
