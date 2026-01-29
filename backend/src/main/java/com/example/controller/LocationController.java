package com.example.controller;

import com.example.dto.LocationDto;
import com.example.service.LocationService;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // 4. 사용자 위치 설정 (POST) - 세션에서 userId 추출
    @PostMapping("/user")
    public ResponseEntity<?> setUserLocation(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestBody LocationDto.SetLocationRequest request) {
        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "UNAUTHORIZED", "message", "로그인이 필요합니다."));
        }
        locationService.registerUserLocation(sessionUser.id(), request.getLocationId());
        return ResponseEntity.ok("위치 설정이 완료되었습니다.");
    }
}
