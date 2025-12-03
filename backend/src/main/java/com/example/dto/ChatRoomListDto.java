package com.example.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRoomListDto {
    // 채팅방 ID (클릭 시 이동할 경로에 사용)
    private Long chatroomId;

    // 상대방 유저 ID (프로필 조회 등에 사용)
    private Long otherUserId;

    // 상대방 닉네임 (목록에 표시)
    private String otherUserNickname;

    // 상대방 프로필 이미지 URL (목록에 표시)
    private String otherUserProfileImage;

    // 해당 방의 마지막 대화 내용
    private String lastMessage;

    // 마지막 대화 시간 (정렬 및 표시용)
    private LocalDateTime lastMessageTime;

    // 안 읽은 메시지 개수 (뱃지 표시용)
    private Integer unreadCount;
}