package com.nexus.service;

import com.nexus.dto.response.NotificationResponse;
import com.nexus.entity.Notification;
import com.nexus.entity.Post;
import com.nexus.entity.User;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.NotificationRepository;
import com.nexus.repository.PostRepository;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public Page<NotificationResponse> getNotifications(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, String username) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.markAllAsRead(user.getId());
    }

    private NotificationResponse mapToResponse(Notification n) {
        String postThumbnail = null;
        if (n.getPostId() != null) {
            Post post = postRepository.findById(n.getPostId()).orElse(null);
            if (post != null && post.getMediaUrls() != null) {
                postThumbnail = post.getMediaUrls().split("\\|\\|\\|")[0];
            }
        }

        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .senderId(n.getSender().getId())
                .senderUsername(n.getSender().getUsername())
                .senderProfileImage(n.getSender().getProfileImage())
                .postId(n.getPostId())
                .postThumbnail(postThumbnail)
                .message(n.getMessage())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
