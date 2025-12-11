package com.example.repository;

import com.example.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    // 1. 모든 시/도 목록 (중복 제거)
    @Query("SELECT DISTINCT l.sido FROM Location l WHERE l.sido IS NOT NULL ORDER BY l.sido")
    List<String> findDistinctSido();

    // 2. 해당 시/도에 속한 시/군/구 목록
    @Query("SELECT DISTINCT l.sigungu FROM Location l WHERE l.sido = :sido AND l.sigungu IS NOT NULL ORDER BY l.sigungu")
    List<String> findDistinctSigungu(@Param("sido") String sido);

    // 3. 해당 시/도 + 시/군/구에 속한 읍/면/동 목록 (Location 엔티티 전체 반환)
    @Query("SELECT l FROM Location l WHERE l.sido = :sido AND l.sigungu = :sigungu ORDER BY l.eupmyeondong")
    List<Location> findDongList(@Param("sido") String sido, @Param("sigungu") String sigungu);
}