// src/main/java/com/example/controller/UserController.java
package com.example.controller;

import com.example.service.ProfileService;
import com.example.session.SessionUser;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("api/me")
    public Map<String, Object> me(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null){
            return Map.of("auth", "anonymous");
        }
        return profileService.getMyProfile(sessionUser);
    }

    @PostMapping("api/profile/image")
    public Map<String, Object> uploadProfileImage(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestParam("file") MultipartFile file
    ) throws IOException{
        if (sessionUser == null){
            return Map.of("success", false, "message", "로그인이 필요합니다.");
        }
        if (file==null || file.isEmpty()){
            return Map.of("success", false, "message", "파일이 비어 있습니다.");
        }

        String imageUrl = profileService.updateProfileImage(sessionUser, file);
        return Map.of(
                "success", true,
                "imageUrl", imageUrl
        );
    }

    @PostMapping("/api/profile/image/delete")
    public Map<String, Object> deleteProfileImage(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser
    ) {
        if (sessionUser == null) {
            return Map.of("success", false, "message", "로그인이 필요합니다.");
        }

        profileService.deleteProfileImage(sessionUser);

        return Map.of("success", true);
    }

    @PatchMapping("/api/profile")
    public Map<String, Object> updateProfileNickname(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestBody Map<String, String> body
    ) {
        if (sessionUser == null) {
            return Map.of("success", false, "message", "로그인이 필요합니다.");
        }

        try {
            String nickname = profileService.updateNickname(sessionUser, body.get("nickname"));
            return Map.of("success", true, "nickname", nickname);
        } catch (IllegalArgumentException e) {
            return Map.of("success", false, "message", e.getMessage());
        }
    }

}
