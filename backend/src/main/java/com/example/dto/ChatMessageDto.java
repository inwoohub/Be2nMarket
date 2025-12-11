package com.example.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {

    private Long chatroomId;
    private Long senderId;
    private String content;
    private String createdAt;

    // [추가됨] 보낸 사람 닉네임 (채팅방 표시용)
    private String senderNickname;

    // [추가됨] 보낸 사람 프로필 이미지 URL (채팅방 표시용)
    private String senderProfileImage;
}