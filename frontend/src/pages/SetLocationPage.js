import React, { useState, useEffect } from 'react';
// useNavigate 제거 (안 쓰니까!)

const SetLocationPage = () => {
    // const navigate = useNavigate(); // 이 줄을 삭제했습니다.
    
    // 상태 관리
    const [userId, setUserId] = useState(null);
    const [sidoList, setSidoList] = useState([]);
    const [sigunguList, setSigunguList] = useState([]);
    const [dongList, setDongList] = useState([]);

    const [selectedSido, setSelectedSido] = useState('');
    const [selectedSigungu, setSelectedSigungu] = useState('');
    const [selectedLocationId, setSelectedLocationId] = useState(null);

    // 0. 사용자 ID 가져오기
    useEffect(() => {
        fetch('/api/session/me', {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.userId) {
                setUserId(data.userId);
            }
        })
        .catch(err => console.error(err));
    }, []);

// 1. 시/도 목록 가져오기 (수정됨!)
    useEffect(() => {
        fetch('/api/locations/sido')
            .then(res => {
                // 응답이 성공(200)이 아니면 에러 처리
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("서버에서 받은 시/도 데이터:", data); // 👈 F12 콘솔에서 이거 확인 필수!

                // 데이터가 진짜 배열인지 확인하고 넣기 (안전장치)
                if (Array.isArray(data)) {
                    setSidoList(data);
                } else {
                    console.error("데이터가 리스트가 아닙니다!:", data);
                    setSidoList([]); // 빈 배열로 초기화해서 멈춤 방지
                }
            })
            .catch(err => {
                console.error("시/도 목록 불러오기 실패:", err);
                setSidoList([]); // 에러 나도 빈 배열로 둬서 멈춤 방지
            });
    }, []);

    // 2. 시/도 변경 핸들러
    const handleSidoChange = (e) => {
        const sido = e.target.value;
        setSelectedSido(sido);
        setSelectedSigungu('');
        setDongList([]);
        setSelectedLocationId(null);

        if (sido) {
            fetch(`/api/locations/sigungu?sido=${sido}`)
                .then(res => res.json())
                .then(data => setSigunguList(data))
                .catch(err => console.error(err));
        }
    };

    // 3. 시/군/구 변경 핸들러
    const handleSigunguChange = (e) => {
        const sigungu = e.target.value;
        setSelectedSigungu(sigungu);
        setSelectedLocationId(null);

        if (sigungu) {
            fetch(`/api/locations/dong?sido=${selectedSido}&sigungu=${sigungu}`)
                .then(res => res.json())
                .then(data => setDongList(data))
                .catch(err => console.error(err));
        }
    };

    // 4. 동 선택 핸들러
    const handleDongChange = (e) => {
        setSelectedLocationId(e.target.value);
    };

    // 5. 저장 버튼 핸들러
    const handleSubmit = () => {
        if (!selectedLocationId || !userId) {
            alert("지역을 끝까지 선택해주세요.");
            return;
        }

        fetch('/api/locations/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                locationId: selectedLocationId
            })
        })
        .then(res => {
            if (res.ok) {
                alert("동네 설정이 완료되었습니다!");
                // 새로고침하여 메인 페이지로 이동 (세션 정보 갱신을 위해)
                window.location.href = `/main/${userId}`;
            } else {
                alert("설정에 실패했습니다.");
            }
        })
        .catch(err => {
            console.error(err);
            alert("오류가 발생했습니다.");
        });
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
            <h2>동네 설정하기</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>거래를 시작하기 위해 동네를 인증해주세요.</p>

            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 시/도 선택 */}
                <select 
                    style={{ padding: '10px', fontSize: '16px' }} 
                    value={selectedSido} 
                    onChange={handleSidoChange}
                >
                    <option value="">시/도 선택</option>
                    {sidoList.map((item, idx) => (
                        <option key={idx} value={item.sido}>{item.sido}</option>
                    ))}
                </select>

                {/* 시/군/구 선택 */}
                <select 
                    style={{ padding: '10px', fontSize: '16px' }} 
                    value={selectedSigungu} 
                    onChange={handleSigunguChange} 
                    disabled={!selectedSido}
                >
                    <option value="">시/군/구 선택</option>
                    {sigunguList.map((item, idx) => (
                        <option key={idx} value={item.sigungu}>{item.sigungu}</option>
                    ))}
                </select>

                {/* 동 선택 */}
                <select 
                    style={{ padding: '10px', fontSize: '16px' }} 
                    value={selectedLocationId || ''} 
                    onChange={handleDongChange} 
                    disabled={!selectedSigungu}
                >
                    <option value="">읍/면/동 선택</option>
                    {dongList.map((item) => (
                        <option key={item.locationId} value={item.locationId}>
                            {item.dong}
                        </option>
                    ))}
                </select>

                <button 
                    onClick={handleSubmit} 
                    disabled={!selectedLocationId}
                    style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: selectedLocationId ? '#FF6F0F' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: selectedLocationId ? 'pointer' : 'not-allowed'
                    }}
                >
                    설정 완료
                </button>
            </div>
        </div>
    );
};

export default SetLocationPage;