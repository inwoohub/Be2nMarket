import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { formatPrice, getSafeImageUrl } from '../utils/format';

import "../css/Index.css";
import "../css/MainPage.css";

function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const myId = auth?.user?.userId;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setPost(data);
                } else {
                    alert("게시글을 불러올 수 없습니다.");
                    navigate(-1);
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
    }, [postId, navigate]);

    // 1. 판매자 여부 확인
    const isSeller = post && post.sellerId === myId;

    // 2. 구매자용: 채팅방 생성 및 이동
    const handleChatClick = async () => {
        if (!post) return;

        try {
            const response = await fetch('/api/chat/room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    sellerId: post.sellerId,
                    postId: post.postId
                }),
            });

            if (response.ok) {
                const chatroomId = await response.json();
                navigate(`/chat/${chatroomId}`);
            } else {
                alert("채팅방을 연결할 수 없습니다.");
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        }
    };

    // 3. 판매자용: 대화 중인 채팅방 목록으로 이동 (추후 구현)
    const handleSellerChatListClick = () => {
        alert("판매자용 채팅 목록 페이지는 아직 구현되지 않았습니다.");
        // navigate(`/posts/${post.postId}/chats`);
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#000000', color: '#ffffff', height: '100vh' }}>로딩 중...</div>;
    if (!post) return null;

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#000000',
                height: '100vh',
                position: 'relative',
                color: '#ffffff'
            }}>
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>

                    {/* 이미지 슬라이더 영역 */}
                    <div style={{
                        width: '100%',
                        height: '300px',
                        backgroundColor: '#333333',
                        display: 'flex',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory'
                    }}>
                        {post.imageUrls && post.imageUrls.length > 0 ? (
                            post.imageUrls.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={getSafeImageUrl(url)}
                                    alt={`상품 ${idx}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        flexShrink: 0,
                                        scrollSnapAlign: 'start'
                                    }}
                                    onError={(e) => {e.target.style.display='none'}}
                                />
                            ))
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                이미지가 없습니다.
                            </div>
                        )}
                    </div>

                    {/* 판매자 정보 영역 */}
                    <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            marginRight: '10px',
                            border: '1px solid #333',
                            backgroundColor: '#555',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {post.sellerProfileImage ? (
                                <img
                                    src={getSafeImageUrl(post.sellerProfileImage)}
                                    alt="프로필"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {e.target.style.display='none'}}
                                />
                            ) : null}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#ffffff' }}>{post.sellerNickname}</div>
                            <div style={{ fontSize: '12px', color: '#aaa' }}>{post.location || "지역 정보 없음"}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#0dcc5a', fontWeight: 'bold', fontSize: '14px' }}>
                                {post.sellerMannerScore}℃
                            </div>
                            <div style={{ fontSize: '10px', color: '#888', textDecoration: 'underline' }}>매너온도</div>
                        </div>
                    </div>

                    {/* 게시글 내용 영역 */}
                    <div style={{ padding: '20px 15px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', marginTop: 0, color: '#ffffff' }}>
                            {post.title}
                        </h1>
                        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '20px' }}>
                            {post.category} · {post.createdAt ? post.createdAt.substring(0, 10) : ''}
                        </div>
                        <div style={{ fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#ffffff' }}>
                            {post.content}
                        </div>
                        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '20px' }}>
                            관심 {0} · 조회 {post.viewCount}
                        </div>
                    </div>
                </div>

                {/* 하단 고정 바 */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '70px',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 15px',
                    justifyContent: 'space-between',
                    backgroundColor: '#000000'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px', marginRight: '15px', color: '#888', cursor: 'pointer' }}>♡</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{formatPrice(post.price)}</span>
                            <span style={{ fontSize: '12px', color: '#ff8a3d', fontWeight: 'bold' }}>가격 제안 불가</span>
                        </div>
                    </div>

                    {/* 판매자/구매자 구분하여 버튼 표시 */}
                    {isSeller ? (
                        <button
                            onClick={handleSellerChatListClick}
                            style={{
                                backgroundColor: '#333333',
                                color: '#ffffff',
                                border: '1px solid #555',
                                borderRadius: '5px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            대화 중인 채팅방
                        </button>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default PostDetailPage;
