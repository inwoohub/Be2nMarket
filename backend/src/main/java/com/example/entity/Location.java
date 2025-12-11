package com.example.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "location")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long location_id;

    @Column(nullable = false, length = 100)
    private String display_name;

    @Column(length = 30)
    private String sido;

    @Column(length = 30)
    private String sigungu;

    @Column(length = 30)
    private String eupmyeondong; 
    // ----------------------------

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;
}