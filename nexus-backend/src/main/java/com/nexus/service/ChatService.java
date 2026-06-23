package com.nexus.service;

import com.nexus.dto.request.SendMessageRequest;
import com.nexus.dto.response.ConversationResponse;
import com.nexus.dto.response.MessageResponse;
import com.nexus.entity.*;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, String username) {
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        // Find or create conversation
        Conversation conversation = conversationRepository
                .findByUserPair(sender.getId(), receiver.getId())
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder().user1(sender).user2(receiver).build()));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .mediaUrl(request.getMediaUrl())
                .build();

        message = messageRepository.save(message);

        conversation.setLastMessage(request.getContent());
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return mapMessageToResponse(message);
    }

    public List<ConversationResponse> getConversations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return conversationRepository.findByUserId(user.getId()).stream()
                .map(c -> {
                    User other = c.getUser1().getId().equals(user.getId()) ? c.getUser2() : c.getUser1();
                    return ConversationResponse.builder()
                            .id(c.getId())
                            .otherUserId(other.getId())
                            .otherUsername(other.getUsername())
                            .otherUserProfileImage(other.getProfileImage())
                            .lastMessage(c.getLastMessage())
                            .lastMessageAt(c.getLastMessageAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public Page<MessageResponse> getMessages(Long conversationId, int page, int size) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, PageRequest.of(page, size))
                .map(this::mapMessageToResponse);
    }

    private MessageResponse mapMessageToResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderUsername(m.getSender().getUsername())
                .senderProfileImage(m.getSender().getProfileImage())
                .content(m.getContent())
                .mediaUrl(m.getMediaUrl())
                .isRead(m.getIsRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
