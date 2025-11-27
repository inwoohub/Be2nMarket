package com.example.entity;
import com.example.entity.enums.EasyPayType;
import com.example.entity.enums.PaymentMethodType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "paymentMethod")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long payment_method_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 30)
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PaymentMethodType method_type;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EasyPayType easyPayType;

    @Column(length = 10)
    private String institutionCode;

    @Column(length = 50)
    private String displayName;

    @Column(nullable = false, length = 128)
    private String token;

    @Column(length = 4)
    private String last4;

    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime created_at;
}

