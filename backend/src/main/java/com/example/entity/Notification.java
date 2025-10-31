package com.example.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(
        name = "notification",
        indexes = {
                @Index(name = "idx_notif_user_time", columnList = "user_id,created_at")
        }
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notification_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(length = 80)
    private String title;

    @Column(length = 255)
    private String body;

    @Column(length = 30)
    private String target_type;

    private Long target_id;

    @Builder.Default
    private boolean is_read = false;

    private LocalDateTime read_at;

    @CreationTimestamp
    private LocalDateTime created_at;
}
