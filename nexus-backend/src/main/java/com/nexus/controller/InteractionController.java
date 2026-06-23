package com.nexus.controller;

import com.nexus.dto.request.CreateCommentRequest;
import com.nexus.dto.response.CommentResponse;
import com.nexus.service.CommentService;
import com.nexus.service.LikeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class InteractionController {

    private final CommentService commentService;
    private final LikeService likeService;

    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request, Authentication auth) {
        return ResponseEntity.ok(commentService.addComment(postId, request, auth.getName()));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(@PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(commentService.getComments(postId, page, size));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, Authentication auth) {
        commentService.deleteComment(commentId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> likePost(@PathVariable Long postId, Authentication auth) {
        likeService.likePost(postId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<Void> unlikePost(@PathVariable Long postId, Authentication auth) {
        likeService.unlikePost(postId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
