package com.example.controller;

import com.example.dto.LocationDto;
import com.example.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    // 1. 시/도 목록
    @GetMapping("/sido")
    public ResponseEntity<List<LocationDto.SidoResponse>> getSidoList() {
        return ResponseEntity.ok(locationService.getSidoList());
    }

    // 2. 시/군/구 목록 (쿼리 파라미터로 sido 받음)
    @GetMapping("/sigungu")
    public ResponseEntity<List<LocationDto.SigunguResponse>> getSigunguList(@RequestParam String sido) {
        return ResponseEntity.ok(locationService.getSigunguList(sido));
    }

    // 3. 읍/면/동 목록 (쿼리 파라미터로 sido, sigungu 받음)
    @GetMapping("/dong")
    public ResponseEntity<List<LocationDto.DongResponse>> getDongList(
            @RequestParam String sido, 
            @RequestParam String sigungu) {
        return ResponseEntity.ok(locationService.getDongList(sido, sigungu));
    }

    // 4. 사용자 위치 설정 (POST)
    @PostMapping("/user")
    public ResponseEntity<String> setUserLocation(@RequestBody LocationDto.SetLocationRequest request) {
        locationService.registerUserLocation(request);
        return ResponseEntity.ok("위치 설정이 완료되었습니다.");
    }
}