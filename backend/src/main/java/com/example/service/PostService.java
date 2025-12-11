package com.example.service;

import com.example.dto.PostCreateRequestDto;
import com.example.dto.PostDetailResponseDto;
import com.example.dto.PostListResponseDto;
import com.example.entity.*;
import com.example.repository.CategoryRepository;
import com.example.repository.LocationRepository;
import com.example.repository.PostRepository;
import com.example.repository.UserRepository;
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
    private final CategoryRepository categoryRepository; // 필요 시 생성 확인
    private final LocationRepository locationRepository; // 필요 시 생성 확인
    private final S3Uploader s3Uploader; // S3 업로더 주입

    /**
     * [추가됨] 게시글 생성
     * - 이미지 파일들을 S3에 업로드하고 게시글과 함께 저장합니다.
     */
    @Transactional
    public Long createPost(Long userId, PostCreateRequestDto requestDto, List<MultipartFile> images) throws IOException {
        // 1. 연관 엔티티 조회
        User seller = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id=" + userId));

        Category category = categoryRepository.findById(requestDto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다. id=" + requestDto.getCategoryId()));

        Location location = locationRepository.findById(requestDto.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("위치 정보를 찾을 수 없습니다. id=" + requestDto.getLocationId()));

        // 2. 게시글 엔티티 생성
        Post post = Post.builder()
                .seller(seller)
                .category(category)
                .location(location)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .price(requestDto.getPrice())
                .created_at(LocalDateTime.now()) // 빌더 패턴에서 자동 생성 안 될 경우 명시
                .build();

        // 3. 이미지 업로드 및 저장
        if (images != null && !images.isEmpty()) {
            List<PostImage> postImages = new ArrayList<>();
            for (int i = 0; i < images.size(); i++) {
                MultipartFile file = images.get(i);
                if (file.isEmpty()) continue;

                // S3 업로드 (폴더명: "post")
                String imageUrl = s3Uploader.upload(file, "post");

                // PostImage 엔티티 생성
                PostImage postImage = PostImage.builder()
                        .post(post)
                        .url(imageUrl)
                        .sort_order(i)
                        .build();

                postImages.add(postImage);
            }
            // 양방향 연관관계 설정 (CascadeType.ALL로 인해 post 저장 시 같이 저장됨)
            post.setImages(postImages);
        }

        // 4. 저장
        Post savedPost = postRepository.save(post);
        return savedPost.getPost_id();
    }

    /**
     * 1. 메인 페이지 게시글 목록 조회
     */
    public List<PostListResponseDto> getAllPosts() {
        List<Post> posts = postRepository.findAllDesc();
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

    private PostListResponseDto convertToListDto(Post post) {
        String thumbnailUrl = null;
        if (!post.getImages().isEmpty()) {
            thumbnailUrl = post.getImages().get(0).getUrl();
        }

        return PostListResponseDto.builder()
                .postId(post.getPost_id())
                .title(post.getTitle())
                .price(post.getPrice())
                // Location 엔티티의 실제 메서드 사용 (이전 코드는 null 처리했었음)
                .location(post.getLocation().getDisplay_name())
                .thumbnailUrl(thumbnailUrl)
                .status(post.getStatus().name())
                .createdAt(post.getCreated_at())
                .likeCount(0)
                .chatCount(0)
                .build();
    }

    private PostDetailResponseDto convertToDetailDto(Post post) {
        List<String> imageUrls = post.getImages().stream()
                .map(PostImage::getUrl)
                .collect(Collectors.toList());

        return PostDetailResponseDto.builder()
                .postId(post.getPost_id())
                .title(post.getTitle())
                .category(post.getCategory().getName()) // 실제 카테고리명 사용
                .price(post.getPrice())
                .content(post.getContent())
                .location(post.getLocation().getDisplay_name()) // 실제 위치명 사용
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