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

    // [추가됨] 어떤 게시글을 통해 만들어진 채팅방인지 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @ToString.Exclude
    private Post post;

    @CreationTimestamp
    private LocalDateTime created_at;

    private LocalDateTime last_message_at;

    @OneToMany(mappedBy = "chatroom", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private List<ChatParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "chatroom", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private List<ChatMessage> messages = new ArrayList<>();
}