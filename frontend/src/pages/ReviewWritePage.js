import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import "../css/Index.css";
// import "../css/MainPage.css"; // 필요 시 주석 해제

// ==========================================
// 1. 키워드 데이터 정의 (판매자용 / 구매자용 분리)
// ==========================================

const FOR_SELLER_POSITIVE = [
    { id: 1, text: '상품 상태가 설명과 같아요 📦' },
    { id: 2, text: '좋은 상품을 저렴하게 주셨어요 💸' },
    { id: 3, text: '응답이 빨라요 ⚡' },
    { id: 4, text: '친절하고 매너가 좋아요 😊' },
    { id: 5, text: '시간 약속을 잘 지켜요 ⏰' },
];

const FOR_SELLER_NEGATIVE = [
    { id: 6, text: '상품 상태가 설명과 달라요 💔' },
    { id: 7, text: '시간 약속을 안 지켜요 😢' },
    { id: 8, text: '불친절해요 😡' },
    { id: 9, text: '연락이 잘 안 돼요 📱' },
    { id: 10, text: '약속 장소에 나타나지 않았어요 🚫' },
];

const FOR_BUYER_POSITIVE = [
    { id: 11, text: '쿨거래 해주셨어요 😎' },
    { id: 12, text: '입금이 빨라요 💸' },
    { id: 13, text: '응답이 빨라요 ⚡' },
    { id: 14, text: '친절하고 매너가 좋아요 😊' },
    { id: 15, text: '시간 약속을 잘 지켜요 ⏰' },
];

const FOR_BUYER_NEGATIVE = [
    { id: 16, text: '무리한 네고를 요구해요 🙅‍♂️' },
    { id: 17, text: '시간 약속을 안 지켜요 😢' },
    { id: 18, text: '불친절해요 😡' },
    { id: 19, text: '연락이 잘 안 돼요 📱' },
    { id: 20, text: '약속 장소에 나타나지 않았어요 🚫' },
];


