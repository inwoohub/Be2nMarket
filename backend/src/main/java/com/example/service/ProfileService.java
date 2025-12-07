// src/main/java/com/example/service/ProfilService.java
package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final S3Uploader s3Uploader;

    private User getUserOrThrow(SessionUser sessionUser) {
        Long userId = sessionUser.id();
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
    }

    public Map<String, Object> getMyProfile(SessionUser sessionUser) {
        User user = getUserOrThrow(sessionUser);
        String profileImageUrl = s3Uploader.getFileUrl(user.getProfile_image_url());

        return Map.of(
                "auth", "oauth2",
                "user", Map.of(
                        "userId", user.getUser_id(),
                        "nickname", user.getNickname(),
                        "profileImageUrl", profileImageUrl == null ? "" : profileImageUrl,
                        "mannerScore", user.getManner_score(),
                        "role", user.getRole()
                )
        );
    }

    public String updateProfileImage(SessionUser sessionUser, MultipartFile file) throws IOException {
        User user = getUserOrThrow(sessionUser);

        String key = s3Uploader.uploadProfileImage(user.getUser_id(), file);
        user.setProfile_image_url(key);
        userRepository.save(user);

        return s3Uploader.getFileUrl(key);
    }

    public void deleteProfileImage(SessionUser sessionUser) {
        User user = getUserOrThrow(sessionUser);

        String oldKey = user.getProfile_image_url();
        s3Uploader.deleteFile(oldKey);

        user.setProfile_image_url(null);
        userRepository.save(user);
    }

    public String updateNickname(SessionUser sessionUser, String newNickname) {
        validateNickname(newNickname);
        User user = getUserOrThrow(sessionUser);
        user.setNickname(newNickname);
        userRepository.save(user);

        return newNickname;
    }

    private void validateNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) { throw new IllegalArgumentException("닉네임을 입력해주세요."); }
        String trimmed = nickname.trim();
        if (trimmed.isEmpty()) { throw new IllegalArgumentException("닉네임을 입력해주세요.");}
        int score = 0;
        for (int i = 0; i < trimmed.length(); i++) {
            char ch = trimmed.charAt(i);
            if (ch >= 0xAC00 && ch <= 0xD7A3) { score += 2; }
            else if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) { score += 1; }
            else if (ch >= '0' && ch <= '9') { score += 1; }
            else { throw new IllegalArgumentException("닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.");}
            if (score > 12) { throw new IllegalArgumentException("닉네임은 한글 기준 6자, 영문/숫자 기준 12자 이내로 입력해주세요."); }
        }
    }

}
