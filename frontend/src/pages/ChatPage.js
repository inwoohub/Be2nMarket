import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// CSS 파일 불러오기
import "../css/Index.css";
import "../css/MainPage.css";

function ChatPage() {
    const { userId } = useParams();
    const senderId = userId ? parseInt(userId) : 1001;
    const chatroomId = 1;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const stompClient = useRef(null);
    const messagesEndRef = useRef(null);

    // 웹소켓 연결 및 과거 내역 불러오기
    useEffect(() => {
        // 1. 과거 대화 내역 가져오기 (HTTP GET)
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/chat/room/${chatroomId}/messages`, {
                    method: 'GET',
                    credentials: 'include', // [핵심] 쿠키(세션) 포함 전송
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                    console.log(">>> 과거 내역 불러오기 성공:", data.length, "건");
                } else {
                    console.error(">>> 과거 내역 불러오기 실패. 상태코드:", response.status);
                }
            } catch (error) {
                console.error(">>> 데이터 로딩 중 에러 (로그인 풀림 의심):", error);
            }
        };

        // 데이터를 먼저 부르고...
        fetchMessages();

        // 2. 웹소켓 연결 설정 (WebSocket)
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-stomp'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log(`>>> 웹소켓 연결 성공! (ID: ${senderId})`);
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
            if (client) {
                client.deactivate();
            }
        };
    }, [senderId, chatroomId]);

    // 새 메시지 오면 스크롤 맨 아래로
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 메시지 전송 함수
    const sendMessage = () => {
        if (!input.trim()) return;

        if (stompClient.current && stompClient.current.connected) {
            const chatMessageDto = {
                chatroomId: chatroomId,
                senderId: senderId,
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

    // 화면 렌더링
    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                height: '100vh', 
                paddingTop: '7vh',
                paddingBottom: '10vh',
                boxSizing: 'border-box'
            }}>
                {/* 상단 정보 바 */}
                <div style={{ 
                    padding: '10px', 
                    textAlign: 'center', 
                    fontSize: '12px', 
                    color: '#888', 
                    backgroundColor: '#f9f9f9',
                    borderBottom: '1px solid #eee'
                }}>
                    🔴 방 {chatroomId}번 / 내 ID {senderId}번
                </div>

                {/* 채팅 목록 */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#f2f3f6'
                }}>
                    {messages.length === 0 ? (
                        <div style={{ margin: 'auto', color: '#ccc', textAlign: 'center' }}>
                            <p>대화 내용이 없습니다.</p>
                            <p>메시지를 보내보세요!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} style={{ 
                                display: 'flex',
                                justifyContent: msg.senderId === senderId ? 'flex-end' : 'flex-start',
                                marginBottom: '10px'
                            }}>
                                <div style={{ maxWidth: '70%' }}>
                                    {msg.senderId !== senderId && (
                                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', marginLeft: '4px' }}>
                                            User {msg.senderId}
                                        </div>
                                    )}
                                    <div style={{ 
                                        padding: '10px 14px', 
                                        borderRadius: '15px',
                                        backgroundColor: msg.senderId === senderId ? '#FF8A3D' : 'white',
                                        color: msg.senderId === senderId ? 'white' : 'black',
                                        fontSize: '14px',
                                        border: msg.senderId !== senderId ? '1px solid #ddd' : 'none',
                                        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                                        wordBreak: 'break-word'
                                    }}>
                                        {msg.content}
                                    </div>
                                    <div style={{ 
                                        fontSize: '10px', 
                                        color: '#999', 
                                        marginTop: '3px', 
                                        textAlign: msg.senderId === senderId ? 'right' : 'left',
                                        marginRight: '4px', 
                                        marginLeft: '4px'
                                    }}>
                                        {msg.createdAt ? msg.createdAt.substring(11, 16) : '방금'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* 하단 입력창 */}
                <div style={{ 
                    padding: '10px', 
                    backgroundColor: 'white', 
                    borderTop: '1px solid #eee', 
                    display: 'flex', 
                    alignItems: 'center',
                    height: '60px'
                }}>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="메시지를 입력하세요"
                        style={{ 
                            flex: 1, 
                            padding: '10px 15px', 
                            borderRadius: '20px', 
                            border: '1px solid #ddd', 
                            outline: 'none',
                            backgroundColor: '#f9f9f9',
                            fontSize: '14px'
                        }}
                    />
                    <button 
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        style={{ 
                            marginLeft: '10px', 
                            border: 'none', 
                            backgroundColor: 'transparent', 
                            color: input.trim() ? '#FF8A3D' : '#ccc', 
                            fontWeight: 'bold', 
                            cursor: input.trim() ? 'pointer' : 'default',
                            fontSize: '16px',
                            padding: '0 10px'
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