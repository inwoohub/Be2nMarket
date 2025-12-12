package com.example.repository;

import com.example.entity.UserLocation;
import com.example.entity.embeddable.UserLocationId; // 패키지 경로 확인!
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserLocationRepository extends JpaRepository<UserLocation, UserLocationId> {
    
    // 유저 ID로 위치 설정 여부 확인 (count가 0보다 크면 true)
    @Query("SELECT COUNT(ul) > 0 FROM UserLocation ul WHERE ul.user.user_id = :userId")
    boolean existsByUserId(@Param("userId") Long userId);


    @Query("SELECT ul FROM UserLocation ul " +
            "WHERE ul.user.user_id = :userId AND ul.is_primary = true")
    Optional<UserLocation> findPrimaryByUserId(@Param("userId") Long userId);

}