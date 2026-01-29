import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../css/Index.css";

function ReviewDetailPage() {
    const navigate = useNavigate();
    const { userId } = useParams(); 

    const [activeTab, setActiveTab] = useState('ALL'); 
    const [reviews, setReviews] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. 데이터 가져오기 (fetchData를 useEffect 안으로 이동)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // (1) 리뷰 목록 조회
                const reviewRes = await fetch(`/api/reviews/list/${userId}?type=${activeTab}`, {
                    credentials: 'include'
                });
                const reviewData = await reviewRes.json();
                console.log(">>> 상세페이지 리뷰 목록:", reviewData);
                setReviews(Array.isArray(reviewData) ? reviewData : []);

                // (2) 작성 가능한 리뷰 조회 (로그인한 본인일 때만 유효하지만 일단 요청)
                // 401 Unauthorized가 뜨더라도 에러 처리 하지 않고 빈 배열로 설정
                const pendingRes = await fetch(`/api/reviews/pending`, { credentials: 'include' });
                if (pendingRes.ok) {
                    const pendingData = await pendingRes.json();
                    console.log(">>> 작성 가능 리뷰:", pendingData);
                    setPendingReviews(Array.isArray(pendingData) ? pendingData : []);
                } else {
                    setPendingReviews([]);
                }

            } catch (err) {
                console.error("데이터 로딩 실패:", err);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, activeTab]); // userId나 activeTab이 바뀌면 재실행

    // 2. 작성하러 가기
    const handleWriteClick = (trade) => {
        navigate(`/reviews/write/${userId}/${trade.postId}/${trade.partnerId}/${trade.tradeId}`);
    };

    // 탭 스타일 헬퍼
    const getTabStyle = (tabName) => ({
        flex: 1,
        textAlign: 'center',
        padding: '15px 0',
        cursor: 'pointer',
        color: activeTab === tabName ? '#fff' : '#888',
        borderBottom: activeTab === tabName ? '2px solid #fff' : '1px solid #333',
        fontWeight: activeTab === tabName ? 'bold' : 'normal',
        transition: 'all 0.2s'
    });

    // 별점 렌더링 헬퍼
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<span key={i} style={{ color: i <= rating ? '#FF8A3D' : '#333', fontSize: '14px' }}>★</span>);
        }
        return stars;
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="app-shell">
            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>

            <div className="sub-app-shell" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#000', height: '100vh', color: '#fff' }}>
                
                {/* 헤더 */}
                <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center' }}>
                    <span onClick={() => navigate(-1)} style={{ fontSize: '24px', cursor: 'pointer', marginRight: '15px' }}>←</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>받은 거래 후기</span>
                </div>

                {/* 작성 가능한 리뷰 알림 배너 */}
                {pendingReviews.length > 0 && (
                    <div 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            backgroundColor: 'rgba(255, 138, 61, 0.1)', 
                            padding: '12px 15px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            borderBottom: '1px solid #333'
                        }}
                    >
                        <span style={{ color: '#FF8A3D', fontSize: '14px', fontWeight: 'bold' }}>
                            ✍️ 작성하지 않은 거래 후기가 {pendingReviews.length}건 있어요!
                        </span>
                        <span style={{ color: '#FF8A3D' }}>&gt;</span>
                    </div>
                )}

                {/* 3단 탭 */}
                <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                    <div style={getTabStyle('ALL')} onClick={() => setActiveTab('ALL')}>전체</div>
                    <div style={getTabStyle('seller')} onClick={() => setActiveTab('seller')}>판매자 후기</div>
                    <div style={getTabStyle('buyer')} onClick={() => setActiveTab('buyer')}>구매자 후기</div>
                </div>

                {/* 리스트 영역 */}
                <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: '30px', color: '#666' }}>로딩 중...</div>
                    ) : reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
                            아직 받은 후기가 없어요.
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.reviewId} style={{ marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    {/* 프사 */}
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#333', overflow: 'hidden', marginRight: '10px' }}>
                                        {review.writerProfileUrl ? (
                                            <img src={review.writerProfileUrl} alt="프사" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                                        )}
                                    </div>
                                    
                                    {/* 닉네임 & 정보 */}
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                            {review.writerNickname}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {formatDate(review.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* 후기 내용 */}
                                <div style={{ paddingLeft: '50px' }}>
                                    <div style={{ marginBottom: '5px' }}>{renderStars(review.rating)}</div>
                                    <div style={{ fontSize: '14px', marginBottom: '8px', lineHeight: '1.4' }}>
                                        {review.content || "따뜻한 후기를 남겨주셨어요."}
                                    </div>
                                    
                                    {/* 키워드 뱃지 */}
                                    {review.keywords && review.keywords.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            {review.keywords.map((k, i) => (
                                                <span key={i} style={{ backgroundColor: '#222', color: '#ccc', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 작성 가능한 후기 팝업 (모달) */}
                {isModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: '#1E1E1E', width: '85%', maxWidth: '350px', borderRadius: '12px', padding: '20px', color: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>작성 가능한 후기</span>
                                <span onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer', fontSize: '20px' }}>✕</span>
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {pendingReviews.map(trade => (
                                    <div 
                                        key={trade.tradeId} 
                                        onClick={() => handleWriteClick(trade)}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', padding: '12px 0', 
                                            borderBottom: '1px solid #333', cursor: 'pointer' 
                                        }}
                                    >
                                        <div style={{ width: '50px', height: '50px', borderRadius: '6px', backgroundColor: '#333', marginRight: '12px', overflow: 'hidden' }}>
                                            {trade.postImage ? (
                                                <img src={trade.postImage} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                            ) : (
                                                <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>📦</div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{trade.postTitle}</div>
                                            <div style={{ fontSize: '13px', color: '#aaa' }}>
                                                {trade.partnerNickname}님과의 거래
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#FF8A3D', marginTop: '2px' }}>
                                                후기 쓰러가기 &gt;
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ReviewDetailPage;