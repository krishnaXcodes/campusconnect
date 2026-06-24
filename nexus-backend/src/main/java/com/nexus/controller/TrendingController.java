package com.nexus.controller;

import com.nexus.repository.HashtagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trending")
@RequiredArgsConstructor
public class TrendingController {

    private final HashtagRepository hashtagRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getTrending() {
        var hashtags = hashtagRepository.findTrending(PageRequest.of(0, 10)).getContent();
        var result = hashtags.stream()
                .map(h -> Map.of("tag", (Object) h.getName(), "count", (Object) h.getPostCount()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
