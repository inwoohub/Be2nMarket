package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.example.entity")                 // 엔티티가 com.example.entity 하위가 아니면 수정
@EnableJpaRepositories(basePackages = "com.example.repository")  // 리포지토리 패키지 위치 맞추기
public class CarrotMarketApplication {
    public static void main(String[] args) {
        SpringApplication.run(CarrotMarketApplication.class, args);
    }
}
