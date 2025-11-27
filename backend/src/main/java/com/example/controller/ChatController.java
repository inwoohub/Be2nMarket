package com.example.controller;

import com.example.dto.ChatMessageDto;
import com.example.entity.ChatMessage;
import com.example.entity.ChatRoom;
import com.example.entity.User;
import com.example.repository.ChatMessageRepository;
import com.example.repository.ChatRoomRepository;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    /**
     * 1. 메시지 전송 (WebSocket)
     */
    @MessageMapping("/chat/send")
    @Transactional
    public void sendMessage(ChatMessageDto messageDto) {

        ChatRoom chatRoom = chatRoomRepository.findById(messageDto.getChatroomId())
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        User sender = userRepository.findById(messageDto.getSenderId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        ChatMessage chatMessage = ChatMessage.builder()
                .chatroom(chatRoom)
                .sender(sender)
                .content(messageDto.getContent())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // 시간 처리 (getCreated_at)
        if (savedMessage.getCreated_at() != null) {
            messageDto.setCreatedAt(savedMessage.getCreated_at().toString());
        } else {
            messageDto.setCreatedAt(LocalDateTime.now().toString());
        }

        // 방 번호 Getter 수정 (getChatroom_id)
        messagingTemplate.convertAndSend("/topic/chatroom/" + chatRoom.getChatroom_id(), messageDto);
    }

    /**
     * 2. 기존 대화 내역 조회 (HTTP GET)
     */
    @GetMapping("/api/chat/room/{chatroomId}/messages")
    @ResponseBody
    public List<ChatMessageDto> getMessages(@PathVariable Long chatroomId) {

        // 리포지토리에서 메시지 가져오기
        List<ChatMessage> messages = chatMessageRepository.findByChatroom_ChatroomIdOrderByCreatedAtAsc(chatroomId);

        List<ChatMessageDto> messageDtos = new ArrayList<>();

        for (ChatMessage msg : messages) {
            ChatMessageDto dto = new ChatMessageDto();

            dto.setChatroomId(msg.getChatroom().getChatroom_id());

            dto.setSenderId(msg.getSender().getUser_id());
            dto.setContent(msg.getContent());

            if (msg.getCreated_at() != null) {
                dto.setCreatedAt(msg.getCreated_at().toString());
            } else {
                dto.setCreatedAt(LocalDateTime.now().toString());
            }

            messageDtos.add(dto);
        }

        return messageDtos;
    }
}