package com.example.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "user")
public class User {

    @Id
    @Column(name="user_id", nullable=false)
    private Long user_id;

    @Column(nullable = false, length = 40)
    private String nickname;

    @Column(length = 255)
    private String profile_image_url;

    @Column(precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal manner_score = new BigDecimal("36.5");

    @CreationTimestamp
    private LocalDateTime created_at;

    @UpdateTimestamp
    private LocalDateTime updated_at;
}