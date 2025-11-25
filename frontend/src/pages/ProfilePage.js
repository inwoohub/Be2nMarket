import React, { useEffect, useState } from "react";
import "../css/Index.css";
import "../css/ProfilePage.css"
import { Link, useNavigate } from "react-router-dom";


function ProfilePage() {

    const [imgLoaded, setImgLoaded] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cash, setCash] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/me", {
            credentials: "include",   // 세션 쿠키 같이 보내기
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.auth === "oauth2" && data.user) {
                    setProfile(data.user);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("/api/me error", err);
                setLoading(false);
            });
    }, []);

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
                        onClick={() => {
                            // 나중에 /profile/edit 같은 곳으로 이동 연결하면 됨
                            alert("프로필 수정 화면은 나중에 붙일 예정!");
                            }}
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
                            <button className="profilepage_cash_btn">
                                송금하기
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
        </div>
    );
}

export default ProfilePage;
