package com.example.entity;
import com.example.entity.embeddable.ChatParticipantId;
import com.example.entity.enums.ChatRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "chatParticipant")
public class ChatParticipant {

    @EmbeddedId
    private ChatParticipantId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("chatroom_id")
    @JoinColumn(name = "chatroom_id", nullable = false)
    private ChatRoom chatroom;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("user_id")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    private LocalDateTime joined_at;

    private LocalDateTime left_at;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ChatRole role = ChatRole.MEMBER;

    @Builder.Default
    private Integer unread_count = 0;
}