import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import "../css/Index.css";
import "../css/MainPage.css";

function ChatListPage() {
    // 1. URL 파라미터에서 현재 로그인한 유저 ID를 가져옵니다.
    // App.js 라우트가 /chat/list/:userId 로 설정될 예정입니다.
    const { userId } = useParams();
    const navigate = useNavigate();

    // 채팅방 목록을 저장할 상태 변수
    const [chatRooms, setChatRooms] = useState([]);
    const myId = userId ? parseInt(userId) : 1001; // 예외 처리

    // 2. 화면이 로딩될 때 채팅방 목록을 백엔드에서 가져옵니다.
    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/chat/list/${myId}`, {
                    method: 'GET',
                    credentials: 'include', // 세션/쿠키 포함
                });

                if (response.ok) {
                    const data = await response.json();
                    setChatRooms(data); // 가져온 목록 데이터를 상태에 저장
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

    // 3. 특정 채팅방 클릭 시 해당 방으로 이동하는 함수
    const handleEnterRoom = (roomId) => {
        // ChatPage.js로 이동 (/chat/방번호/내아이디)
        navigate(`/chat/${roomId}/${myId}`);
    };

    // 4. 시간 포맷팅 함수 (예: 2024-11-25T10:00:00 -> 10:00)
    const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(11, 16);
    };

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{ 
                display: 'flex',
                flexDirection: 'column',
                paddingTop: '7vh', // 헤더 높이만큼 여백
                paddingBottom: '10vh', // 바텀네비 높이만큼 여백
                boxSizing: 'border-box'
            }}>
                {/* 목록 컨테이너 */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {chatRooms.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
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
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* 프로필 이미지 영역 */}
                                <div style={{ marginRight: '15px' }}>
                                    <img 
                                        src={room.otherUserProfileImage || "https://via.placeholder.com/50"} 
                                        alt="프로필" 
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '1px solid #eee'
                                        }}
                                    />
                                </div>

                                {/* 대화 정보 영역 */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        {/* 상대방 닉네임 */}
                                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                            {room.otherUserNickname}
                                        </span>
                                        {/* 마지막 대화 시간 */}
                                        <span style={{ fontSize: '12px', color: '#999' }}>
                                            {formatTime(room.lastMessageTime)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        {/* 마지막 메시지 내용 (말줄임 처리) */}
                                        <span style={{ 
                                            fontSize: '13px', 
                                            color: '#666',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '200px',
                                            display: 'block'
                                        }}>
                                            {room.lastMessage}
                                        </span>
                                        {/* 안 읽은 메시지 뱃지 (0보다 클 때만 표시) */}
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