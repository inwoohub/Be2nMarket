package com.example.service;

import com.example.dto.PostCreateRequestDto;
import com.example.dto.PostDetailResponseDto;
import com.example.dto.PostListResponseDto;
import com.example.entity.*;
import com.example.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final S3Uploader s3Uploader;
    private final UserLocationRepository userLocationRepository;

    /**
     * 게시글 생성
     */
    @Transactional
    public Long createPost(Long userId, PostCreateRequestDto requestDto, List<MultipartFile> images) throws IOException {
        System.out.println(">>> createPost userId=" + userId +
                ", categoryId=" + requestDto.getCategoryId() +
                ", locationId=" + requestDto.getLocationId());

        User seller = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id=" + userId));

        Category category = categoryRepository.findById(requestDto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다. id=" + requestDto.getCategoryId()));

        UserLocation userLocation = userLocationRepository
                .findPrimaryByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("대표 위치 설정 정보가 없습니다. id="));

        Location location = userLocation.getLocation();

        Post post = Post.builder()
                .seller(seller)
                .category(category)
                .location(location)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .price(requestDto.getPrice())
                .created_at(LocalDateTime.now())
                .build();

        if (images != null && !images.isEmpty()) {
            List<PostImage> postImages = new ArrayList<>();
            for (int i = 0; i < images.size(); i++) {
                MultipartFile file = images.get(i);
                if (file.isEmpty()) continue;

                String imageUrl = s3Uploader.upload(file, "post");

                PostImage postImage = PostImage.builder()
                        .post(post)
                        .url(imageUrl)
                        .sort_order(i)
                        .build();

                postImages.add(postImage);
            }
            post.setImages(postImages);
        }

        Post savedPost = postRepository.save(post);
        return savedPost.getPost_id();
    }

    /**
     * 1. 메인 페이지 게시글 목록 조회 (전체)
     */
    public List<PostListResponseDto> getAllPosts() {
        List<Post> posts = postRepository.findAllDesc();
        return posts.stream()
                .map(this::convertToListDto)
                .collect(Collectors.toList());
    }

    /**
     * ⭐ [추가됨] 특정 판매자의 게시글 목록 조회 (내 판매 내역용)
     */
    public List<PostListResponseDto> getPostsBySeller(Long sellerId) {
        List<Post> posts = postRepository.findAllBySellerId(sellerId);
        return posts.stream()
                .map(this::convertToListDto)
                .collect(Collectors.toList());
    }

    /**
     * 2. 게시글 상세 조회
     */
    public PostDetailResponseDto getPostDetail(Long postId) {
        Post post = postRepository.findActivePostById(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않거나 삭제되었습니다. id=" + postId));

        return convertToDetailDto(post);
    }

    // Entity -> List DTO 변환 (재사용)
    private PostListResponseDto convertToListDto(Post post) {
        String thumbnailUrl = null;
        if (!post.getImages().isEmpty()) {
            thumbnailUrl = post.getImages().get(0).getUrl();
        }

        return PostListResponseDto.builder()
                .postId(post.getPost_id())
                .title(post.getTitle())
                .price(post.getPrice())
                .location(post.getLocation().getDisplay_name())
                .thumbnailUrl(thumbnailUrl)
                .status(post.getStatus().name())
                .createdAt(post.getCreated_at())
                .likeCount(0)
                .chatCount(0)
                .build();
    }

    // Entity -> Detail DTO 변환
    private PostDetailResponseDto convertToDetailDto(Post post) {
        List<String> imageUrls = post.getImages().stream()
                .map(PostImage::getUrl)
                .collect(Collectors.toList());

        return PostDetailResponseDto.builder()
                .postId(post.getPost_id())
                .title(post.getTitle())
                .category(post.getCategory().getName())
                .price(post.getPrice())
                .content(post.getContent())
                .location(post.getLocation().getDisplay_name())
                .status(post.getStatus().name())
                .imageUrls(imageUrls)
                .viewCount(post.getView_count())
                .createdAt(post.getCreated_at())
                .sellerId(post.getSeller().getUser_id())
                .sellerNickname(post.getSeller().getNickname())
                .sellerProfileImage(post.getSeller().getProfile_image_url())
                .sellerMannerScore(post.getSeller().getManner_score())
                .build();
    }
}