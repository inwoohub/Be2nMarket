package com.example.controller;

import com.example.dto.ChatMessageDto;
import com.example.dto.ChatRoomDetailDto;
import com.example.dto.ChatRoomListDto;
import com.example.service.ChatService;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
     */
    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageDto messageDto) {
        ChatMessageDto savedMessage = chatService.saveMessage(messageDto);
        messagingTemplate.convertAndSend("/topic/chatroom." + savedMessage.getChatroomId(), savedMessage);
    }

    /**
     * 2. 채팅방 내부 대화 내역 조회 (HTTP GET)
     */
    @GetMapping("/api/chat/room/{chatroomId}/messages")
    @ResponseBody
    public ResponseEntity<?> getMessages(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @PathVariable Long chatroomId) {
        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "UNAUTHORIZED", "message", "로그인이 필요합니다."));
        }
        return ResponseEntity.ok(chatService.getMessages(chatroomId));
    }

    /**
     * 3. 내 채팅방 목록 조회 (HTTP GET) - 세션에서 userId 추출
     */
    @GetMapping("/api/chat/list")
    @ResponseBody
    public ResponseEntity<?> getChatRoomList(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser) {
        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "UNAUTHORIZED", "message", "로그인이 필요합니다."));
        }
        return ResponseEntity.ok(chatService.getChatRoomList(sessionUser.id()));
    }

    /**
     * 4. 채팅방 생성 또는 기존 방 조회 (HTTP POST) - 세션에서 myId 추출
     */
    @PostMapping("/api/chat/room")
    @ResponseBody
    public ResponseEntity<?> createOrFindChatRoom(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestBody Map<String, Long> request) {
        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "UNAUTHORIZED", "message", "로그인이 필요합니다."));
        }
        Long sellerId = request.get("sellerId");
        Long postId = request.get("postId");
        return ResponseEntity.ok(chatService.createOrFindChatRoom(sessionUser.id(), sellerId, postId));
    }

    /**
     * 5. 채팅방 상세 정보 조회 (HTTP GET) - 세션에서 myId 추출
     */
    @GetMapping("/api/chat/room/{chatroomId}/info")
    @ResponseBody
    public ResponseEntity<?> getChatRoomInfo(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @PathVariable Long chatroomId) {
        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "UNAUTHORIZED", "message", "로그인이 필요합니다."));
        }
        return ResponseEntity.ok(chatService.getChatRoomDetail(chatroomId, sessionUser.id()));
    }
}
