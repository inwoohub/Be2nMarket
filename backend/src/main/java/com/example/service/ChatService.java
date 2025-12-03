package com.example.service;

import com.example.dto.ChatMessageDto;
import com.example.dto.ChatRoomListDto;
import com.example.entity.*;
import com.example.entity.embeddable.ChatParticipantId;
import com.example.repository.ChatMessageRepository;
import com.example.repository.ChatParticipantRepository;
import com.example.repository.ChatRoomRepository;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final ChatParticipantRepository chatParticipantRepository;

    // ... (기존 saveMessage, getMessages 등은 그대로 유지) ...
    // 편의상 기존 코드는 생략하고 새로 추가되는 메서드만 강조하겠습니다.
    // 실제 파일에는 기존 메서드들도 다 있어야 합니다.

    @Transactional
    public ChatMessageDto saveMessage(ChatMessageDto messageDto) {
        // (기존 코드 유지)
        ChatRoom chatRoom = chatRoomRepository.findById(messageDto.getChatroomId())
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        User sender = userRepository.findById(messageDto.getSenderId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        ChatMessage chatMessage = ChatMessage.builder().chatroom(chatRoom).sender(sender).content(messageDto.getContent()).build();
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        if (savedMessage.getCreated_at() != null) messageDto.setCreatedAt(savedMessage.getCreated_at().toString());
        else messageDto.setCreatedAt(LocalDateTime.now().toString());
        return messageDto;
    }

    public List<ChatMessageDto> getMessages(Long chatroomId) {
        // (기존 코드 유지)
        List<ChatMessage> messages = chatMessageRepository.findByChatroom_ChatroomIdOrderByCreatedAtAsc(chatroomId);
        List<ChatMessageDto> messageDtos = new ArrayList<>();
        for (ChatMessage msg : messages) {
            ChatMessageDto dto = new ChatMessageDto();
            dto.setChatroomId(msg.getChatroom().getChatroom_id());
            dto.setSenderId(msg.getSender().getUser_id());
            dto.setContent(msg.getContent());
            dto.setCreatedAt(msg.getCreated_at() != null ? msg.getCreated_at().toString() : LocalDateTime.now().toString());
            messageDtos.add(dto);
        }
        return messageDtos;
    }

    public List<ChatRoomListDto> getChatRoomList(Long userId) {
        // (기존 코드 유지)
        List<ChatParticipant> myParticipations = chatParticipantRepository.findAllByUserId(userId);
        List<ChatRoomListDto> chatRoomList = new ArrayList<>();
        for (ChatParticipant myParticipant : myParticipations) {
            ChatRoom chatRoom = myParticipant.getChatroom();
            User otherUser = null;
            for (ChatParticipant participant : chatRoom.getParticipants()) {
                if (!participant.getUser().getUser_id().equals(userId)) {
                    otherUser = participant.getUser();
                    break;
                }
            }
            if (otherUser == null) continue;
            List<ChatMessage> messages = chatMessageRepository.findLatestMessages(chatRoom.getChatroom_id());
            ChatMessage lastMessage = messages.isEmpty() ? null : messages.get(0);
            ChatRoomListDto dto = ChatRoomListDto.builder()
                    .chatroomId(chatRoom.getChatroom_id())
                    .otherUserId(otherUser.getUser_id())
                    .otherUserNickname(otherUser.getNickname())
                    .otherUserProfileImage(otherUser.getProfile_image_url())
                    .unreadCount(myParticipant.getUnread_count())
                    .build();
            if (lastMessage != null) {
                dto.setLastMessage(lastMessage.getContent());
                dto.setLastMessageTime(lastMessage.getCreated_at());
            } else {
                dto.setLastMessage("대화 내용이 없습니다.");
                dto.setLastMessageTime(null);
            }
            chatRoomList.add(dto);
        }
        Collections.sort(chatRoomList, new Comparator<ChatRoomListDto>() {
            @Override
            public int compare(ChatRoomListDto o1, ChatRoomListDto o2) {
                if (o1.getLastMessageTime() == null) return 1;
                if (o2.getLastMessageTime() == null) return -1;
                return o2.getLastMessageTime().compareTo(o1.getLastMessageTime());
            }
        });
        return chatRoomList;
    }

    /**
     * [추가됨] 4. 채팅방 생성 또는 조회
     * - 구매자(myId)와 판매자(sellerId) 사이의 방이 있으면 그 ID를 반환.
     * - 없으면 새로 만들어서 ID 반환.
     */
    @Transactional
    public Long createOrFindChatRoom(Long myId, Long sellerId) {
        if (myId.equals(sellerId)) {
            throw new IllegalArgumentException("자기 자신과는 채팅할 수 없습니다.");
        }

        // 1. 기존 방이 있는지 확인
        Optional<ChatRoom> existingRoom = chatRoomRepository.findChatRoomByUsers(myId, sellerId);
        if (existingRoom.isPresent()) {
            return existingRoom.get().getChatroom_id();
        }

        // 2. 없으면 새 방 생성
        ChatRoom newRoom = new ChatRoom(); // created_at은 @CreationTimestamp로 자동 생성
        chatRoomRepository.save(newRoom);

        // 3. 참여자 정보(나) 생성 및 저장
        User me = userRepository.findById(myId).orElseThrow(() -> new IllegalArgumentException("내 유저 정보 없음"));
        ChatParticipant participant1 = ChatParticipant.builder()
                .id(new ChatParticipantId(newRoom.getChatroom_id(), myId))
                .chatroom(newRoom)
                .user(me)
                .build();
        chatParticipantRepository.save(participant1);

        // 4. 참여자 정보(상대방) 생성 및 저장
        User seller = userRepository.findById(sellerId).orElseThrow(() -> new IllegalArgumentException("판매자 유저 정보 없음"));
        ChatParticipant participant2 = ChatParticipant.builder()
                .id(new ChatParticipantId(newRoom.getChatroom_id(), sellerId))
                .chatroom(newRoom)
                .user(seller)
                .build();
        chatParticipantRepository.save(participant2);

        return newRoom.getChatroom_id();
    }
}