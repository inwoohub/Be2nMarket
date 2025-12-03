package com.example.entity;

import com.example.entity.enums.WithdrawStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(
        name = "withdrawRequest",
        indexes = {
                @Index(name = "idx_wr_user_time", columnList = "user_id, requested_at"),
                @Index(name = "idx_wr_status_time", columnList = "status, requested_at")
        }
)
public class WithdrawRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long withdraw_request_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false, length = 10)
    private String bank_code;

    @Column(nullable = false, length = 50)
    private String account_number;

    @Column(nullable = false, length = 50)
    private String account_holder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WithdrawStatus status;  // PENDING, COMPLETED, REJECTED ...

    @Column(length = 255)
    private String reject_reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin; // 관리자 유저를 User 로 재사용한다면

    @CreationTimestamp
    private LocalDateTime requested_at;

    private LocalDateTime completed_at;
    private LocalDateTime rejected_at;

    @UpdateTimestamp
    private LocalDateTime updated_at;
}
