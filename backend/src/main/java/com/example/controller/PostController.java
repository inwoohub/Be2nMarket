package com.example.controller;

import com.example.dto.PostDetailResponseDto;
import com.example.dto.PostListResponseDto;
import com.example.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    /**
     * 1. 메인 페이지 게시글 목록 조회 API
     * - 경로: GET /api/posts
     * - 반환: 모든 게시글의 요약 정보 리스트 (최신순)
     */
    @GetMapping
    public List<PostListResponseDto> getAllPosts() {
        return postService.getAllPosts();
    }

    /**
     * 2. 게시글 상세 조회 API
     * - 경로: GET /api/posts/{postId}
     * - 반환: 특정 게시글의 상세 정보 (사진, 내용, 판매자 정보 등)
     */
    @GetMapping("/{postId}")
    public PostDetailResponseDto getPostDetail(@PathVariable Long postId) {
        return postService.getPostDetail(postId);
    }
}