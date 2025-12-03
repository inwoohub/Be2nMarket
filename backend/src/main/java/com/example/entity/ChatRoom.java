package com.example.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "chatRoom")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chatroom_id;

    @CreationTimestamp
    private LocalDateTime created_at;

    private LocalDateTime last_message_at;

    // [추가됨] 채팅방 목록 조회 시, 참여자 정보(상대방 이름/프사)를 가져오기 위해 연결
    // mappedBy = "chatroom"은 ChatParticipant 엔티티의 'chatroom' 필드와 연결됨을 의미
    @OneToMany(mappedBy = "chatroom", cascade = CascadeType.ALL)
    @Builder.Default // 빌더 패턴 사용 시 리스트 초기화를 위해 필요
    @ToString.Exclude // 순환 참조 방지
    private List<ChatParticipant> participants = new ArrayList<>();

    // [추가됨] 채팅방 목록 조회 시, 해당 방의 메시지 내역(마지막 메시지 내용 등)을 접근하기 위해 연결
    @OneToMany(mappedBy = "chatroom", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private List<ChatMessage> messages = new ArrayList<>();
}