import React, { useState, useEffect } from 'react';

const SetLocationPage = () => {
    
    // 상태 관리
    const [userId, setUserId] = useState(null);
    const [sidoList, setSidoList] = useState([]);
    const [sigunguList, setSigunguList] = useState([]);
    const [dongList, setDongList] = useState([]);

    const [selectedSido, setSelectedSido] = useState('');
    const [selectedSigungu, setSelectedSigungu] = useState('');
    const [selectedLocationId, setSelectedLocationId] = useState(null);

    // 스타일 정의 (이게 없어서 에러가 났던 거예요!)
    const selectStyle = {
        width: '100%',
        height: '50px',
        padding: '0 15px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        outline: 'none',
        marginBottom: '15px',
        cursor: 'pointer'
    };

    // 0. 사용자 ID 가져오기
    useEffect(() => {
        fetch('/api/session/me', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.userId) setUserId(data.userId);
        })
        .catch(err => console.error(err));
    }, []);

    // 1. 시/도 목록 가져오기
    useEffect(() => {
        fetch('/api/locations/sido')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setSidoList(data);
                } else {
                    setSidoList([]);
                }
            })
            .catch(err => {
                console.error(err);
                setSidoList([]);
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
                .then(data => {
                    if(Array.isArray(data)) setSigunguList(data);
                    else setSigunguList([]);
                })
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
                .then(data => {
                    if(Array.isArray(data)) setDongList(data);
                    else setDongList([]);
                })
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, locationId: selectedLocationId })
        })
        .then(res => {
            if (res.ok) {
                alert("동네 설정이 완료되었습니다!");
                window.location.href = `/main/${userId}`;
            } else {
                alert("설정 실패");
            }
        })
        .catch(err => console.error(err));
    };

    return (
        <div style={{ 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            marginTop: '50px',
            backgroundColor: '#f9f9f9',
            minHeight: '100vh'
        }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>동네 설정하기</h2>
            <p style={{ color: '#666', marginBottom: '40px' }}>거래를 시작하기 위해 동네를 인증해주세요.</p>

            <div style={{ width: '100%', maxWidth: '400px' }}>
                
                {/* 시/도 선택 */}
                <select 
                    style={selectStyle} 
                    value={selectedSido} 
                    onChange={handleSidoChange}
                >
                    <option value="">시/도 선택</option>
                    {sidoList && sidoList.map((item, idx) => (
                        <option key={idx} value={item.sido}>{item.sido}</option>
                    ))}
                </select>

                {/* 시/군/구 선택 */}
                <select 
                    style={selectStyle} 
                    value={selectedSigungu} 
                    onChange={handleSigunguChange} 
                    disabled={!selectedSido}
                >
                    <option value="">시/군/구 선택</option>
                    {sigunguList && sigunguList.map((item, idx) => (
                        <option key={idx} value={item.sigungu}>{item.sigungu}</option>
                    ))}
                </select>

                {/* 동 선택 (여기가 중요! dong -> eupmyeondong 수정됨) */}
                <select 
                    style={selectStyle} 
                    value={selectedLocationId || ''} 
                    onChange={handleDongChange} 
                    disabled={!selectedSigungu}
                >
                    <option value="">읍/면/동 선택</option>
                    {dongList && dongList.map((item) => (
                        // 백엔드에서 이름을 바꿨으므로 여기도 eupmyeondong 사용!
                        <option key={item.locationId} value={item.locationId}>
                            {item.eupmyeondong} 
                        </option>
                    ))}
                </select>

                <button 
                    onClick={handleSubmit} 
                    disabled={!selectedLocationId}
                    style={{
                        width: '100%',
                        marginTop: '20px',
                        padding: '18px',
                        backgroundColor: selectedLocationId ? '#FF6F0F' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: selectedLocationId ? 'pointer' : 'not-allowed',
                        transition: '0.3s'
                    }}
                >
                    설정 완료
                </button>
            </div>
        </div>
    );
};

export default SetLocationPage;