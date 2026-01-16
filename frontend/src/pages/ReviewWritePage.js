import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "../css/Index.css";
import "../css/MainPage.css";

// 1. 키워드 데이터 (고정값)
const POSITIVE_KEYWORDS = [
    { id: 1, text: '시간 약속을 잘 지켜요 ⏰' },
    { id: 2, text: '친절하고 매너가 좋아요 😊' },
    { id: 3, text: '응답이 빨라요 ⚡' },
    { id: 4, text: '상품 상태가 설명과 같아요 📦' },
    { id: 5, text: '좋은 상품을 저렴하게 주셨어요 💸' },
];

const NEGATIVE_KEYWORDS = [
    { id: 6, text: '시간 약속을 안 지켜요 😢' },
    { id: 7, text: '불친절해요 😡' },
    { id: 8, text: '연락이 잘 안 돼요 📱' },
    { id: 9, text: '상품 상태가 설명과 달라요 💔' },
    { id: 10, text: '약속 장소에 나타나지 않았어요 🚫' },
];

function ReviewWritePage() {
    const navigate = useNavigate();
    
    // ⭐ URL 파라미터 가져오기 (App.js 라우트 순서와 일치해야 함)
    // Route Path: /reviews/write/:userId/:postId/:partnerId
    const { userId, postId, partnerId } = useParams(); 

    const [rating, setRating] = useState(0); 
    const [selectedKeywords, setSelectedKeywords] = useState([]); 
    const [reviewContent, setReviewContent] = useState(''); 
    
    // 현재 보여줄 키워드 리스트 상태
    const [currentOptions, setCurrentOptions] = useState([]);

    // 별점이 바뀔 때마다 키워드 리스트 갱신
    useEffect(() => {
        setSelectedKeywords([]); // 별점 바뀌면 선택 초기화

        if (rating >= 4) {
            setCurrentOptions(POSITIVE_KEYWORDS);
        } else if (rating === 3) {
            // 3점: 장점 3개 + 단점 3개 섞어서 보여주기
            const mix = [
                ...POSITIVE_KEYWORDS.slice(0, 3), 
                ...NEGATIVE_KEYWORDS.slice(0, 3)
            ];
            setCurrentOptions(mix);
        } else if (rating >= 1) {
            setCurrentOptions(NEGATIVE_KEYWORDS);
        } else {
            setCurrentOptions([]);
        }
    }, [rating]);

    const handleRatingClick = (score) => {
        setRating(score);
    };

    const toggleKeyword = (id) => {
        if (selectedKeywords.includes(id)) {
            setSelectedKeywords(selectedKeywords.filter(k => k !== id));
        } else {
            setSelectedKeywords([...selectedKeywords, id]);
        }
    };

    // ⭐ [핵심] 백엔드로 데이터 전송
    const handleSubmit = async () => {
        // 1. 유효성 검사
        if (rating === 0) {
            alert("별점을 선택해주세요!");
            return;
        }

        // 2. DTO 데이터 구성
        const reviewData = {
            tradeId: parseInt(postId),       // 게시물(거래) ID
            targetUserId: parseInt(partnerId), // 후기 받는 사람 ID
            rating: rating,
            content: reviewContent,
            keywords: selectedKeywords // [1, 3, 5] 형태의 배열
        };

        console.log(">>> 서버로 보낼 데이터:", reviewData);

        try {
            // 3. fetch 호출 (PostWritePage처럼 userId를 쿼리 스트링으로 전달하여 통일성 유지)
            // URL: /api/reviews?userId=1001
            const response = await fetch(`/api/reviews?userId=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reviewData),
                credentials: 'include', // 세션/쿠키 포함
            });

            if (response.ok) {
                // 성공 시
                const savedReviewId = await response.json(); 
                console.log("등록 성공 ID:", savedReviewId);
                alert("따뜻한 후기가 등록되었습니다!");
                navigate(`/profile/${partnerId}`);
            } else {
                // 실패 시
                console.error("등록 실패 코드:", response.status);
                alert("후기 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("에러 발생:", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: '#000000',
                height: '100vh',
                color: '#ffffff',
                overflowX: 'hidden',
                overflowY: 'hidden' // 전체 스크롤 막기
            }}>
                
                {/* 헤더 */}
                <div style={{ 
                    height: '60px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0 15px', 
                    borderBottom: '1px solid #333',
                    flexShrink: 0 
                }}>
                    <span onClick={() => navigate(-1)} style={{ fontSize: '24px', cursor: 'pointer' }}>✕</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>거래 후기 보내기</span>
                    <span onClick={handleSubmit} style={{ color: '#FF8A3D', fontWeight: 'bold', cursor: 'pointer' }}>완료</span>
                </div>

                {/* 내용 영역 (여기만 스크롤 가능) */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    overflowX: 'hidden', 
                    padding: '20px',
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none'
                }}>
                    <style>
                        {`
                            div::-webkit-scrollbar {
                                display: none;
                            }
                        `}
                    </style>
                    
                    {/* 안내 문구 */}
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', color: '#ccc', marginBottom: '10px' }}>
                            거래는 어떠셨나요?
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
                            <span style={{ color: '#FF8A3D' }}>상대방</span>님과의<br/>
                            거래 후기를 남겨주세요
                        </h2>
                    </div>

                    {/* 별점 섹션 */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                        {[1, 2, 3, 4, 5].map((score) => (
                            <span 
                                key={score}
                                onClick={() => handleRatingClick(score)}
                                style={{ 
                                    fontSize: '40px', 
                                    cursor: 'pointer', 
                                    color: score <= rating ? '#FF8A3D' : '#333',
                                    margin: '0 5px',
                                    transition: 'color 0.2s'
                                }}
                            >
                                ★
                            </span>
                        ))}
                    </div>

                    {/* 키워드 섹션 (별점 선택 시 등장) */}
                    {rating > 0 && (
                        <div style={{ marginBottom: '30px', animation: 'fadeIn 0.5s' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
                                {rating >= 4 ? '어떤 점이 좋았나요?' : rating <= 2 ? '어떤 점이 아쉬웠나요?' : '어떤 점이 기억에 남나요?'}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {currentOptions.map((option) => (
                                    <div 
                                        key={option.id}
                                        onClick={() => toggleKeyword(option.id)}
                                        style={{
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: selectedKeywords.includes(option.id) ? '1px solid #FF8A3D' : '1px solid #333',
                                            backgroundColor: selectedKeywords.includes(option.id) ? 'rgba(255, 138, 61, 0.1)' : '#16171B',
                                            color: selectedKeywords.includes(option.id) ? '#FF8A3D' : '#fff',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {option.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 텍스트 입력 */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>상세 후기 (선택)</h3>
                        <textarea 
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            placeholder="상대방에게 감사 인사를 남겨보세요. (선택사항)"
                            style={{ 
                                width: '100%', 
                                height: '120px', 
                                backgroundColor: '#16171B', 
                                border: '1px solid #333', 
                                borderRadius: '8px',
                                padding: '15px',
                                color: 'white', 
                                fontSize: '14px', 
                                outline: 'none', 
                                resize: 'none',
                                boxSizing: 'border-box'
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReviewWritePage;