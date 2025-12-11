package com.example.session;

import jakarta.servlet.http.HttpSession;
import com.example.repository.UserRepository;
import com.example.repository.UserLocationRepository; // 추가
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SessionController {

    private final UserRepository userRepository;
    private final UserLocationRepository userLocationRepository; // 1. Repository 주입

    @GetMapping("/health")
    public String health(){
        return "회원 가입 및 로그인 완료.";
    }

    @GetMapping("/api/session/me")
    public Map<String, Object> sessionMe(@SessionAttribute(name = "USER" , required = false) SessionUser sessionUser) {

        if (sessionUser == null) {
            return Map.of("auth", "anonymous");
        }

        // 2. 이 유저가 위치 설정을 했는지 DB 확인
        boolean hasLocation = userLocationRepository.existsByUserId(sessionUser.id());

        // 3. 응답에 hasLocation 추가
        return Map.of(
                "auth", "oauth2",
                "userId", sessionUser.id(),
                "nickname", sessionUser.nickname(),
                "role", sessionUser.role(),
                "hasLocation", hasLocation // 프론트가 이걸 보고 판단함!
        );
    }

    @PostMapping("/api/session/logout")
    public Map<String, Object> logout(HttpSession session){
        session.invalidate();
        return Map.of("ok", true);
    }
}