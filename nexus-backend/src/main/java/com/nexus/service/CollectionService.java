package com.nexus.service;

import com.nexus.dto.request.CreateCollectionRequest;
import com.nexus.dto.response.CollectionResponse;
import com.nexus.entity.*;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public List<CollectionResponse> getUserCollections(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return collectionRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CollectionResponse createCollection(CreateCollectionRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Collection collection = Collection.builder()
                .user(user)
                .name(request.getName())
                .coverImage(request.getCoverImage())
                .build();

        collection = collectionRepository.save(collection);
        return mapToResponse(collection);
    }

    @Transactional
    public void deleteCollection(Long collectionId, String username) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
        if (!collection.getUser().getUsername().equals(username)) {
            throw new com.nexus.exception.UnauthorizedException("Not authorized");
        }
        collectionRepository.delete(collection);
    }

    @Transactional
    public void addPostToCollection(Long collectionId, Long postId, String username) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Ensure bookmark exists
        Bookmark bookmark = bookmarkRepository.findByUserIdAndPostId(user.getId(), postId)
                .orElseGet(() -> bookmarkRepository.save(Bookmark.builder().user(user).post(post).build()));

        bookmark.setCollection(collection);
        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removePostFromCollection(Long collectionId, Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Bookmark bookmark = bookmarkRepository.findByUserIdAndPostId(user.getId(), postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));
        bookmark.setCollection(null);
        bookmarkRepository.save(bookmark);
    }

    private CollectionResponse mapToResponse(Collection c) {
        return CollectionResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .coverImage(c.getCoverImage())
                .isDefault(c.getIsDefault())
                .postCount(bookmarkRepository.countByCollectionId(c.getId()))
                .createdAt(c.getCreatedAt())
                .build();
    }
}
