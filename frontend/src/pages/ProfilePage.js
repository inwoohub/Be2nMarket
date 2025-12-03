import React, { useEffect, useState, useRef } from "react";
import "../css/Index.css";
import "../css/ProfilePage.css"
import { Link, useNavigate } from "react-router-dom";
import Modal from "../modal/ProfileModal";


function ProfilePage() {

    const [imgLoaded, setImgLoaded] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cash, setCash] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editNickname, setEditNickname] = useState("");

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();


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
                    console.error("잔액 조회 실패", data);
                }
            })
            .catch((err) => {
                console.error("잔액 조회 에러", err);
            });
    }, []);

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

    const profileImageUrl =
        profile.profileImageUrl || "/User.png";

    const mannerTemp =
        typeof profile.mannerScore === "number"
            ? profile.mannerScore
            : 36.5;

    const reviews = "10";


    const userId = profile?.userId;
    const salePath = userId ? `/sale/${userId}` : "/login";
    const reviewPath = userId ? `/review/${userId}` : "/login";

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
                        {/* 가로 막대 게이지 */}
                        <div className="profilepage_manner_value">
                            {mannerTemp.toFixed(1)}°C
                        </div>

                        <div className="profilepage_manner_bar">
                            <div
                                className="profilepage_manner_bar_fill"
                                style={{ width: `${mannerTemp}%` }}
                            />
                        </div>

                        {/* 눈금 표시 (선택) */}
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
                            상점 리뷰
                        </span>
                        </div>
                        <div className="profilepage_sale_right">
                            <img className="profilepage_right_arrow"  alt="바로가기" src="/right_arrow.png" />
                        </div>
                    </Link>
                    <div className="profilepage_review_content">


                        {/* 리뷰 1 */}
                        <div className="profilepage_review_card">
                            <div className="review_card_left">
                                <div className="review_avatar">
                                    짱
                                </div>
                            </div>

                            <div className="review_card_right">
                                <div className="review_card_top">
                                    <span className="review_from_nickname">
                                        짱구아빠
                                    </span>
                                    <span className="review_created_at">
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

                                <p className="review_card_comment">
                                    상태가 좋아요. 시간 약속도 잘 지키셨어요!
                                </p>

                                <div className="review_card_trade">
                                    닌텐도 스위치 거래
                                </div>
                            </div>
                        </div>

                        {/* 리뷰 2 */}
                        <div className="profilepage_review_card">
                            <div className="review_card_left">
                                <div className="review_avatar">
                                    훈
                                </div>
                            </div>

                            <div className="review_card_right">
                                <div className="review_card_top">
                                    <span className="review_from_nickname">
                                        훈이
                                    </span>
                                    <span className="review_created_at">
                                        2025.11.20
                                    </span>
                                </div>

                                <div className="review_card_rating">
                                    <span className="star_filled">★</span>
                                    <span className="star_filled">★</span>
                                    <span className="star_filled">★</span>
                                    <span className="star_filled">★</span>
                                    <span className="star_filled">★</span>
                                </div>

                                <p className="review_card_comment">
                                    친절하고 응답도 빨라요. 또 거래하고 싶어요 😊
                                </p>

                                <div className="review_card_trade">
                                    책 3권 세트 거래
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


