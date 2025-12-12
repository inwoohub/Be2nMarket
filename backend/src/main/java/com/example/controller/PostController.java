package com.example.controller;

import com.example.dto.PostCreateRequestDto;
import com.example.dto.PostDetailResponseDto;
import com.example.dto.PostListResponseDto;
import com.example.service.PostService;
import com.example.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    /**
     * 1. 메인 페이지 게시글 목록 조회 API
     */
    @GetMapping
    public List<PostListResponseDto> getAllPosts() {
        return postService.getAllPosts();
    }

    /**
     * 2. 게시글 상세 조회 API
     */
    @GetMapping("/{postId}")
    public PostDetailResponseDto getPostDetail(@PathVariable Long postId) {
        return postService.getPostDetail(postId);
    }

    /**
     * [추가됨] 3. 게시글 생성 API
     * - 경로: POST /api/posts
     * - Content-Type: multipart/form-data
     * - 파라미터:
     * - post (json): 제목, 내용, 가격 등
     * - images (file): 이미지 파일 목록
     * - userId (json field - 임시): 로그인 세션 대신 요청 바디나 파라미터로 받음 (실제로는 세션에서 꺼내야 함)
     * (여기서는 편의상 post DTO 안이나 별도 파라미터로 처리하지 않고, 일단 DTO와 파일을 받습니다.
     * 유저 ID는 세션 연동 전이라 임시로 1001번 고정하거나 파라미터로 받을 수 있습니다.
     * 테스트 편의를 위해 DTO 안에 넣지 않고 @RequestPart로 받습니다.)
     */
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> createPost(
            @SessionAttribute(name = "USER", required = false) SessionUser sessionUser,
            @RequestPart("post") PostCreateRequestDto requestDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) throws IOException {
        if (sessionUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "UNAUTHORIZED",
                    "message", "로그인이 필요합니다."
            ));
        }
        // 실제 서비스 호출 (userId는 파라미터로 받음)
        Long postId = postService.createPost(sessionUser.id(), requestDto, images);
        return ResponseEntity.ok(postId);
    }
}