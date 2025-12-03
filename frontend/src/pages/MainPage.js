import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "../css/Index.css";
import "../css/MainPage.css";

function MainPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    // 현재 로그인한 사용자 ID (없으면 1001번으로 가정)
    const myId = userId ? parseInt(userId) : 1001;

    // 게시글 목록을 저장할 상태 변수
    const [posts, setPosts] = useState([]);

    // 1. 화면 로딩 시 백엔드에서 게시글 목록을 가져옴
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // 백엔드 API 호출: GET /api/posts
                const response = await fetch('http://localhost:8080/api/posts', {
                    method: 'GET',
                    credentials: 'include', // 세션/쿠키 포함
                });

                if (response.ok) {
                    const data = await response.json();
                    setPosts(data); // 가져온 데이터를 상태에 저장
                    console.log(">>> 게시글 목록 로딩 성공:", data.length, "개");
                } else {
                    console.error(">>> 게시글 목록 로딩 실패:", response.status);
                }
            } catch (error) {
                console.error(">>> 에러 발생:", error);
            }
        };

        fetchPosts();
    }, []);

    // 2. 게시글 클릭 시 상세 페이지로 이동
    const handlePostClick = (postId) => {
        // 아직 상세 페이지 라우트는 안 만들었지만, 미리 경로를 지정해둠
        // 예: /posts/1/1001 (게시글ID/내ID)
        navigate(`/posts/${postId}/${myId}`);
    };

    // 3. 가격 포맷팅 함수 (예: 10000 -> 10,000원)
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
    };

    // 4. 시간 포맷팅 (방금 전, 1시간 전 등 간단하게 표시하거나 날짜만 표시)
    const formatTime = (timeString) => {
        if (!timeString) return "";
        // T 이후의 시간 부분만 잘라서 표시 (예: 14:30)
        // 더 정교한 '몇 시간 전' 로직은 나중에 추가 가능
        return timeString.substring(0, 10); 
    };

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                height: '100vh', 
                paddingTop: '7vh', // 헤더 높이만큼 여백
                paddingBottom: '10vh', // 바텀네비 높이만큼 여백
                boxSizing: 'border-box'
            }}>
                {/* 게시글 목록 영역 */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {posts.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#888', marginTop: '50px' }}>
                            <p>등록된 게시글이 없습니다.</p>
                            <p>첫 번째 글을 올려보세요!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div 
                                key={post.postId} 
                                onClick={() => handlePostClick(post.postId)}
                                style={{
                                    display: 'flex',
                                    padding: '15px',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* 썸네일 이미지 */}
                                <div style={{ marginRight: '15px' }}>
                                    <img 
                                        src={post.thumbnailUrl || "https://via.placeholder.com/100"} 
                                        alt="상품 이미지" 
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '8px',
                                            objectFit: 'cover',
                                            backgroundColor: '#eee'
                                        }}
                                    />
                                </div>

                                {/* 상품 정보 */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                                            {post.title}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                                            {post.location} · {formatTime(post.createdAt)}
                                        </div>
                                        <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
                                            {formatPrice(post.price)}
                                        </div>
                                    </div>
                                    
                                    {/* 댓글/좋아요 카운트 (데이터가 있을 때만 표시) */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', color: '#888' }}>
                                        {post.chatCount > 0 && <span style={{ marginRight: '8px' }}>💬 {post.chatCount}</span>}
                                        {post.likeCount > 0 && <span>🤍 {post.likeCount}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default MainPage;