// src/main/java/com/example/security/CustomOAuth2AuthenticationSuccessHandler.java
package com.example.security;

import com.example.session.SessionUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class CustomOAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    // 프론트 주소를 프로퍼티로 빼두면 환경별로 바꾸기 편함

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        Long kakaoId = null;
        String nickname = "사용자";
        String role = null;

        // 1) Principal 에서 카카오 id / 닉네임 추출
        if (authentication instanceof OAuth2AuthenticationToken token) {
            OAuth2User principal = token.getPrincipal();
            Map<String, Object> attrs = principal.getAttributes();

            kakaoId = Long.valueOf(String.valueOf(attrs.get("id")));
            role = String.valueOf(attrs.get("role"));
            nickname = "사용자";
            Object ka = attrs.get("kakao_account");
            if (ka instanceof Map<?, ?> kaMap) {
                Object pf = kaMap.get("profile");
                if (pf instanceof Map<?, ?> pfMap) {
                    Object nn = pfMap.get("nickname");
                    if (nn instanceof String s && !s.isBlank()) {
                        nickname = s;
                    }
                }
            }

            // 2) 세션에 보관
            request.getSession(true).setAttribute("USER", new SessionUser(kakaoId, nickname, role));
        }

        if (kakaoId != null) {
            String redirect = frontendBaseUrl + "/main";
            response.sendRedirect(redirect);
        } else {
            // 혹시 모를 경우 기본 페이지
            response.sendRedirect(frontendBaseUrl + "/");
        }
    }
}
