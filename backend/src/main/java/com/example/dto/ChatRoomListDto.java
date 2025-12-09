package com.example.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRoomListDto {
    private Long chatroomId;

    private Long otherUserId;
    private String otherUserNickname;
    private String otherUserProfileImage;

    // [추가됨] 게시글 정보 (목록 표시용)
    private String postTitle;
    private String postImage;

    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
}