import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import "../css/Index.css";
import "../css/MainPage.css";

function ChatListPage() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const myId = userId ? parseInt(userId) : 1001;
    const [chatRooms, setChatRooms] = useState([]);

    const getSafeImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        if (url.startsWith('/')) return url;
        return `/${url}`;
    };

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/chat/list/${myId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setChatRooms(data);
                    console.log(">>> 채팅방 목록 로딩 성공:", data.length, "개");
                } else {
                    console.error(">>> 채팅방 목록 로딩 실패:", response.status);
                }
            } catch (error) {
                console.error(">>> 에러 발생:", error);
            }
        };

        fetchChatRooms();
    }, [myId]);

    const handleEnterRoom = (roomId) => {
        navigate(`/chat/${roomId}/${myId}`);
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(11, 16);
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
                    {chatRooms.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#888', marginTop: '50px' }}>
                            참여 중인 채팅방이 없습니다.
                        </div>
                    ) : (
                        chatRooms.map((room) => (
                            <div 
                                key={room.chatroomId} 
                                onClick={() => handleEnterRoom(room.chatroomId)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '15px',
                                    borderBottom: '1px solid #333',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* [수정됨] 이미지 영역: 상품 사진 우선 표시, 없으면 프로필 */}
                                <div style={{ marginRight: '15px', position: 'relative' }}>
                                    {/* 메인 이미지: 상품 사진 */}
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '8px', // 상품은 사각형 느낌
                                        backgroundColor: '#333',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {room.postImage ? (
                                            <img 
                                                src={getSafeImageUrl(room.postImage)} 
                                                alt="상품" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {e.target.style.display = 'none'}}
                                            />
                                        ) : (
                                            // 상품 사진 없으면 상대방 프로필 표시
                                            <img 
                                                src={getSafeImageUrl(room.otherUserProfileImage) || "/User.png"} 
                                                alt="프로필" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                                onError={(e) => {e.target.src = '/User.png'}}
                                            />
                                        )}
                                    </div>
                                    
                                    {/* 상품 사진이 있을 때만 우측 하단에 작게 상대방 프로필 표시 (선택 사항) */}
                                    {room.postImage && room.otherUserProfileImage && (
                                        <img 
                                            src={getSafeImageUrl(room.otherUserProfileImage)}
                                            alt="프로필"
                                            style={{
                                                position: 'absolute',
                                                bottom: '-5px',
                                                right: '-5px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: '2px solid #000',
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {e.target.style.display='none'}}
                                        />
                                    )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        {/* 닉네임과 상품 제목 함께 표시 */}
                                        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#ffffff', marginRight: '6px', whiteSpace: 'nowrap' }}>
                                                {room.otherUserNickname}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {room.postTitle}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#aaa', flexShrink: 0, marginLeft: '10px' }}>
                                            {formatTime(room.lastMessageTime)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ 
                                            fontSize: '13px', 
                                            color: '#ccc',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '200px',
                                            display: 'block'
                                        }}>
                                            {room.lastMessage}
                                        </span>
                                        {room.unreadCount > 0 && (
                                            <span style={{
                                                backgroundColor: '#FF8A3D',
                                                color: 'white',
                                                borderRadius: '50%',
                                                padding: '2px 6px',
                                                fontSize: '10px',
                                                fontWeight: 'bold'
                                            }}>
                                                {room.unreadCount}
                                            </span>
                                        )}
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

export default ChatListPage;