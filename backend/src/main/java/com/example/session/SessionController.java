// SessionController.java
package com.example.session;

import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class SessionController {

    @GetMapping("/health")
    public String health(){ return "회원 가입 및 로그인 완료."; }

    @GetMapping("/api/session/me")
    public Map<String, Object> sessionMe(HttpSession session) {
        SessionUser u = (SessionUser) session.getAttribute("USER");
        if (u == null) {
            return Map.of("auth", "anonymous");
        }
        return Map.of("auth", "session", "userId", u.userId(), "nickname", u.nickname());
    }


    // 필요하면 SecurityContext 기준으로도 반환
    @GetMapping("/api/me")
    public Map<String, Object> me(@AuthenticationPrincipal OAuth2User user){
        if (user == null) return Map.of("auth","anonymous");
        return Map.of("auth","oauth2", "attrs", user.getAttributes());
    }

    // 세션 종료(로그아웃과 별개로 세션만 무효화)
    @PostMapping("/api/session/logout")
    public Map<String, Object> logout(HttpSession session){
        session.invalidate();
        return Map.of("ok", true);
    }
}
