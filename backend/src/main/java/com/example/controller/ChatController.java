package com.example.controller;

import com.example.dto.ChatMessageDto;
import com.example.dto.ChatRoomDetailDto;
import com.example.dto.ChatRoomListDto;
import com.example.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    /**
     * 1. 메시지 전송 (WebSocket)
     * - /app/chat/send 로 들어온 메시지를 처리합니다.
     */
    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageDto messageDto) {
        ChatMessageDto savedMessage = chatService.saveMessage(messageDto);
        // [수정] RabbitMQ 규칙에 맞춰 "/topic/chatroom.{방번호}" 형식으로 메시지를 발행합니다.
        messagingTemplate.convertAndSend("/topic/chatroom." + savedMessage.getChatroomId(), savedMessage);
    }

    /**
     * 2. 채팅방 내부 대화 내역 조회 (HTTP GET)
     */
    @GetMapping("/api/chat/room/{chatroomId}/messages")
    @ResponseBody
    public List<ChatMessageDto> getMessages(@PathVariable Long chatroomId) {
        return chatService.getMessages(chatroomId);
    }

    /**
     * 3. 내 채팅방 목록 조회 (HTTP GET)
     */
    @GetMapping("/api/chat/list/{userId}")
    @ResponseBody
    public List<ChatRoomListDto> getChatRoomList(@PathVariable Long userId) {
        return chatService.getChatRoomList(userId);
    }

    /**
     * 4. 채팅방 생성 또는 기존 방 조회 (HTTP POST)
     */
    @PostMapping("/api/chat/room")
    @ResponseBody
    public Long createOrFindChatRoom(@RequestBody Map<String, Long> request) {
        Long myId = request.get("myId");
        Long sellerId = request.get("sellerId");
        Long postId = request.get("postId");

        return chatService.createOrFindChatRoom(myId, sellerId, postId);
    }

    /**
     * 5. 채팅방 상세 정보 조회 (헤더 표시용) (HTTP GET)
     */
    @GetMapping("/api/chat/room/{chatroomId}/info")
    @ResponseBody
    public ChatRoomDetailDto getChatRoomInfo(@PathVariable Long chatroomId, @RequestParam Long myId) {
        return chatService.getChatRoomDetail(chatroomId, myId);
    }
}