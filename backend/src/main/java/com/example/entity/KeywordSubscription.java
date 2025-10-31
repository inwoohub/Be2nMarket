package com.example.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "keywordSubscription", uniqueConstraints = { @UniqueConstraint(name = "uniq_user_keyword", columnNames = {"user_id","keyword"}) })
public class KeywordSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long keyword_subscription_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String keyword;

    @CreationTimestamp
    private LocalDateTime created_at;
}