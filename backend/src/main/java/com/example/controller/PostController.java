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
     * 1. 게시글 목록 조회 API
     * - sellerId 파라미터가 없으면: 전체 조회 (메인페이지)
     * - sellerId 파라미터가 있으면: 해당 판매자의 글만 조회 (판매내역 페이지)
     */
    @GetMapping
    public List<PostListResponseDto> getAllPosts(@RequestParam(required = false) Long sellerId) {
        if (sellerId != null) {
            // ⭐ 판매자 ID가 있으면 필터링해서 조회
            return postService.getPostsBySeller(sellerId);
        }
        // 없으면 전체 조회
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
     * 3. 게시글 생성 API
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
        
        Long postId = postService.createPost(sessionUser.id(), requestDto, images);
        return ResponseEntity.ok(postId);
    }
}