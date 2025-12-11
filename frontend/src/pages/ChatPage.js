import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import "../css/Index.css";
import "../css/MainPage.css";

function ChatPage() {
    const { roomId, userId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const stompClient = useRef(null);

    const myId = userId ? parseInt(userId) : 1001;
    const chatroomId = roomId ? parseInt(roomId) : 1;

    // 실제 메시지 데이터를 저장할 상태
    const [messages, setMessages] = useState([]);
    // 채팅방 정보(헤더용) 상태
    const [roomInfo, setRoomInfo] = useState(null);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (!chatroomId) return;

        // 1. 채팅방 상세 정보(헤더) 가져오기
        const fetchRoomInfo = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/chat/room/${chatroomId}/info?myId=${myId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setRoomInfo(data);
                    console.log(">>> 채팅방 정보 로딩 성공:", data);
                } else {
                    console.error(">>> 채팅방 정보 로딩 실패:", response.status);
                }
            } catch (error) {
                console.error(">>> 채팅방 정보 에러:", error);
            }
        };

        // 2. 과거 대화 내역 가져오기
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/chat/room/${chatroomId}/messages`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error(">>> 메시지 로딩 에러:", error);
            }
        };

        fetchRoomInfo();
        fetchMessages();

        // 3. 웹소켓 연결
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-stomp'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log(`>>> 웹소켓 연결 성공! (방: ${chatroomId})`);
                client.subscribe(`/topic/chatroom/${chatroomId}`, (message) => {
                    const receivedMsg = JSON.parse(message.body);
                    setMessages((prev) => [...prev, receivedMsg]);
                });
            },
            onStompError: (frame) => {
                console.error('>>> 브로커 에러:', frame.headers['message']);
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (client) client.deactivate();
        };
    }, [chatroomId, myId]);

    // 스크롤 자동 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;

        if (stompClient.current && stompClient.current.connected) {
            const chatMessageDto = {
                chatroomId: chatroomId,
                senderId: myId,
                content: input
            };
            stompClient.current.publish({
                destination: '/app/chat/send',
                body: JSON.stringify(chatMessageDto),
            });
            setInput('');
        } else {
            alert("서버와 연결되지 않았습니다.");
        }
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined) return "";
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const date = new Date(timeString);
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        return `${ampm} ${hours}:${minutes}`;
    };

    // 이미지 경로 처리 (외부 URL이면 그대로, 아니면 / 추가)
    const getSafeImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        if (url.startsWith('/')) return url;
        return `/${url}`;
    };

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                height: '100vh', 
                paddingTop: '7vh',
                paddingBottom: '10vh',
                boxSizing: 'border-box',
                color: '#ffffff',
                backgroundColor: '#000000'
            }}>
                {/* 상단 정보 바 */}
                <div style={{ 
                    padding: '10px 15px', 
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    flexShrink: 0
                }}>
                    {/* 상품 이미지 */}
                    <div style={{ marginRight: '10px', width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#333', overflow: 'hidden' }}>
                        {roomInfo && roomInfo.postImage ? (
                            <img 
                                src={getSafeImageUrl(roomInfo.postImage)} 
                                alt="상품" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {e.target.style.display='none'}}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                        )}
                    </div>
                    
                    {/* 상품 정보 및 상대방 닉네임 */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {roomInfo ? (
                                <>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '6px' }}>
                                        {roomInfo.postStatus === 'ON_SALE' ? '판매중' : 
                                         roomInfo.postStatus === 'RESERVED' ? '예약중' : 
                                         roomInfo.postStatus === 'SOLD' ? '거래완료' : '판매중'}
                                    </span>
                                    <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                        {roomInfo.postTitle}
                                    </span>
                                </>
                            ) : (
                                <span style={{ fontSize: '14px' }}>로딩중...</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>
                                {roomInfo ? formatPrice(roomInfo.postPrice) : ""}
                            </span>
                            {/* 상대방 닉네임 표시 */}
                            <span style={{ fontSize: '12px', color: '#aaa' }}>
                                {roomInfo ? `대화상대: ${roomInfo.otherUserNickname}` : ""}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 채팅 목록 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                    {messages.length === 0 ? (
                        <div style={{ margin: 'auto', color: '#888', textAlign: 'center' }}>
                            <p>대화 내용이 없습니다.</p>
                            <p>메시지를 보내보세요.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} style={{ 
                                display: 'flex',
                                justifyContent: msg.senderId === myId ? 'flex-end' : 'flex-start',
                                marginBottom: '15px'
                            }}>
                                {msg.senderId !== myId && (
                                    <div style={{ marginRight: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <div style={{ 
                                            width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#555', overflow: 'hidden', marginBottom: '4px' 
                                        }}>
                                            {msg.senderProfileImage ? (
                                                <img src={getSafeImageUrl(msg.senderProfileImage)} alt="프사" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display='none'} />
                                            ) : null}
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '2px' }}>
                                            {msg.senderNickname || `User ${msg.senderId}`}
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    {msg.senderId === myId && (
                                        <span style={{ fontSize: '10px', color: '#888', marginRight: '5px', marginBottom: '2px' }}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    )}

                                    <div style={{ 
                                        padding: '10px 14px', 
                                        borderRadius: '18px',
                                        backgroundColor: msg.senderId === myId ? '#FF8A3D' : '#333333',
                                        color: 'white',
                                        fontSize: '15px',
                                        maxWidth: '240px',
                                        wordBreak: 'break-word',
                                        borderTopLeftRadius: msg.senderId !== myId ? '2px' : '18px',
                                        borderTopRightRadius: msg.senderId === myId ? '2px' : '18px'
                                    }}>
                                        {msg.content}
                                    </div>

                                    {msg.senderId !== myId && (
                                        <span style={{ fontSize: '10px', color: '#888', marginLeft: '5px', marginBottom: '2px' }}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* 하단 입력창 */}
                <div style={{ 
                    padding: '10px 15px', 
                    borderTop: '1px solid #333', 
                    display: 'flex', 
                    alignItems: 'center',
                    height: '60px',
                    flexShrink: 0
                }}>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="메시지를 입력하세요."
                        style={{ 
                            flex: 1, 
                            padding: '10px 15px', 
                            borderRadius: '20px', 
                            border: 'none', 
                            outline: 'none',
                            backgroundColor: '#333333',
                            color: 'white',
                            fontSize: '15px'
                        }}
                    />
                    <button 
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        style={{ 
                            marginLeft: '15px', 
                            border: 'none', 
                            backgroundColor: 'transparent', 
                            color: input.trim() ? '#FF8A3D' : '#666', 
                            fontWeight: 'bold', 
                            cursor: input.trim() ? 'pointer' : 'default',
                            fontSize: '16px',
                            padding: '0'
                        }}
                    >
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;