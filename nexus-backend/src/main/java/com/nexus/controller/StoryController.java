package com.nexus.controller;

import com.nexus.dto.request.CreateStoryRequest;
import com.nexus.dto.response.StoryGroupResponse;
import com.nexus.dto.response.StoryResponse;
import com.nexus.service.StoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    @PostMapping
    public ResponseEntity<StoryResponse> createStory(@Valid @RequestBody CreateStoryRequest request, Authentication auth) {
        return ResponseEntity.ok(storyService.createStory(request, auth.getName()));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<StoryGroupResponse>> getStoryFeed(Authentication auth) {
        return ResponseEntity.ok(storyService.getStoryFeed(auth.getName()));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> viewStory(@PathVariable Long id, Authentication auth) {
        storyService.viewStory(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id, Authentication auth) {
        storyService.deleteStory(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
