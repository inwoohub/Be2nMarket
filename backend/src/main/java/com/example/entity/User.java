package com.example.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "user")
public class User {

    @Id
    @Column(name="user_id", nullable=false)
    private Long user_id;

    @Column(nullable = false, length = 40)
    private String nickname;

    @Column(length = 255)
    private String profile_image_url;

    @Column(length = 20)
    private String role;

    @Builder.Default
    @Column(precision = 4, scale = 1)
    private BigDecimal manner_score = new BigDecimal("36.5");

    @CreationTimestamp
    private LocalDateTime created_at;

    @UpdateTimestamp
    private LocalDateTime updated_at;

    // [추가됨] 내가 참여 중인 채팅방 목록을 조회하기 위한 양방향 매핑
    // ChatParticipant의 'user' 필드와 연결됨
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude // 순환 참조 방지
    private List<ChatParticipant> chatParticipations = new ArrayList<>();
}