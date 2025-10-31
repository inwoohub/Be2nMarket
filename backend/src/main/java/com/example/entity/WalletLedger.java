package com.example.entity;

import jakarta.persistence.*;                         // ★ JPA 표준 임포트 (Entity, Table, Id, ManyToOne, JoinColumn, Index 등)
import lombok.*;
import org.hibernate.annotations.CreationTimestamp; // ★ 하이버네이트 전용: 생성시각 자동
import java.time.LocalDateTime;

import com.example.entity.enums.LedgerEntryType;     // enum 경로 확인

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(
        name = "walletLedger",
        indexes = {
                @Index(name = "idx_wl_user_time", columnList = "user_id,created_at")
        }
)
public class WalletLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long wallet_ledger_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_id")
    private Trade trade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_user_id")
    private User relatedUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LedgerEntryType entry_type;

    @Column(nullable = false)
    private Long amount;

    @Builder.Default
    @Column(nullable = false)
    private Long fee_amount = 0L;

    @Column(nullable = false)
    private Long balance_after;

    @Column(length = 200)
    private String memo;

    @CreationTimestamp
    private LocalDateTime created_at;
}
