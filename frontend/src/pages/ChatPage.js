import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import "../css/Index.css";
import "../css/MainPage.css";

function ChatPage() {
    // 1. URL 파라미터에서 roomId와 userId를 가져옵니다.
    // App.js 라우트 설정이 /chat/:roomId/:userId 로 되어 있어야 동작합니다.
    const { roomId, userId } = useParams();
    
    // 2. 방 번호가 URL에 있으면 숫자로 변환하여 사용하고, 없으면 기본값 1을 사용합니다.
    // 이 부분이 수정되어야 헤더에 777번이 뜹니다.
    const chatroomId = roomId ? parseInt(roomId) : 1;
    
    // 3. 유저 ID도 URL에서 가져와서 숫자로 변환합니다. 없으면 테스트용 1001번을 사용합니다.
    const senderId = userId ? parseInt(userId) : 1001;

    // 메시지 목록을 저장할 상태 변수
    const [messages, setMessages] = useState([]);
    // 입력창의 텍스트를 저장할 상태 변수
    const [input, setInput] = useState('');
    
    // 웹소켓 클라이언트 객체를 유지하기 위한 Ref
    const stompClient = useRef(null);
    // 자동 스크롤을 위한 빈 div 요소를 참조할 Ref
    const messagesEndRef = useRef(null);

    // 4. 웹소켓 연결 및 초기 데이터 로딩 (방 번호나 유저 ID가 바뀌면 재실행)
    useEffect(() => {
        // 방 번호가 없으면 로직을 수행하지 않음
        if (!chatroomId) return;

        // (1) 과거 대화 내역 가져오기 함수 (HTTP GET 요청)
        const fetchMessages = async () => {
            try {
                // 동적인 chatroomId를 URL에 넣어서 해당 방의 메시지만 요청
                const response = await fetch(`http://localhost:8080/api/chat/room/${chatroomId}/messages`, {
                    method: 'GET',
                    credentials: 'include', // 세션 인증 정보(쿠키) 포함
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data); // 가져온 데이터를 상태에 저장
                    console.log(`>>> [방 ${chatroomId}] 과거 내역 로딩 성공:`, data.length, "건");
                } else {
                    console.error(">>> 과거 내역 불러오기 실패. 상태코드:", response.status);
                }
            } catch (error) {
                console.error(">>> 데이터 로딩 중 에러:", error);
            }
        };

        // 함수 실행
        fetchMessages();

        // (2) 웹소켓 연결 설정 (SockJS 사용)
        const client = new Client({
            // 백엔드 WebSocketConfig에 설정된 엔드포인트 (/ws-stomp)로 연결
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-stomp'),
            // 연결 끊길 시 5초마다 재연결 시도
            reconnectDelay: 5000,
            
            // 연결 성공 시 실행될 콜백
            onConnect: () => {
                console.log(`>>> 웹소켓 연결 성공! (방: ${chatroomId}, ID: ${senderId})`);
                
                // 해당 방 번호(/topic/chatroom/{id})만 구독(Subscribe)
                // 이 부분이 핵심이며, 다른 방의 메시지는 수신하지 않게 됨
                client.subscribe(`/topic/chatroom/${chatroomId}`, (message) => {
                    const receivedMsg = JSON.parse(message.body);
                    // 기존 메시지 목록 뒤에 새 메시지 추가
                    setMessages((prev) => [...prev, receivedMsg]);
                });
            },
            
            // 에러 발생 시 실행될 콜백
            onStompError: (frame) => {
                console.error('>>> 브로커 에러:', frame.headers['message']);
            },
        });

        // 클라이언트 활성화 (연결 시작)
        client.activate();
        stompClient.current = client;

        // 컴포넌트가 화면에서 사라질 때(언마운트) 실행되는 정리 함수
        return () => {
            if (client) {
                client.deactivate(); // 연결 종료
            }
        };
    }, [chatroomId, senderId]); // 의존성 배열: 방 번호나 ID가 바뀌면 재연결

    // 5. 메시지 목록(messages)이 업데이트될 때마다 스크롤을 맨 아래로 내림
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 6. 메시지 전송 함수
    const sendMessage = () => {
        // 공백만 있는 경우 전송하지 않음
        if (!input.trim()) return;

        // 연결 상태 확인 후 전송
        if (stompClient.current && stompClient.current.connected) {
            const chatMessageDto = {
                chatroomId: chatroomId, // 현재 방 번호를 DTO에 담음
                senderId: senderId,     // 보낸 사람 ID
                content: input          // 메시지 내용
            };

            // /app/chat/send 경로로 메시지 발행 (Publish)
            stompClient.current.publish({
                destination: '/app/chat/send',
                body: JSON.stringify(chatMessageDto),
            });
            
            // 입력창 초기화
            setInput('');
        } else {
            alert("서버와 연결되지 않았습니다.");
        }
    };

    // 7. 화면 렌더링
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
                    {/* 동적으로 가져온 chatroomId를 표시 */}
                    🔴 방 {chatroomId}번 / 내 ID {senderId}번
                </div>

                {/* 채팅 목록 영역 */}
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
                            <p>메시지를 보내보세요.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} style={{ 
                                display: 'flex',
                                // 내가 보낸 건 오른쪽, 남이 보낸 건 왼쪽 정렬
                                justifyContent: msg.senderId === senderId ? 'flex-end' : 'flex-start',
                                marginBottom: '10px'
                            }}>
                                <div style={{ maxWidth: '70%' }}>
                                    {/* 상대방 메시지인 경우 유저 ID 표시 */}
                                    {msg.senderId !== senderId && (
                                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', marginLeft: '4px' }}>
                                            User {msg.senderId}
                                        </div>
                                    )}
                                    {/* 말풍선 스타일 */}
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
                                    {/* 시간 표시 */}
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
                    {/* 스크롤 위치를 잡아줄 빈 요소 */}
                    <div ref={messagesEndRef} />
                </div>

                {/* 하단 입력창 영역 */}
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