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
        messagingTemplate.convertAndSend("/topic/chatroom/" + savedMessage.getChatroomId(), savedMessage);
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
     * - 게시글별 채팅방 분리를 위해 postId를 함께 받습니다.
     */
    @PostMapping("/api/chat/room")
    @ResponseBody
    public Long createOrFindChatRoom(@RequestBody Map<String, Long> request) {
        Long myId = request.get("myId");
        Long sellerId = request.get("sellerId");
        Long postId = request.get("postId"); // [핵심] 게시글 ID를 받아서 서비스로 전달

        return chatService.createOrFindChatRoom(myId, sellerId, postId);
    }

    /**
     * 5. 채팅방 상세 정보 조회 (헤더 표시용) (HTTP GET)
     * - 상품 정보(사진, 가격 등)와 상대방 닉네임을 반환합니다.
     */
    @GetMapping("/api/chat/room/{chatroomId}/info")
    @ResponseBody
    public ChatRoomDetailDto getChatRoomInfo(@PathVariable Long chatroomId, @RequestParam Long myId) {
        return chatService.getChatRoomDetail(chatroomId, myId);
    }
}