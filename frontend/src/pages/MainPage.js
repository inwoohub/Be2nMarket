import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "../css/Index.css";
import "../css/MainPage.css";

function MainPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const myId = userId ? parseInt(userId) : 1001;

    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/posts', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
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

    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}/${myId}`);
    };

    // [수정됨] 글쓰기 페이지로 이동
    const handleWriteClick = () => {
        navigate(`/posts/write/${myId}`);
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(0, 10); 
    };

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: '#000000', 
                height: '100vh', 
                paddingTop: '7vh',
                paddingBottom: '10vh',
                boxSizing: 'border-box',
                color: '#ffffff'
            }}>
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
                                    borderBottom: '1px solid #333',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ marginRight: '15px' }}>
                                    <img 
                                        src={post.thumbnailUrl || ""} 
                                        alt="상품 이미지" 
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '8px',
                                            objectFit: 'cover',
                                            backgroundColor: '#333'
                                        }}
                                        onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px', color: '#ffffff' }}>
                                            {post.title}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                                            {post.location} · {formatTime(post.createdAt)}
                                        </div>
                                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>
                                            {formatPrice(post.price)}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', color: '#aaa' }}>
                                        {post.chatCount > 0 && <span style={{ marginRight: '8px' }}>💬 {post.chatCount}</span>}
                                        {post.likeCount > 0 && <span>🤍 {post.likeCount}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={handleWriteClick}
                    style={{
                        position: 'absolute',
                        bottom: '12vh',
                        right: '20px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#FF8A3D',
                        color: 'white',
                        border: 'none',
                        fontSize: '30px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100
                    }}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default MainPage;