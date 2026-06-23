package com.nexus.controller;

import com.nexus.dto.request.SendMessageRequest;
import com.nexus.dto.response.ConversationResponse;
import com.nexus.dto.response.MessageResponse;
import com.nexus.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody SendMessageRequest request, Authentication auth) {
        return ResponseEntity.ok(chatService.sendMessage(request, auth.getName()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(Authentication auth) {
        return ResponseEntity.ok(chatService.getConversations(auth.getName()));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<Page<MessageResponse>> getMessages(@PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getMessages(conversationId, page, size));
    }
}
