package com.example.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "review", uniqueConstraints = { @UniqueConstraint(name = "uq_review_trade_from", columnNames = {"trade_id", "from_user_id"}) })
public class Review {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long review_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_id", nullable = false)
    private Trade trade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id", nullable = false)
    private User fromUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user_id", nullable = false)
    private User toUser;

    @Column(nullable = false)
    private Byte rating;

    @Column(length = 400)
    private String comment;

    @Column(name = "selected_keywords", length = 100)
    private String selectedKeywords;

    @CreationTimestamp
    private LocalDateTime created_at;
}