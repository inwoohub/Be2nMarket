//package com.example.backend;
//
//import com.example.entity.ChatParticipant;
//import com.example.entity.ChatRoom;
//import com.example.entity.User;
//import com.example.entity.embeddable.ChatParticipantId;
//import com.example.entity.enums.ChatRole;
//import com.example.repository.ChatParticipantRepository;
//import com.example.repository.ChatRoomRepository;
//import com.example.repository.UserRepository;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.context.ActiveProfiles;
//
//@SpringBootTest
//@ActiveProfiles("dev")
//public class DbConnectionTest {
//
//    @Autowired private UserRepository userRepository;
//    @Autowired private ChatRoomRepository chatRoomRepository;
//    @Autowired private ChatParticipantRepository chatParticipantRepository;
//
//    @Test
//    @DisplayName("채팅방 생성 및 유저 2명 입장 테스트")
//    void createChatRoomTest() {
//        // 1. 아까 만든 유저 불러오기 (없으면 에러남)
//        User buyer = userRepository.findById(1001L).orElseThrow(() -> new RuntimeException("구매자가 없습니다. 먼저 유저를 생성하세요."));
//        User seller = userRepository.findById(1002L).orElseThrow(() -> new RuntimeException("판매자가 없습니다. 먼저 유저를 생성하세요."));
//
//        // 2. 채팅방 하나 만들기 (저장)
//        ChatRoom chatRoom = new ChatRoom();
//        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
//        System.out.println(">>> 채팅방 생성 완료! 방 번호: " + savedRoom.getChatroom_id());
//
//        // 3. 구매자 입장시키기 (Participant 생성)
//        // 복합키(Id) 객체 생성
//        ChatParticipantId buyerId = new ChatParticipantId(savedRoom.getChatroom_id(), buyer.getUser_id());
//
//        ChatParticipant buyerParticipant = ChatParticipant.builder()
//                .id(buyerId)
//                .chatroom(savedRoom)
//                .user(buyer)
//                .role(ChatRole.MEMBER)
//                .build();
//
//        chatParticipantRepository.save(buyerParticipant);
//
//        // 4. 판매자 입장시키기
//        ChatParticipantId sellerId = new ChatParticipantId(savedRoom.getChatroom_id(), seller.getUser_id());
//
//        ChatParticipant sellerParticipant = ChatParticipant.builder()
//                .id(sellerId)
//                .chatroom(savedRoom)
//                .user(seller)
//                .role(ChatRole.MEMBER)
//                .build();
//
//        chatParticipantRepository.save(sellerParticipant);
//
//        System.out.println(">>> 구매자와 판매자가 채팅방에 입장했습니다.");
//    }
//}