// src/main/java/com/example/controller/UserController.java
package com.example.controller;

import com.example.entity.User;
import com.example.repository.UserRepository;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/api/me")
    public Map<String, Object> me(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return Map.of("auth", "anonymous");
        }

        Long userId = sessionUser.id();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));

        String profileImageUrl = user.getProfile_image_url();

        if (profileImageUrl == null || profileImageUrl.isBlank()) {
            profileImageUrl = "";
        }

        return Map.of(
                "auth", "oauth2",
                "user", Map.of(
                        "userId", user.getUser_id(),
                        "nickname", user.getNickname(),
                        "profileImageUrl", profileImageUrl,
                        "mannerScore", user.getManner_score()
                )
        );
    }

}
