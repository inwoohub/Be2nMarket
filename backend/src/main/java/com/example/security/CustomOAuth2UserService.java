// src/main/java/com/example/security/CustomOAuth2UserService.java
package com.example.security;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Kakao 에서 사용자 정보 조회
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();
        log.info("Kakao attributes: {}", attributes);

        // 1) kakao id
        String kakaoIdStr = String.valueOf(attributes.get("id"));
        Long kakaoId = Long.parseLong(kakaoIdStr);

        // 2) nickname
        String nickname = "사용자";
        Object ka = attributes.get("kakao_account");
        if (ka instanceof Map<?, ?> kaMap) {
            Object pf = kaMap.get("profile");
            if (pf instanceof Map<?, ?> pfMap) {
                Object nn = pfMap.get("nickname");
                if (nn instanceof String s && !s.isBlank()) {
                    nickname = s;
                }
            }
        }

        // 3) DB upsert
        String finalNickname = nickname;
        User user = userRepository.findById(kakaoId)
                .orElseGet(() -> User.builder()
                        .user_id(kakaoId)       // 카카오 ID를 PK 로 사용
                        .nickname(finalNickname)
                        .build()
                );

        if (user.getNickname() == null || user.getNickname().isBlank()) {
            user.setNickname(nickname);
        }
        userRepository.save(user);

        // 4) Security 쪽으로 돌려줄 Principal 구성
        //    - nameAttributeKey 를 "id"로 설정해서 principal.getName() == kakaoIdStr 가 되게 함
        return new DefaultOAuth2User(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "id"
        );
    }
}
