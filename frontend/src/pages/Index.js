
import "../css/Index.css";


const handleKakaoLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
};

function Index() {

    return (
        <div className="app-shell">
            <div className="sub-app-shell">
                <div className="textIndexpagediv">
                    <span className="spanIndexpage">
                        무한루프 장터에 오신 것을 환영합니다.
                    </span>
                </div>
                <div className="textIndexpagediv2">
                    <span className="spanIndexpage">
                        대한민국 No.1 중고 플랫폼
                    </span>
                </div>
                <div className="Login_input">
                    <img className="kakao_login" onClick={handleKakaoLogin} alt="카카오 로그인" src="/kakao_login.png" />
                </div>
            </div>
        </div>
    );
}

export default Index;
