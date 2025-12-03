package com.example.controller;

import com.example.dto.ChatMessageDto;
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

    // (기존 sendMessage, getMessages, getChatRoomList 메서드 유지) ...

    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageDto messageDto) {
        ChatMessageDto savedMessage = chatService.saveMessage(messageDto);
        messagingTemplate.convertAndSend("/topic/chatroom/" + savedMessage.getChatroomId(), savedMessage);
    }

    @GetMapping("/api/chat/room/{chatroomId}/messages")
    @ResponseBody
    public List<ChatMessageDto> getMessages(@PathVariable Long chatroomId) {
        return chatService.getMessages(chatroomId);
    }

    @GetMapping("/api/chat/list/{userId}")
    @ResponseBody
    public List<ChatRoomListDto> getChatRoomList(@PathVariable Long userId) {
        return chatService.getChatRoomList(userId);
    }

    /**
     * [추가됨] 4. 채팅방 생성 또는 기존 방 조회 API
     * - 요청: POST /api/chat/room
     * - Body: { "myId": 1001, "sellerId": 1002 }
     * - 응답: 생성되거나 찾은 방 번호 (Long)
     */
    @PostMapping("/api/chat/room")
    @ResponseBody
    public Long createOrFindChatRoom(@RequestBody Map<String, Long> request) {
        Long myId = request.get("myId");
        Long sellerId = request.get("sellerId");
        return chatService.createOrFindChatRoom(myId, sellerId);
    }
}