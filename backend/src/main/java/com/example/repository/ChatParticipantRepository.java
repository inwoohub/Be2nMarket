package com.example.repository;

import com.example.entity.ChatParticipant;
import com.example.entity.embeddable.ChatParticipantId; // 이 경로가 맞는지 확인해주세요
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, ChatParticipantId> {
}