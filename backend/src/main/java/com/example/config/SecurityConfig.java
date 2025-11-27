package com.example.config;

import com.example.security.CustomOAuth2AuthenticationSuccessHandler;
import com.example.security.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOAuth2AuthenticationSuccessHandler successHandler;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService,
                          CustomOAuth2AuthenticationSuccessHandler successHandler) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.successHandler = successHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (개발 중 편의)
                .cors(Customizer.withDefaults()) // 아래 정의한 CORS 설정을 따름
                .authorizeHttpRequests(auth -> auth
                        // 1. 누구나 접근 가능한 경로 설정 (로그인 안 해도 됨)
                        .requestMatchers(
                                "/", "/health", "/favicon.ico",
                                "/oauth2/**", "/login/**",
                                "/images/**", "/css/**", "/js/**",
                                "/ws-stomp/**",      // [핵심] 웹소켓 연결 주소 허용
                                "/api/session/me",   // [추가] 로그인 상태 확인 API 허용
                                "/api/**"            // [추가] API 요청 일단 허용 (필요에 따라 줄이세요)
                        ).permitAll()
                        // 2. 그 외 모든 요청은 로그인해야 함
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(ui -> ui.userService(customOAuth2UserService))
                        .successHandler(successHandler)
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/")
                        .deleteCookies("JSESSIONID")
                        .invalidateHttpSession(true)
                );

        return http.build();
    }

    // ✅ CORS 규칙: 프론트엔드(3000번)의 요청을 허용하는 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:3000")); // 3000번 포트만 딱 집어서 허용
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true); // 쿠키(세션) 주고받기 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}