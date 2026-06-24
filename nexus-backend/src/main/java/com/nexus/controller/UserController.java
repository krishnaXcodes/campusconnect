package com.nexus.controller;

import com.nexus.dto.request.UpdateProfileRequest;
import com.nexus.dto.response.UserResponse;
import com.nexus.service.FollowService;
import com.nexus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FollowService followService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id, Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(userService.getUserProfile(id, username));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username, Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(userService.getUserProfileByUsername(username, currentUsername));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateProfile(@PathVariable Long id,
            @RequestBody UpdateProfileRequest request, Authentication auth) {
        return ResponseEntity.ok(userService.updateProfile(id, request, auth.getName()));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> searchUsers(@RequestParam String q,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.searchUsers(q, page, size));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<Page<UserResponse>> getSuggestions(Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getSuggestions(auth.getName(), page, size));
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<Void> follow(@PathVariable Long id, Authentication auth) {
        followService.follow(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<Void> unfollow(@PathVariable Long id, Authentication auth) {
        followService.unfollow(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<Page<UserResponse>> getFollowers(@PathVariable Long id,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(followService.getFollowers(id, page, size));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<Page<UserResponse>> getFollowing(@PathVariable Long id,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(followService.getFollowing(id, page, size));
    }

    @PatchMapping("/me/open-to-connect")
    public ResponseEntity<Void> toggleOpenToConnect(Authentication auth) {
        userService.toggleOpenToConnect(auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/skills")
    public ResponseEntity<Void> addSkill(@RequestBody Map<String, String> payload, Authentication auth) {
        String skill = payload.get("skill");
        if (skill != null && !skill.trim().isEmpty()) {
            userService.addSkill(auth.getName(), skill.trim());
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dev/connect-all")
    public ResponseEntity<Void> connectAll() {
        followService.connectAllUsers();
        return ResponseEntity.ok().build();
    }
}
