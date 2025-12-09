package com.example.service;

import com.example.dto.ChatMessageDto;
import com.example.dto.ChatRoomDetailDto;
import com.example.dto.ChatRoomListDto;
import com.example.entity.*;
import com.example.entity.embeddable.ChatParticipantId;
import com.example.repository.*;
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
    private final PostRepository postRepository;

    @Transactional
    public ChatMessageDto saveMessage(ChatMessageDto messageDto) {
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

        messageDto.setSenderNickname(sender.getNickname());
        messageDto.setSenderProfileImage(sender.getProfile_image_url());

        if (savedMessage.getCreated_at() != null) messageDto.setCreatedAt(savedMessage.getCreated_at().toString());
        else messageDto.setCreatedAt(LocalDateTime.now().toString());

        return messageDto;
    }

    public List<ChatMessageDto> getMessages(Long chatroomId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatroom_ChatroomIdOrderByCreatedAtAsc(chatroomId);
        List<ChatMessageDto> messageDtos = new ArrayList<>();

        for (ChatMessage msg : messages) {
            ChatMessageDto dto = new ChatMessageDto();
            dto.setChatroomId(msg.getChatroom().getChatroom_id());
            dto.setSenderId(msg.getSender().getUser_id());
            dto.setContent(msg.getContent());
            dto.setCreatedAt(msg.getCreated_at() != null ? msg.getCreated_at().toString() : LocalDateTime.now().toString());
            dto.setSenderNickname(msg.getSender().getNickname());
            dto.setSenderProfileImage(msg.getSender().getProfile_image_url());
            messageDtos.add(dto);
        }
        return messageDtos;
    }

    // [수정됨] 채팅방 목록 조회 (게시글 정보 포함)
    public List<ChatRoomListDto> getChatRoomList(Long userId) {
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

            // 게시글 정보 가져오기
            Post post = chatRoom.getPost();
            String postTitle = (post != null) ? post.getTitle() : "알 수 없는 게시글";
            String postImage = null;
            if (post != null && !post.getImages().isEmpty()) {
                postImage = post.getImages().get(0).getUrl();
            }

            ChatRoomListDto dto = ChatRoomListDto.builder()
                    .chatroomId(chatRoom.getChatroom_id())
                    .otherUserId(otherUser.getUser_id())
                    .otherUserNickname(otherUser.getNickname())
                    .otherUserProfileImage(otherUser.getProfile_image_url())
                    .postTitle(postTitle) // [추가]
                    .postImage(postImage) // [추가]
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

    @Transactional
    public Long createOrFindChatRoom(Long myId, Long sellerId, Long postId) {
        if (myId.equals(sellerId)) {
            throw new IllegalArgumentException("자기 자신과는 채팅할 수 없습니다.");
        }
        Optional<ChatRoom> existingRoom = chatRoomRepository.findByPostIdAndUserId(postId, myId);
        if (existingRoom.isPresent()) {
            return existingRoom.get().getChatroom_id();
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        ChatRoom newRoom = new ChatRoom();
        newRoom.setPost(post);
        chatRoomRepository.save(newRoom);

        User me = userRepository.findById(myId).orElseThrow(() -> new IllegalArgumentException("내 유저 정보 없음"));
        ChatParticipant participant1 = ChatParticipant.builder()
                .id(new ChatParticipantId(newRoom.getChatroom_id(), myId))
                .chatroom(newRoom)
                .user(me)
                .build();
        chatParticipantRepository.save(participant1);

        User seller = userRepository.findById(sellerId).orElseThrow(() -> new IllegalArgumentException("판매자 유저 정보 없음"));
        ChatParticipant participant2 = ChatParticipant.builder()
                .id(new ChatParticipantId(newRoom.getChatroom_id(), sellerId))
                .chatroom(newRoom)
                .user(seller)
                .build();
        chatParticipantRepository.save(participant2);

        return newRoom.getChatroom_id();
    }

    public ChatRoomDetailDto getChatRoomDetail(Long chatroomId, Long myId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatroomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        User otherUser = null;
        for (ChatParticipant p : chatRoom.getParticipants()) {
            if (!p.getUser().getUser_id().equals(myId)) {
                otherUser = p.getUser();
                break;
            }
        }

        if (otherUser == null) {
            return ChatRoomDetailDto.builder()
                    .chatroomId(chatroomId)
                    .postTitle("대화 상대 없음")
                    .build();
        }

        Post post = chatRoom.getPost();
        String postImage = null;
        if (post != null && post.getImages() != null && !post.getImages().isEmpty()) {
            postImage = post.getImages().get(0).getUrl();
        }

        return ChatRoomDetailDto.builder()
                .chatroomId(chatroomId)
                .otherUserId(otherUser.getUser_id())
                .otherUserNickname(otherUser.getNickname())
                .postId(post != null ? post.getPost_id() : null)
                .postTitle(post != null ? post.getTitle() : "게시글 정보 없음")
                .postPrice(post != null ? post.getPrice() : 0L)
                .postStatus(post != null ? post.getStatus().name() : "")
                .postImage(postImage)
                .build();
    }
}