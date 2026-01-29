import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../css/Index.css"; 
// 기존 CSS 사용 (MainPage.css나 ProfilePage.css가 있다면 import 하세요)

function SaleListPage() {
    const navigate = useNavigate();
    const { userId } = useParams(); // URL: /sale/:userId

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [candidates, setCandidates] = useState([]); // 구매자 후보 리스트
    const [selectedPostId, setSelectedPostId] = useState(null); // 현재 거래 완료하려는 게시물 ID

    // 1. 내 판매글 목록 불러오기
    useEffect(() => {
        fetch(`/api/posts?sellerId=${userId}`, {
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            console.log(">>> 내 판매글 목록:", data);
            // 안전장치: 배열이 아니면 빈 배열로 처리
            setPosts(Array.isArray(data) ? data : []); 
            setLoading(false);
        })
        .catch(err => {
            console.error("판매글 조회 실패:", err);
            setLoading(false);
        });
    }, [userId]);

    // 2. [거래 완료] 버튼 클릭 시 -> 구매자 후보 가져오기
    const handleCompleteClick = async (postId) => {
        // postId가 잘 들어왔는지 확인
        if (!postId) {
            alert("게시물 ID 오류입니다.");
            return;
        }

        try {
            console.log(`>>> 구매자 후보 조회 요청: postId=${postId}`);
            const res = await fetch(`/api/trade/candidates?postId=${postId}`, {
                credentials: 'include'
            });
            
            if (res.status === 401) {
                alert("로그인이 필요합니다.");
                return;
            }
            
            const data = await res.json();
            console.log(">>> 받아온 구매자 후보 데이터:", data);
            
            // ⭐ 안전장치: 서버 응답이 배열이 아닐 경우 처리
            if (!Array.isArray(data)) {
                console.error("서버 응답이 배열이 아닙니다:", data);
                alert("구매자 목록을 불러오는 중 문제가 발생했습니다.");
                return;
            }

            // 채팅한 사람이 없으면 경고
            if (data.length === 0) {
                alert("이 물건에 대해 채팅한 사람이 없습니다. 아직 거래를 완료할 수 없어요!");
                return;
            }

            // 후보가 있으면 모달 열기
            setCandidates(data);
            setSelectedPostId(postId);
            setIsModalOpen(true);

        } catch (err) {
            console.error("구매자 후보 조회 에러:", err);
            alert("오류가 발생했습니다.");
        }
    };

    // 3. 모달에서 구매자 선택 시 -> 거래 확정 & 후기 페이지 이동
    const handleSelectBuyer = async (buyerId) => {
        if (!window.confirm("이 분과 거래를 확정하시겠습니까?")) return;

        try {
            const res = await fetch("/api/trade/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    postId: selectedPostId,
                    buyerId: buyerId
                })
            });

            if (res.ok) {
                const tradeId = await res.json(); // 백엔드에서 생성된 tradeId 받기
                alert("거래가 완료되었습니다! 후기를 작성해주세요.");
                
                // ⭐ [수정됨] tradeId를 URL 맨 뒤에 붙여서 이동
                navigate(`/reviews/write/${userId}/${selectedPostId}/${buyerId}/${tradeId}`);
            } else {
                const errorText = await res.text();
                console.error("거래 확정 실패:", errorText);
                alert("거래 확정에 실패했습니다.");
            }
        } catch (err) {
            console.error("거래 확정 에러:", err);
        }
    };

    // 가격 콤마 포맷
    const formatPrice = (price) => price ? price.toLocaleString() : 0;

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
                
                {/* 헤더 */}
                <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center' }}>
                    <span onClick={() => navigate(-1)} style={{ fontSize: '24px', cursor: 'pointer', marginRight: '15px' }}>←</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>판매 내역</span>
                </div>

                {/* 리스트 영역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                    {loading ? (
                        <div style={{textAlign:'center', marginTop:'20px'}}>로딩 중...</div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>판매 내역이 없습니다.</div>
                    ) : (
                        posts.map(post => (
                            // ⭐ [수정됨] post.postId 사용
                            <div key={post.postId} style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
                                {/* 썸네일 이미지 */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', marginRight: '15px', backgroundColor: '#333' }}>
                                    {post.images && post.images.length > 0 ? (
                                        <img src={post.images[0].url} alt="상품" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                                    )}
                                </div>

                                {/* 정보 영역 */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                                            {post.title}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#aaa' }}>
                                            {post.location ? post.location : "지역정보 없음"} · {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>
                                            {formatPrice(post.price)}원
                                        </div>
                                    </div>

                                    {/* 상태 및 버튼 */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                        {post.status === 'SOLD' ? (
                                            <span style={{ backgroundColor: '#444', color: '#aaa', padding: '5px 10px', borderRadius: '5px', fontSize: '13px' }}>
                                                거래 완료됨
                                            </span>
                                        ) : (
                                            <button 
                                                // ⭐ [수정됨] post.postId 사용
                                                onClick={() => handleCompleteClick(post.postId)}
                                                style={{ 
                                                    backgroundColor: '#FF8A3D', color: 'white', border: 'none', 
                                                    padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
                                                }}
                                            >
                                                거래 완료
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 🔹 구매자 선택 모달 */}
                {isModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: '#222', width: '80%', maxWidth: '350px', borderRadius: '10px', padding: '20px', color: '#fff' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>구매자를 선택해주세요</h3>
                            <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
                                채팅을 나눈 이웃 목록입니다.
                            </p>

                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {/* ⭐ 안전장치: 배열인지 확인하고 렌더링 */}
                                {Array.isArray(candidates) && candidates.length > 0 ? (
                                    candidates.map(user => (
                                        <div 
                                            key={user.userId} 
                                            onClick={() => handleSelectBuyer(user.userId)}
                                            style={{ 
                                                display: 'flex', alignItems: 'center', padding: '10px', 
                                                borderBottom: '1px solid #333', cursor: 'pointer' 
                                            }}
                                        >
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#555', overflow: 'hidden', marginRight: '10px' }}>
                                                {user.profileImageUrl ? (
                                                    <img src={user.profileImageUrl} alt="프사" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '15px' }}>{user.nickname}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{textAlign:'center', color:'#888', padding:'10px'}}>
                                        채팅 상대가 없습니다.
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{ width: '100%', padding: '10px', marginTop: '20px', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default SaleListPage;