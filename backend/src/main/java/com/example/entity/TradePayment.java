package com.example.entity;

import com.example.entity.enums.EasyPayType;
import com.example.entity.enums.PaymentMethodType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

import com.example.entity.enums.TradePaymentPurpose;
import com.example.entity.enums.TradePaymentStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "tradePayment",
        indexes = {
                @Index(name = "idx_tp_user_time", columnList = "user_id,created_at")
        }
)
public class TradePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trade_payment_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_id")
    private Trade trade; // TOPUP이면 NULL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private TradePaymentPurpose purpose;

    @Column(nullable = false)
    private Long amount;

    @Builder.Default
    @Column(nullable = false)
    private Long fee_amount = 0L;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TradePaymentStatus status = TradePaymentStatus.PENDING;

    @Column(length = 100)
    private String paymentKey;

    @Column(length = 100)
    private String orderId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentMethodType method_type;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EasyPayType easyPayType;

    @Column(length = 30)
    private String pg_status;

    @Column(length = 100)
    private String provider_tx_id;

    @Column(columnDefinition = "TEXT")
    private String pg_raw_response;

    @CreationTimestamp
    private LocalDateTime created_at;
}
