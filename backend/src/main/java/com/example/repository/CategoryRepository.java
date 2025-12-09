package com.example.repository;

import com.example.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    // 기본 CRUD 메서드(findById 등)는 JpaRepository가 자동으로 제공합니다.
}