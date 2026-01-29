package com.example.service;

import com.example.dto.BuyerCandidateDto;
import com.example.dto.TradeCompleteReqDto;
import com.example.entity.Post;
import com.example.entity.Trade;
import com.example.entity.User;
import com.example.entity.enums.PostStatus;
import com.example.entity.enums.TradeStatus;
import com.example.repository.ChatParticipantRepository;
import com.example.repository.PostRepository;
import com.example.repository.TradeRepository;
import com.example.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TradeService {

    private final ChatParticipantRepository chatParticipantRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TradeRepository tradeRepository;

    // 1. 구매자 후보 목록 조회 (채팅한 사람들)
    public List<BuyerCandidateDto> getBuyerCandidates(Long userId, Long postId) {
        // 내가 쓴 글인지 확인 (선택사항이지만 안전을 위해)
        // 일단 Repository에서 user_id != userId 조건으로 걸러내므로 바로 호출
        List<User> candidates = chatParticipantRepository.findBuyerCandidates(postId, userId);

        return candidates.stream()
                .map(user -> new BuyerCandidateDto(
                        user.getUser_id(),
                        user.getNickname(),
                        user.getProfile_image_url()
                ))
                .collect(Collectors.toList());
    }

    // 2. 거래 확정 (판매 완료 처리)
    @Transactional
    public Long completeTrade(Long sellerId, TradeCompleteReqDto dto) {
        // (1) 게시글 조회
        Post post = postRepository.findById(dto.postId())
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // (2) 판매자 본인 확인
        if (!post.getSeller().getUser_id().equals(sellerId)) {
            throw new IllegalArgumentException("판매자만 거래를 완료할 수 있습니다.");
        }

        // (3) 구매자 조회
        User buyer = userRepository.findById(dto.buyerId())
                .orElseThrow(() -> new IllegalArgumentException("구매자를 찾을 수 없습니다."));

        // (4) Trade 엔티티 생성 및 저장
        Trade trade = Trade.builder()
                .post(post)
                .seller(post.getSeller())
                .buyer(buyer)
                .price(post.getPrice())
                // Enum 값 확인 필요: COMPLETED가 없다면 DB에 맞는 값으로 수정 (예: PAID, SOLDOUT 등)
                // TradeStatus에 'COMPLETED'가 있다고 가정합니다. 없으면 'PAID' 등을 사용하세요.
                .status(TradeStatus.COMPLETED) 
                .build();

        tradeRepository.save(trade);

        // (5) Post 상태 변경 (판매중 -> 판매완료)
        // PostStatus에 'SOLD'가 있다고 가정합니다.
        post.setStatus(PostStatus.SOLD); 
        
        // (6) (중요) 프론트에서 리뷰 페이지로 이동할 때 쓸 tradeId 반환
        return trade.getTrade_id();
    }
}