import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import "../css/Index.css";
import "../css/MainPage.css";

function PostDetailPage() {
    const { postId, userId } = useParams();
    const navigate = useNavigate();
    
    const myId = userId ? parseInt(userId) : 1001;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setPost(data);
                    console.log(">>> 게시글 상세 로딩 성공:", data);
                } else {
                    console.error(">>> 게시글 로딩 실패:", response.status);
                    alert("게시글을 불러올 수 없습니다.");
                    navigate(-1);
                }
            } catch (error) {
                console.error(">>> 에러:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
    }, [postId, navigate]);

    // [수정됨] 실제 채팅방 생성 API 호출
    const handleChatClick = async () => {
        if (!post) return;

        if (post.sellerId === myId) {
            alert("본인의 게시글입니다.");
            return;
        }

        try {
            // 1. 백엔드에 채팅방 생성/조회 요청
            const response = await fetch('http://localhost:8080/api/chat/room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 세션 유지
                body: JSON.stringify({
                    myId: myId,
                    sellerId: post.sellerId
                }),
            });

            if (response.ok) {
                // 2. 응답받은 방 번호(chatroomId)로 이동
                const chatroomId = await response.json();
                console.log(">>> 채팅방 입장/생성 성공. ID:", chatroomId);
                navigate(`/chat/${chatroomId}/${myId}`);
            } else {
                console.error(">>> 채팅방 생성 실패:", response.status);
                alert("채팅방을 연결할 수 없습니다.");
            }
        } catch (error) {
            console.error(">>> 채팅방 연결 에러:", error);
            alert("오류가 발생했습니다.");
        }
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
    if (!post) return null;

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                height: '100vh',
                position: 'relative'
            }}>
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
                    
                    <div style={{ 
                        width: '100%', 
                        height: '300px', 
                        backgroundColor: '#eee', 
                        display: 'flex', 
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory'
                    }}>
                        {post.imageUrls && post.imageUrls.length > 0 ? (
                            post.imageUrls.map((url, idx) => (
                                <img 
                                    key={idx}
                                    src={url} 
                                    alt={`상품 ${idx}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        flexShrink: 0,
                                        scrollSnapAlign: 'start'
                                    }}
                                />
                            ))
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                이미지가 없습니다.
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                        <img 
                            src={post.sellerProfileImage || "https://via.placeholder.com/50"} 
                            alt="프로필" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', border: '1px solid #eee' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{post.sellerNickname}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{post.location || "지역 정보 없음"}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#0dcc5a', fontWeight: 'bold', fontSize: '14px' }}>
                                {post.sellerMannerScore}℃
                            </div>
                            <div style={{ fontSize: '10px', color: '#888', textDecoration: 'underline' }}>매너온도</div>
                        </div>
                    </div>

                    <div style={{ padding: '20px 15px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', marginTop: 0 }}>
                            {post.title}
                        </h1>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
                            {post.category} · {post.createdAt ? post.createdAt.substring(0, 10) : ''}
                        </div>
                        <div style={{ fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {post.content}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '20px' }}>
                            관심 {0} · 조회 {post.viewCount}
                        </div>
                    </div>
                </div>

                <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '70px', 
                    backgroundColor: 'white', 
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 15px',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px', marginRight: '15px', color: '#ccc', cursor: 'pointer' }}>♡</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatPrice(post.price)}</span>
                            <span style={{ fontSize: '12px', color: '#ff8a3d', fontWeight: 'bold' }}>가격 제안 불가</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleChatClick}
                        style={{
                            backgroundColor: '#FF8A3D',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        채팅하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PostDetailPage;