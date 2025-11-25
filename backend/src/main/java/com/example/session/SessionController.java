// SessionController.java
package com.example.session;

import jakarta.servlet.http.HttpSession;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SessionController {

    private final UserRepository userRepository;

    @GetMapping("/health")
    public String health(){
        return "회원 가입 및 로그인 완료.";
    }

    @GetMapping("/api/session/me")
    public Map<String, Object> sessionMe(@SessionAttribute(name = "USER" , required = false) SessionUser sessionUser) {

        if (sessionUser == null) {
            return Map.of("auth", "anonymous");
        }
        return Map.of(
                "auth", "oauth2",
                "userId", sessionUser.id(),
                "nickname", sessionUser.nickname()
        );
    }


    @PostMapping("/api/session/logout")
    public Map<String, Object> logout(HttpSession session){
        session.invalidate();
        return Map.of("ok", true);
    }
}
