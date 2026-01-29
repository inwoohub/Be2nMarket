import React, { useState, useEffect, useRef } from 'react';

const SetLocationPage = () => {
    
    // ---------------------------------------------------
    // 1. 상태 관리 변수들
    // ---------------------------------------------------
    const [userId, setUserId] = useState(null);
    const [sidoList, setSidoList] = useState([]);
    const [sigunguList, setSigunguList] = useState([]);
    const [dongList, setDongList] = useState([]);

    const [selectedSido, setSelectedSido] = useState('');
    const [selectedSigungu, setSelectedSigungu] = useState('');
    const [selectedLocationId, setSelectedLocationId] = useState(null);

    // 지도와 폴리곤 관련 상태
    const mapRef = useRef(null);      // 카카오맵 객체 저장
    const polygonRef = useRef(null);  // 현재 그려진 폴리곤 저장
    const [geoData, setGeoData] = useState(null); // geo.json 데이터 저장

    // 스타일
    const selectStyle = {
        width: '100%', height: '50px', padding: '0 15px', fontSize: '16px',
        border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff',
        outline: 'none', marginBottom: '15px', cursor: 'pointer'
    };

    // ---------------------------------------------------
    // 2. 초기화 (유저ID, GeoJSON 로딩, 지도 대기 및 생성)
    // ---------------------------------------------------
    useEffect(() => {
        // (1) 유저 세션 확인
        fetch('/api/session/me', { credentials: 'include' })
            .then(res => res.json()).then(data => { if (data.userId) setUserId(data.userId); })
            .catch((err) => console.error('세션 확인 실패:', err));

        // (2) 시/도 목록 로딩
        fetch('/api/locations/sido')
            .then(res => res.json())
            .then(setSidoList)
            .catch((err) => console.error('시/도 목록 로딩 실패:', err));

        // (3) GeoJSON 파일 미리 읽어오기
        fetch('/geo.json')
            .then(res => res.json())
            .then(data => {
                // log:("GeoJSON 로드 성공:", data);
                setGeoData(data);
            })
            .catch((err) => console.error('GeoJSON 로드 실패:', err));

        // (4) 🗺️ 카카오맵 생성
        const container = document.getElementById('kakao-map');
        
        const initMap = () => {
            // 🚨 [수정 핵심] 지도를 그리기 전에 기존 내용을 싹 비워줍니다! (중복 방지)
            container.innerHTML = ''; 
            
            const options = {
                center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청
                level: 7
            };
            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;
            // log:("카카오맵 로드 완료!");
        };

        if (window.kakao && window.kakao.maps) {
            initMap();
        } else {
            // log:("카카오맵 로딩 대기 중...");
            const interval = setInterval(() => {
                if (window.kakao && window.kakao.maps) {
                    clearInterval(interval);
                    initMap();
                }
            }, 100);
            return () => clearInterval(interval);
        }

    }, []);

    // ---------------------------------------------------
    // 3. 핸들러 함수들
    // ---------------------------------------------------

    // 시/도 변경
    const handleSidoChange = (e) => {
        const sido = e.target.value;
        setSelectedSido(sido);
        setSelectedSigungu('');
        setDongList([]);
        setSelectedLocationId(null);
        removePolygon(); 

        if (sido) {
            fetch(`/api/locations/sigungu?sido=${sido}`)
                .then(res => res.json())
                .then(data => setSigunguList(Array.isArray(data) ? data : []))
                .catch((err) => console.error('시/군/구 목록 로딩 실패:', err));
        }
    };

    // 시/군/구 변경
    const handleSigunguChange = (e) => {
        const sigungu = e.target.value;
        setSelectedSigungu(sigungu);
        setSelectedLocationId(null);
        removePolygon(); 

        if (sigungu) {
            fetch(`/api/locations/dong?sido=${selectedSido}&sigungu=${sigungu}`)
                .then(res => res.json())
                .then(data => setDongList(Array.isArray(data) ? data : []))
                .catch((err) => console.error('읍/면/동 목록 로딩 실패:', err));
        }
    };

    // 동 변경 (폴리곤 그리기)
    const handleDongChange = (e) => {
        const locationId = e.target.value; 
        setSelectedLocationId(locationId);

        if (locationId) {
            drawPolygon(locationId); 
        }
    };

    // ---------------------------------------------------
    // 4. 지도 & 폴리곤 그리기 로직
    // ---------------------------------------------------

    const removePolygon = () => {
        if (polygonRef.current) {
            polygonRef.current.setMap(null); 
            polygonRef.current = null;
        }
    };

    const drawPolygon = (dbLocationId) => {
        if (!mapRef.current || !geoData) return;

        removePolygon();

        // DB ID(10자리)로 GeoJSON ID(8자리) 찾기
        const strDbId = String(dbLocationId);
        const feature = geoData.features.find(f => strDbId.startsWith(f.properties.EMD_CD));

        if (!feature) {
            // log:("⚠️ 해당 동의 경계 데이터 없음. DB ID:", dbLocationId);
            return;
        }

        // 좌표 변환 및 그리기
        let coordinates = [];
        if (feature.geometry.type === "Polygon") {
            coordinates = feature.geometry.coordinates[0];
        } else if (feature.geometry.type === "MultiPolygon") {
            coordinates = feature.geometry.coordinates[0][0];
        }

        const path = coordinates.map(coord => new window.kakao.maps.LatLng(coord[1], coord[0]));

        const polygon = new window.kakao.maps.Polygon({
            path: path,
            strokeWeight: 2,
            strokeColor: '#FF6F0F', 
            strokeOpacity: 0.8,
            fillColor: '#FF6F0F',
            fillOpacity: 0.4 
        });

        polygon.setMap(mapRef.current);
        polygonRef.current = polygon;

        // 지도의 중심 이동
        const centerLat = path[0].getLat();
        const centerLng = path[0].getLng();
        mapRef.current.panTo(new window.kakao.maps.LatLng(centerLat, centerLng));
    };

    // 저장 버튼
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
                alert("동네 설정 완료!");
                window.location.href = `/main`;
            } else {
                alert("설정 실패");
            }
        })
        .catch((err) => console.error('동네 설정 저장 실패:', err));
    };

    // ---------------------------------------------------
    // 5. 화면 렌더링
    // ---------------------------------------------------
    return (
        <div style={{ 
            padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
            backgroundColor: '#f9f9f9', minHeight: '100vh' 
        }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>동네 설정하기</h2>
            
            <div id="kakao-map" style={{ 
                width: '100%', maxWidth: '400px', height: '300px', 
                borderRadius: '12px', marginBottom: '20px', border: '1px solid #ddd',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}></div>

            <div style={{ width: '100%', maxWidth: '400px' }}>
                <select style={selectStyle} value={selectedSido} onChange={handleSidoChange}>
                    <option value="">시/도 선택</option>
                    {sidoList.map((item, idx) => (
                        <option key={idx} value={item.sido}>{item.sido}</option>
                    ))}
                </select>

                <select style={selectStyle} value={selectedSigungu} onChange={handleSigunguChange} disabled={!selectedSido}>
                    <option value="">시/군/구 선택</option>
                    {sigunguList.map((item, idx) => (
                        <option key={idx} value={item.sigungu}>{item.sigungu}</option>
                    ))}
                </select>

                <select style={selectStyle} value={selectedLocationId || ''} onChange={handleDongChange} disabled={!selectedSigungu}>
                    <option value="">읍/면/동 선택</option>
                    {dongList.map((item) => (
                        <option key={item.locationId} value={item.locationId}>
                            {item.eupmyeondong}
                        </option>
                    ))}
                </select>

                <button 
                    onClick={handleSubmit} 
                    disabled={!selectedLocationId}
                    style={{
                        width: '100%', marginTop: '20px', padding: '18px',
                        backgroundColor: selectedLocationId ? '#FF6F0F' : '#ccc',
                        color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '18px', fontWeight: 'bold', cursor: selectedLocationId ? 'pointer' : 'not-allowed',
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