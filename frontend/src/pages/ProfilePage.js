import React, { useEffect, useState, useRef } from "react";
import "../css/Index.css";
import "../css/ProfilePage.css"
import { Link, useNavigate, useParams } from "react-router-dom";
import Modal from "../modal/ProfileModal";


function ProfilePage() {
    const { userId: paramUserId } = useParams();
    const navigate = useNavigate();

    const [imgLoaded, setImgLoaded] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cash, setCash] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editNickname, setEditNickname] = useState("");

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // [핵심 수정] 이미지 경로 안전 처리 함수
    const getSafeImageUrl = (url) => {
        if (!url) return "/User.png"; 
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        if (url.startsWith('/')) return url;
        // 상대 경로일 경우 앞에 /를 붙여 절대 경로로 변환
        return `/${url}`; 
    };

    useEffect(() => {
        fetch("/api/session/me", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.auth === "oauth2") {
                    // data.user가 있으면 쓰고, 없으면 data 자체를 사용 (호환성)
                    const userInfo = data.user || data;
                    setProfile(userInfo);
                    setEditNickname(userInfo.nickname || "");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("/api/me error", err);
                setLoading(false);
            });
    }, []);

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
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    nickname: editNickname,
                }),
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

    useEffect(() => {
        fetch("/api/wallet/balance", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setCash(data.balance);
                } else {
                    // console.error("잔액 조회 실패", data); // 조용히 실패 처리
                }
            })
            .catch((err) => {
                console.error("잔액 조회 에러", err);
            });
    }, []);

    if (loading) {
        return (
            <div className="app-shell">
                <div className="sub-app-shell" style={{ backgroundColor: '#000000', color: '#ffffff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    프로필 정보를 불러오는 중입니다...
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="app-shell">
                <div className="sub-app-shell" style={{ backgroundColor: '#000000', color: '#ffffff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    로그인 후 프로필을 확인할 수 있어요.
                </div>
            </div>
        );
    }

    const nickname = profile.nickname || "Unknown";
    
    // [수정] 안전한 이미지 경로 함수 사용
    const profileImageUrl = getSafeImageUrl(profile.profileImageUrl);

    const mannerTemp =
        typeof profile.mannerScore === "number"
            ? profile.mannerScore
            : 36.5;

    const userId = profile?.userId || paramUserId;
    const salePath = userId ? `/sale/${userId}` : "/login";
    const reviewPath = userId ? `/review/${userId}` : "/login";

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{ 
                backgroundColor: '#000000', // 배경 검정
                color: '#ffffff',           // 텍스트 흰색
                minHeight: '100vh',
                paddingBottom: '10vh',
                boxSizing: 'border-box'
            }}>

                {/*사진 / 이름*/}
                <div className="profilepage_name" style={{ borderBottom: '1px solid #333' }}>
                    <div className="profilepage_name_left">
                        <img
                            className="profilepage_profileImage"
                            alt="프로필 사진"
                            src={profileImageUrl}
                            onLoad={() => setImgLoaded(true)}
                            style={{
                                opacity: imgLoaded ? 1 : 0,
                                transition: "opacity 0.3s ease",
                                backgroundColor: '#333',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {e.target.src = '/User.png'}}
                        />
                    </div>
                    <div className="profilepage_name_right">
                        <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{nickname}</span>
                    </div>
                </div>

                {/*프로필 수정 버튼*/}
                <div className="profilepage_profileFix">
                    <button
                        className="profilepage_profileFix_btn"
                        onClick={() => setIsEditModalOpen(true)}
                        style={{ backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                        >
                        프로필 수정
                    </button>
                </div>

                {/*무한루프 페이*/}
                <div className="profilepage_cash">
                    <div className="profilepage_cash_title" style={{ color: '#ffffff' }}>
                        무한루프 페이
                    </div>
                    <div className="profilepage_cash_content" style={{ backgroundColor: '#222' }}>
                        <div className="profilpage_cash_content_section1">
                            <button className="profilepage_cash_btn" onClick={() => navigate(`/wallet/topup/${userId}`)} style={{ color: '#fff' }}>
                                충전하기
                            </button>
                            <button
                                className="profilepage_cash_btn"
                                onClick={() => navigate(`/wallet/withdraw/${userId}`)}
                                style={{ color: '#fff' }}
                            >
                                출금하기
                            </button>
                        </div>
                        <div className="profilpage_cash_content_section2">
                            <div className="profilepage_cash_currentCash" style={{ color: '#fff' }}>
                                {cash !== null ? `${cash.toLocaleString()}원` : "잔액 불러오는 중..."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 매너 온도 */}
                <div className="profilepage_manner">
                    <div className="profilepage_manner_header">
                        <span className="profilepage_manner_title" style={{ color: '#ffffff' }}>매너 온도</span>
                    </div>

                    <div className="profilepage_manner_middle">
                        {/* 가로 막대 게이지 */}
                        <div className="profilepage_manner_value" style={{ color: '#0dcc5a' }}>
                            {mannerTemp.toFixed(1)}°C
                        </div>

                        <div className="profilepage_manner_bar" style={{ backgroundColor: '#444' }}>
                            <div
                                className="profilepage_manner_bar_fill"
                                style={{ width: `${mannerTemp}%`, backgroundColor: '#0dcc5a' }}
                            />
                        </div>

                        {/* 눈금 표시 */}
                        <div className="profilepage_manner_scale" style={{ color: '#888' }}>
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                    </div>
                </div>

                {/*판매 물품*/}
                <Link to={salePath} className="profilepage_sale" style={{ borderBottom: '1px solid #333' }}>
                    <div className="profilepage_sale_left">
                        <span className="profilepage_sale_title" style={{ color: '#ffffff' }}>
                            판매 물품
                        </span>
                    </div>
                    <div className="profilepage_sale_right">
                        <img className="profilepage_right_arrow"  alt="바로가기" src="/right_arrow.png" style={{ filter: 'invert(1)' }} />
                    </div>
                </Link>

                {/*상점 리뷰*/}
                <div className="profilepage_review">
                    <Link to={reviewPath} className="profilepage_review_sub" style={{ borderBottom: '1px solid #333' }}>
                        <div className="profilepage_sale_left">
                        <span className="profilepage_sale_title" style={{ color: '#ffffff' }}>
                            상점 리뷰
                        </span>
                        </div>
                        <div className="profilepage_sale_right">
                            <img className="profilepage_right_arrow"  alt="바로가기" src="/right_arrow.png" style={{ filter: 'invert(1)' }} />
                        </div>
                    </Link>
                    <div className="profilepage_review_content">
                         {/* 리뷰 1 */}
                         <div className="profilepage_review_card" style={{ borderBottom: '1px solid #333' }}>
                            <div className="review_card_left">
                                <div className="review_avatar" style={{ backgroundColor: '#333', color: '#fff' }}>
                                    짱
                                </div>
                            </div>

                            <div className="review_card_right">
                                <div className="review_card_top">
                                    <span className="review_from_nickname" style={{ color: '#fff' }}>
                                        짱구아빠
                                    </span>
                                    <span className="review_created_at" style={{ color: '#888' }}>
                                        2025.11.24
                                    </span>
                                </div>

                                <div className="review_card_rating">
                                    <span className="star_filled">★</span>
                                    <span className="star_filled">★</span>
                                    <span className="star_filled">★</span>
                                    <span className="star_filled">★</span>
                                    <span className="star_empty">★</span>
                                </div>

                                <p className="review_card_comment" style={{ color: '#ddd' }}>
                                    상태가 좋아요. 시간 약속도 잘 지키셨어요!
                                </p>

                                <div className="review_card_trade" style={{ color: '#aaa', backgroundColor: '#222' }}>
                                    닌텐도 스위치 거래
                                </div>
                            </div>
                        </div>
                        <div className="review_bottom_magrin"></div>
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
                <div className="profile_modal_avatar_section">
                    <div className="profile_modal_avatar_wrapper">
                        <img
                            className="profile_modal_profileImage"
                            alt="프로필 사진"
                            src={profileImageUrl}
                            style={{ objectFit: 'cover' }}
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