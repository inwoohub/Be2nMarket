import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthContext } from '../AuthContext';
import { formatPrice, formatTime, getSafeImageUrl } from '../utils/format';

import "../css/Index.css";
import "../css/MainPage.css";

function ChatPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const stompClient = useRef(null);

    const auth = useContext(AuthContext);
    const myId = auth?.user?.userId;
    const chatroomId = roomId ? parseInt(roomId) : 1;

    const [messages, setMessages] = useState([]);
    const [roomInfo, setRoomInfo] = useState(null);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (!chatroomId) return;

        const fetchRoomInfo = async () => {
            try {
                const response = await fetch(`/api/chat/room/${chatroomId}/info`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setRoomInfo(data);
                }
            } catch (error) {
            }
        };

        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/chat/room/${chatroomId}/messages`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
            }
        };

        fetchRoomInfo();
        fetchMessages();

        const client = new Client({
            webSocketFactory: () => new SockJS('/ws-stomp'),
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/chatroom.${chatroomId}`, (message) => {
                    const receivedMsg = JSON.parse(message.body);
                    setMessages((prev) => [...prev, receivedMsg]);
                });
            },
            onStompError: (frame) => {
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (client) client.deactivate();
        };
    }, [chatroomId, myId]);

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
                <div style={{
                    padding: '10px 15px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    flexShrink: 0
                }}>
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
                            <span style={{ fontSize: '12px', color: '#aaa' }}>
                                {roomInfo ? `대화상대: ${roomInfo.otherUserNickname}` : ""}
                            </span>
                        </div>
                    </div>
                </div>

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
