package com.example.service;

import com.example.dto.LocationDto;
import com.example.entity.Location;
import com.example.entity.User;
import com.example.entity.UserLocation;
import com.example.entity.embeddable.UserLocationId;
import com.example.repository.LocationRepository;
import com.example.repository.UserLocationRepository;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationService {

    private final LocationRepository locationRepository;
    private final UserLocationRepository userLocationRepository;
    private final UserRepository userRepository;

    // 1. 시/도 목록 조회
    public List<LocationDto.SidoResponse> getSidoList() {
        return locationRepository.findDistinctSido().stream()
                .map(LocationDto.SidoResponse::new)
                .collect(Collectors.toList());
    }

    // 2. 시/군/구 목록 조회
    public List<LocationDto.SigunguResponse> getSigunguList(String sido) {
        return locationRepository.findDistinctSigungu(sido).stream()
                .map(LocationDto.SigunguResponse::new)
                .collect(Collectors.toList());
    }

    // 3. 동 목록 조회 (ID 포함)
    public List<LocationDto.DongResponse> getDongList(String sido, String sigungu) {
        return locationRepository.findDongList(sido, sigungu).stream()
                .map(loc -> new LocationDto.DongResponse(
                        loc.getLocation_id(), 
                        loc.getEupmyeondong(), // [수정] getDong() -> getEupmyeondong()
                        loc.getDisplay_name()))
                .collect(Collectors.toList());
    }

    // 4. 유저 위치 저장 (핵심!)
    @Transactional
    public void registerUserLocation(Long userId, Long locationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지역입니다."));

        // 복합키 생성
        UserLocationId id = new UserLocationId(userId, locationId);

        UserLocation userLocation = UserLocation.builder()
                .id(id)
                .user(user)
                .location(location)
                .is_primary(true) // 처음 설정하니까 대표 위치로
                .build();

        userLocationRepository.save(userLocation);
    }
    
    // 5. 로그인 시 위치 설정 여부 확인용
    public boolean hasLocation(Long userId) {
        return userLocationRepository.existsByUserId(userId);
    }
}