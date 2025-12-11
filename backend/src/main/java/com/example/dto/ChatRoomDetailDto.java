package com.example.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDetailDto {
    // 채팅방 기본 정보
    private Long chatroomId;

    // 상품 정보 (헤더 표시용)
    private Long postId;
    private String postTitle;
    private String postImage;
    private Long postPrice;
    private String postStatus; // 판매중, 예약중, 거래완료

    // 상대방 정보 (헤더 제목용)
    private Long otherUserId;
    private String otherUserNickname;
}