function ReviewWritePage() {
    const navigate = useNavigate();
    
    // URL 파라미터 가져오기
    const { userId, postId, partnerId, tradeId } = useParams(); 

    // 상태 관리
    const [rating, setRating] = useState(0); 
    const [selectedKeywords, setSelectedKeywords] = useState([]); 
    const [reviewContent, setReviewContent] = useState(''); 
    const [retransaction, setRetransaction] = useState(false); 
    
    const [currentOptions, setCurrentOptions] = useState([]); 
    const [amISeller, setAmISeller] = useState(false);      
    const [loading, setLoading] = useState(true);

    // 1. 내가 판매자인지 구매자인지 확인
    useEffect(() => {
        fetch(`/api/posts/${postId}`, { credentials: 'include' })
            .then(res => res.json())
            .then(postData => {
                if (String(postData.sellerId) === String(userId)) {
                    setAmISeller(true); 
                } else {
                    setAmISeller(false); 
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("게시글 정보 조회 실패:", err);
                setLoading(false);
            });
    }, [postId, userId]);


    // 2. 키워드 갱신 로직
    useEffect(() => {
        setSelectedKeywords([]); 

        const POSITIVE = amISeller ? FOR_BUYER_POSITIVE : FOR_SELLER_POSITIVE;
        const NEGATIVE = amISeller ? FOR_BUYER_NEGATIVE : FOR_SELLER_NEGATIVE;

        if (rating >= 4) {
            setCurrentOptions(POSITIVE);
        } else if (rating === 3) {
            const mix = [...POSITIVE.slice(0, 3), ...NEGATIVE.slice(0, 3)];
            setCurrentOptions(mix);
        } else if (rating >= 1) {
            setCurrentOptions(NEGATIVE);
        } else {
            setCurrentOptions([]);
        }
    }, [rating, amISeller]);


    const handleRatingClick = (score) => setRating(score);

    const toggleKeyword = (id) => {
        if (selectedKeywords.includes(id)) {
            setSelectedKeywords(selectedKeywords.filter(k => k !== id));
        } else {
            setSelectedKeywords([...selectedKeywords, id]);
        }
    };

    // 데이터 전송
    const handleSubmit = async () => {
        if (rating === 0) {
            alert("별점을 선택해주세요!");
            return;
        }

        const reviewData = {
            tradeId: parseInt(tradeId),       
            targetUserId: parseInt(partnerId),
            rating: rating,
            content: reviewContent,
            keywords: selectedKeywords,
            retransaction: retransaction,
        };

        try {
            const response = await fetch(`/api/reviews?userId=${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewData),
                credentials: 'include',
            });

            if (response.ok) {
                alert("소중한 후기가 등록되었습니다!");
                // ⭐ [수정됨] 내 프로필로 이동 (또는 /sale/${userId} 로 이동해도 됨)
                navigate(`/profile/${userId}`); 
            } else {
                alert("후기 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error("에러 발생:", error);
            alert("통신 오류가 발생했습니다.");
        }
    };

    if (loading) return <div style={{color:'white', padding:'20px'}}>정보를 불러오는 중...</div>;

    return (
        <div className="app-shell">
            {/* ⭐ 스크롤바 숨기기 스타일 추가 */}
            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}
            </style>

            <div className="sub-app-shell" style={{ 
                display: 'flex', flexDirection: 'column', backgroundColor: '#000', 
                height: '100vh', color: '#fff', overflow: 'hidden'
            }}>
                
                {/* 헤더 */}
                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', borderBottom: '1px solid #333' }}>
                    <span onClick={() => navigate(-1)} style={{ fontSize: '24px', cursor: 'pointer' }}>✕</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {amISeller ? "구매자 후기 보내기" : "판매자 후기 보내기"}
                    </span>
                    <span onClick={handleSubmit} style={{ color: '#FF8A3D', fontWeight: 'bold', cursor: 'pointer' }}>완료</span>
                </div>

                {/* 내용 영역 - ⭐ hide-scrollbar 클래스 적용 */}
                <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    
                    {/* 안내 문구 */}
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', color: '#ccc', marginBottom: '10px' }}>
                            {amISeller ? "구매자분과의 거래는 어떠셨나요?" : "판매자분과의 거래는 어떠셨나요?"}
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
                            <span style={{ color: '#FF8A3D' }}>상대방</span>님과의<br/>
                            거래 후기를 남겨주세요
                        </h2>
                    </div>

                    {/* 별점 섹션 */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                        {[1, 2, 3, 4, 5].map((score) => (
                            <span key={score} onClick={() => handleRatingClick(score)}
                                style={{ 
                                    fontSize: '40px', cursor: 'pointer', margin: '0 5px',
                                    color: score <= rating ? '#FF8A3D' : '#333'
                                }}
                            >★</span>
                        ))}
                    </div>

                    {/* 키워드 섹션 */}
                    {rating > 0 && (
                        <div style={{ marginBottom: '30px', animation: 'fadeIn 0.5s' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
                                {rating >= 4 ? '어떤 점이 최고였나요?' : rating <= 2 ? '어떤 점이 별로였나요?' : '어떤 점이 기억에 남나요?'}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {currentOptions.map((option) => (
                                    <div 
                                        key={option.id}
                                        onClick={() => toggleKeyword(option.id)}
                                        style={{
                                            padding: '12px 15px', borderRadius: '8px', cursor: 'pointer',
                                            border: selectedKeywords.includes(option.id) ? '1px solid #FF8A3D' : '1px solid #333',
                                            backgroundColor: selectedKeywords.includes(option.id) ? 'rgba(255, 138, 61, 0.1)' : '#16171B',
                                            color: selectedKeywords.includes(option.id) ? '#FF8A3D' : '#fff',
                                        }}
                                    >
                                        {option.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* 재거래 희망 체크박스 */}
                    {rating > 0 && (
                        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#16171B', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '15px' }}>이 분과 다시 거래하고 싶으신가요?</span>
                            <input 
                                type="checkbox" 
                                checked={retransaction} 
                                onChange={(e) => setRetransaction(e.target.checked)}
                                style={{ transform: 'scale(1.5)', accentColor: '#FF8A3D', cursor: 'pointer' }}
                            />
                        </div>
                    )}

                    {/* 텍스트 입력 */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>상세 후기 (선택)</h3>
                        <textarea 
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            placeholder="비방이나 욕설은 서비스 이용에 제한이 있을 수 있습니다."
                            style={{ 
                                width: '100%', height: '100px', backgroundColor: '#16171B', 
                                border: '1px solid #333', borderRadius: '8px', padding: '15px',
                                color: 'white', fontSize: '14px', outline: 'none', resize: 'none'
                            }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReviewWritePage;