package com.example.service;

import com.example.dto.PostDetailResponseDto;
import com.example.dto.PostListResponseDto;
import com.example.entity.Post;
import com.example.entity.PostImage;
import com.example.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;

    /**
     * 1. 메인 페이지 게시글 목록 조회
     * - 삭제되지 않은 모든 게시글을 최신순으로 가져와 DTO로 변환합니다.
     */
    public List<PostListResponseDto> getAllPosts() {
        // Repository에서 엔티티 리스트 조회
        List<Post> posts = postRepository.findAllDesc();

        // Entity -> DTO 변환 (Stream 사용)
        return posts.stream()
                .map(this::convertToListDto)
                .collect(Collectors.toList());
    }

    /**
     * 2. 게시글 상세 조회
     * - 특정 게시글(postId)을 조회하여 상세 DTO로 변환합니다.
     * - 게시글이 없거나 삭제된 경우 예외를 발생시킵니다.
     */
    public PostDetailResponseDto getPostDetail(Long postId) {
        Post post = postRepository.findActivePostById(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않거나 삭제되었습니다. id=" + postId));

        return convertToDetailDto(post);
    }

    // [내부 메서드] Post 엔티티 -> PostListResponseDto 변환
    private PostListResponseDto convertToListDto(Post post) {
        // 대표 이미지 URL 추출 (이미지가 없으면 null 또는 기본 이미지 처리)
        String thumbnailUrl = null;
        if (!post.getImages().isEmpty()) {
            // 정렬 순서(sort_order)가 가장 빠른 첫 번째 이미지를 썸네일로 사용
            thumbnailUrl = post.getImages().get(0).getUrl();
        }

        return PostListResponseDto.builder()
                .postId(post.getPost_id())
                .title(post.getTitle())
                .price(post.getPrice())
                // Location 엔티티의 메서드를 몰라 임시로 null 처리 (추후 수정 필요)
                .location("위치 정보 없음")
                .thumbnailUrl(thumbnailUrl)
                .status(post.getStatus().name()) // Enum -> String
                .createdAt(post.getCreated_at())
                .likeCount(0) // 좋아요 기능 미구현으로 0 처리
                .chatCount(0) // 채팅 수 미구현으로 0 처리
                .build();
    }

    // [내부 메서드] Post 엔티티 -> PostDetailResponseDto 변환
    private PostDetailResponseDto convertToDetailDto(Post post) {
        // 전체 이미지 URL 리스트 추출
        List<String> imageUrls = post.getImages().stream()
                .map(PostImage::getUrl)
                .collect(Collectors.toList());

        return PostDetailResponseDto.builder()
                .postId(post.getPost_id())
                .title(post.getTitle())
                // Category 엔티티 메서드 미확인으로 임시 처리
                .category("카테고리 없음")
                .price(post.getPrice())
                .content(post.getContent())
                // Location 엔티티 메서드 미확인으로 임시 처리
                .location("위치 정보 없음")
                .status(post.getStatus().name())
                .imageUrls(imageUrls)
                .viewCount(post.getView_count())
                .createdAt(post.getCreated_at())
                // 판매자 정보 매핑
                .sellerId(post.getSeller().getUser_id())
                .sellerNickname(post.getSeller().getNickname())
                .sellerProfileImage(post.getSeller().getProfile_image_url())
                .sellerMannerScore(post.getSeller().getManner_score())
                .build();
    }
}