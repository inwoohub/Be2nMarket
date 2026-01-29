package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class LocationDto {

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class SidoResponse {
        private String sido;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class SigunguResponse {
        private String sigungu;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class DongResponse {
        private Long locationId; // 프론트가 나중에 이걸 서버로 보냄
        private String eupmyeondong;
        private String displayName;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class SetLocationRequest {
        private Long locationId; // 선택한 동의 ID
    }
}