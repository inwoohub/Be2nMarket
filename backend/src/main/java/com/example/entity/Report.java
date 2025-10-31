package com.example.entity;
import com.example.entity.enums.ReportStatus;
import com.example.entity.enums.ReportTargetType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "report")
public class Report {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long report_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ReportTargetType target_type;

    @Column(nullable = false)
    private Long target_id;

    @Column(length = 200)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime created_at;

    private LocalDateTime processed_at;
}