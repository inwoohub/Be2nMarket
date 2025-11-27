package com.example.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {

    // 1. 채팅방 번호 (어느 방에 보낼지)
    // JSON으로 보낼 때: "chatroomId": 1
    private Long chatroomId;

    // 2. 보낸 사람 ID (누가 보냈는지)
    // JSON으로 보낼 때: "senderId": 1001
    private Long senderId;

    // 3. 메시지 내용
    // JSON으로 보낼 때: "content": "안녕하세요"
    private String content;

    // 4. 보낸 시간 (서버에서 생성해서 내려줄 때 사용)
    private String createdAt;
}