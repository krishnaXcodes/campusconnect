package com.nexus.service;

import com.nexus.config.JwtService;
import com.nexus.dto.request.LoginRequest;
import com.nexus.dto.request.RegisterRequest;
import com.nexus.dto.response.AuthResponse;
import com.nexus.dto.response.UserResponse;
import com.nexus.entity.User;
import com.nexus.enums.UserRole;
import com.nexus.exception.DuplicateResourceException;
import com.nexus.exception.ResourceNotFoundException;
import com.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final List<String> VERIFIED_DOMAINS = List.of(
            "cumail.in", "cuchd.in",
            "iit.ac.in", "nit.ac.in", "vit.ac.in"
    );

    private boolean isCampusVerified(String email) {
        if (email == null || !email.contains("@")) return false;
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        return VERIFIED_DOMAINS.contains(domain);
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .college(request.getCollege())
                .department(request.getDepartment())
                .year(request.getYear())
                .skills(request.getSkills() != null ? request.getSkills() : new java.util.ArrayList<>())
                .interests(request.getInterests())
                .campusVerified(isCampusVerified(request.getEmail()))
                .role(UserRole.USER)
                .build();

        user = userRepository.save(user);
        String token = generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .role(user.getRole().name())
                .college(user.getCollege())
                .department(user.getDepartment())
                .campusVerified(user.getCampusVerified())
                .openToConnect(user.getOpenToConnect())
                .skills(user.getSkills())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .role(user.getRole().name())
                .college(user.getCollege())
                .department(user.getDepartment())
                .campusVerified(user.getCampusVerified())
                .openToConnect(user.getOpenToConnect())
                .skills(user.getSkills())
                .build();
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profileImage(user.getProfileImage())
                .coverImage(user.getCoverImage())
                .website(user.getWebsite())
                .college(user.getCollege())
                .department(user.getDepartment())
                .year(user.getYear())
                .skills(user.getSkills())
                .interests(user.getInterests())
                .followerCount(user.getFollowerCount())
                .followingCount(user.getFollowingCount())
                .postCount(user.getPostCount())
                .isPrivate(user.getIsPrivate())
                .isVerified(user.getIsVerified())
                .campusVerified(user.getCampusVerified())
                .openToConnect(user.getOpenToConnect())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private String generateToken(User user) {
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        return jwtService.generateToken(userDetails);
    }
}
