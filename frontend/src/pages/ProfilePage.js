import React, { useEffect, useState, useRef } from "react";
import "../css/Index.css";
import "../css/ProfilePage.css"
import { Link, useNavigate, useParams } from "react-router-dom"; // useParams 추가
import Modal from "../modal/ProfileModal";


function ProfilePage() {
    // URL에서 userId 가져오기 (App.js 라우트가 /profile/:userId 라고 가정)
    const { userId: paramUserId } = useParams();

    const [imgLoaded, setImgLoaded] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cash, setCash] = useState(null);

    // ⭐ 리뷰 목록 상태 추가
    const [reviewList, setReviewList] = useState([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editNickname, setEditNickname] = useState("");

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    // 1. 내 정보 불러오기 (기본 프로필 정보)
    // 주의: 현재는 /api/me만 호출하므로, 남의 프로필에 가도 '내 정보'가 상단에 뜰 수 있습니다.
    // 남의 프로필 정보를 보려면 백엔드에 /api/profile/{id} 같은 API가 추가로 필요합니다.
    useEffect(() => {
        fetch("/api/me", {
            credentials: "include",   // 세션 쿠키 같이 보내기
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.auth === "oauth2" && data.user) {
                    setProfile(data.user);
                    setEditNickname(data.user.nickname || "");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("/api/me error", err);
                setLoading(false);
            });
    }, []);

    // 2. ⭐ [추가됨] 리뷰 목록 불러오기
    useEffect(() => {
        // URL에 있는 ID를 사용하거나, 없으면 내 ID(profile.userId)를 사용
        // (profile이 로드될 때까지 기다려야 할 수도 있음)
        const targetId = paramUserId || profile?.userId;

        if (!targetId) return;

        fetch(`/api/reviews/list/${targetId}`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(">>> 가져온 리뷰 목록:", data);
                setReviewList(data);
            })
            .catch((err) => {
                console.error("리뷰 조회 실패", err);
            });
    }, [paramUserId, profile]); // paramUserId나 profile이 바뀌면 실행


    // 프로필 이미지 변경 핸들러들
    const handleProfileEditClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/profile/image", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.message || "프로필 이미지 업로드 실패");
                return;
            }

            setProfile((prev) =>
                prev ? { ...prev, profileImageUrl: data.imageUrl } : prev
            );

        } catch (err) {
            console.error("프로필 이미지 업로드 에러", err);
            alert("업로드 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleDeleteProfileImage = async () => {
        if (!window.confirm("프로필 사진을 기본 이미지로 되돌릴까요?")) {
            return;
        }

        try {
            const res = await fetch("/api/profile/image/delete", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.message || "프로필 사진 삭제 실패");
                return;
            }

            setProfile((prev) =>
                prev ? { ...prev, profileImageUrl: "" } : prev
            );

        } catch (err) {
            console.error("프로필 사진 삭제 에러", err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ nickname: editNickname }),
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.message || "프로필 수정 실패");
                return;
            }

            setProfile((prev) =>
                prev ? { ...prev, nickname: data.nickname } : prev
            );
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("프로필 수정 에러", err);
            alert("프로필 수정 중 오류가 발생했습니다.");
        }
    };

    // 잔액 조회
    useEffect(() => {
        fetch("/api/wallet/balance", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setCash(data.balance);
                }
            })
            .catch((err) => {
                console.error("잔액 조회 에러", err);
            });
    }, []);

    // ⭐ 별점 렌더링 헬퍼 함수
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= rating ? "star_filled" : "star_empty"}>
                    ★
                </span>
            );
        }
        return stars;
    };

    // ⭐ 날짜 포맷팅 헬퍼 함수
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };


    if (loading) {
        return (
            <div className="app-shell">
                <div className="sub-app-shell">
                    프로필 정보를 불러오는 중입니다...
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="app-shell">
                <div className="sub-app-shell">
                    로그인 후 프로필을 확인할 수 있어요.
                </div>
            </div>
        );
    }

    const nickname = profile.nickname || "Unknown";
    const profileImageUrl = profile.profileImageUrl || "/User.png";
    const mannerTemp = typeof profile.mannerScore === "number" ? profile.mannerScore : 36.5;
    const isAdmin = profile?.role === "admin";
    const userId = profile?.userId;
    const salePath = userId ? `/sale/${userId}` : "/login";
    const reviewPath = userId ? `/reviews/${userId}` : "/login";

    return (
        <div className="app-shell">
            <div className="sub-app-shell">

                {/*사진 / 이름*/}
                <div className="profilepage_name">
                    <div className="profilepage_name_left">
                        <img
                            className="profilepage_profileImage"
                            alt="프로필 사진"
                            src={profileImageUrl}
                            onLoad={() => setImgLoaded(true)}
                            style={{
                                opacity: imgLoaded ? 1 : 0,
                                transition: "opacity 0.3s ease",
                            }}
                        />
                    </div>
                    <div className="profilepage_name_right">
                        <span>{nickname}</span>
                    </div>
                </div>

                {/*프로필 수정 버튼*/}
                <div className="profilepage_profileFix">
                    <button
                        className="profilepage_profileFix_btn"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        프로필 수정
                    </button>
                </div>

                {/*무한루프 페이*/}
                <div className="profilepage_cash">
                    <div className="profilepage_cash_title">
                        무한루프 페이
                    </div>
                    <div className="profilepage_cash_content">
                        <div className="profilpage_cash_content_section1">
                            <button className="profilepage_cash_btn" onClick={() => navigate(`/wallet/topup/${userId}`)}>
                                충전하기
                            </button>
                            <button
                                className="profilepage_cash_btn"
                                onClick={() => navigate(`/wallet/withdraw/${userId}`)}
                            >
                                출금하기
                            </button>
                        </div>
                        <div className="profilpage_cash_content_section2">
                            <div className="profilepage_cash_currentCash">
                                {cash !== null ? `${cash.toLocaleString()}원` : "잔액 불러오는 중..."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 매너 온도 */}
                <div className="profilepage_manner">
                    <div className="profilepage_manner_header">
                        <span className="profilepage_manner_title">매너 온도</span>
                    </div>

                    <div className="profilepage_manner_middle">
                        <div className="profilepage_manner_value">
                            {mannerTemp.toFixed(1)}°C
                        </div>
                        <div className="profilepage_manner_bar">
                            <div
                                className="profilepage_manner_bar_fill"
                                style={{ width: `${mannerTemp}%` }}
                            />
                        </div>
                        <div className="profilepage_manner_scale">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                    </div>
                </div>

                {/*판매 물품*/}
                <Link to={salePath} className="profilepage_sale">
                    <div className="profilepage_sale_left">
                        <span className="profilepage_sale_title">
                            판매 물품
                        </span>
                    </div>
                    <div className="profilepage_sale_right">
                        <img className="profilepage_right_arrow"  alt="바로가기" src="/right_arrow.png" />
                    </div>
                </Link>

                {/*상점 리뷰*/}
                <div className="profilepage_review">
                    <Link to={reviewPath} className="profilepage_review_sub">
                        <div className="profilepage_sale_left">
                            <span className="profilepage_sale_title">
                                상점 리뷰 <span style={{fontSize:'14px', color:'#888'}}>({reviewList.length})</span>
                            </span>
                        </div>
                        <div className="profilepage_sale_right">
                            <img className="profilepage_right_arrow"  alt="바로가기" src="/right_arrow.png" />
                        </div>
                    </Link>
                    
                    <div className="profilepage_review_content">
                        {/* ⭐ 동적으로 리뷰 리스트 렌더링 */}
                        {reviewList.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                                아직 받은 후기가 없어요.
                            </div>
                        ) : (
                            reviewList.map((review) => (
                                <div key={review.reviewId} className="profilepage_review_card">
                                    <div className="review_card_left">
                                        {/* 프로필 이미지가 없으면 닉네임 첫 글자나 기본 아이콘 표시 */}
                                        {review.writerProfileUrl ? (
                                            <img 
                                                src={review.writerProfileUrl} 
                                                alt="avatar" 
                                                className="review_avatar_img" 
                                                style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover'}}
                                            />
                                        ) : (
                                            <div className="review_avatar">
                                                {review.writerNickname ? review.writerNickname[0] : "?"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="review_card_right">
                                        <div className="review_card_top">
                                            <span className="review_from_nickname">
                                                {review.writerNickname}
                                            </span>
                                            <span className="review_created_at">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>

                                        <div className="review_card_rating">
                                            {renderStars(review.rating)}
                                        </div>

                                        <p className="review_card_comment">
                                            {review.content}
                                        </p>
                                        
                                        {/* 키워드(태그)가 있다면 표시 */}
                                        {review.keywords && review.keywords.length > 0 && (
                                            <div style={{display:'flex', gap:'5px', flexWrap:'wrap', marginTop:'5px'}}>
                                                {review.keywords.map((keyword, idx) => (
                                                    <span key={idx} style={{
                                                        backgroundColor: '#f0f0f0', 
                                                        color: '#555', 
                                                        fontSize: '11px', 
                                                        padding: '3px 6px', 
                                                        borderRadius: '4px'
                                                    }}>
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="review_bottom_magrin"></div>

                        {/*✅ 관리자용 버튼: admin만 보이도록 */}
                        {isAdmin && (
                            <div className="profilpage_admin_section">
                                <a
                                    href="/admin/withdraw-requests"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="profilepage_admin_btn"
                                >
                                    출금 관리 (관리자 페이지)
                                </a>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditNickname(profile.nickname || "");
                }}
                title="프로필 수정"
            >
                {/* 모달 내용 */}
                <div className="profile_modal_avatar_section">
                    <div className="profile_modal_avatar_wrapper">
                        <img
                            className="profile_modal_profileImage"
                            alt="프로필 사진"
                            src={profileImageUrl}
                        />
                    </div>
                    <div className="profile_modal_avatar_wrapper2">
                        <button
                            type="button"
                            className="profile_modal_camera_btn"
                            onClick={handleProfileEditClick}
                            disabled={uploading}
                        >
                            이미지 변경
                        </button>
                        <button
                            type="button"
                            className="profile_modal_clear_btn"
                            onClick={handleDeleteProfileImage}
                        >
                            이미지 삭제
                        </button>
                    </div>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleProfileImageChange}
                />

                <div className="profile_modal_field">
                    <input
                        type="text"
                        className="profile_modal_input"
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        maxLength={20}
                    />
                    <button
                        type="button"
                        className="profile_modal_save_btn"
                        onClick={handleSaveProfile}
                    >
                        변경
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default ProfilePage;