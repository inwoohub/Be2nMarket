
import "../css/Index.css";
import "../css/ProfilePage.css"




function ProfilePage() {

    return (
        <div className="app-shell">
            <div className="sub-app-shell">
                <div className="profilepage_Name">
                    <sapn> 이름 및 사진 </sapn>
                </div>
                <div className="profilepage_profileFix">
                    <span> 프로필 수정 버튼 </span>
                </div>
                <div className="profilepage_manner">
                    <span> 매너 온도 </span>
                </div>
                <div className="profilepage_reTrade">
                    <span> 재거래 희망률 </span>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
