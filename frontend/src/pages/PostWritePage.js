import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

import "../css/Index.css";
import "../css/MainPage.css";

function PostWritePage() {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState(1);
    const [price, setPrice] = useState('');
    const [content, setContent] = useState('');

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (images.length + files.length > 10) {
            alert("이미지는 최대 10장까지 첨부할 수 있습니다.");
            return;
        }

        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setImages(newImages);
        setPreviewUrls(newPreviews);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        const formData = new FormData();

        const postData = {
            title: title,
            content: content,
            price: price ? parseInt(price.replace(/,/g, '')) : 0,
            categoryId: parseInt(categoryId),
            locationId: 1111010100
        };

        formData.append("post", new Blob([JSON.stringify(postData)], { type: "application/json" }));

        images.forEach((file) => {
            formData.append("images", file);
        });

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                const postId = await response.json();
                alert("게시글이 등록되었습니다.");
                navigate(`/posts/${postId}`, { replace: true });
            } else {
                alert("게시글 등록에 실패했습니다.");
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div className="app-shell">
            <div className="sub-app-shell" style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#000000',
                height: '100vh',
                color: '#ffffff'
            }}>
                {/* 헤더 */}
                <div style={{
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 15px',
                    borderBottom: '1px solid #333'
                }}>
                    <span onClick={() => navigate(-1)} style={{ fontSize: '24px', cursor: 'pointer' }}>✕</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>중고거래 글쓰기</span>
                    <span onClick={handleSubmit} style={{ color: '#FF8A3D', fontWeight: 'bold', cursor: 'pointer' }}>완료</span>
                </div>

                {/* 입력 폼 영역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                    {/* 이미지 업로드 */}
                    <div style={{ display: 'flex', overflowX: 'auto', marginBottom: '20px' }}>
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                width: '70px', height: '70px', border: '1px solid #555', borderRadius: '5px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                marginRight: '10px', flexShrink: 0, cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>📷</span>
                            <span style={{ fontSize: '12px', color: '#888' }}>{images.length}/10</span>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />

                        {previewUrls.map((url, index) => (
                            <div key={index} style={{ position: 'relative', marginRight: '10px', flexShrink: 0 }}>
                                <img
                                    src={url}
                                    alt="preview"
                                    style={{ width: '70px', height: '70px', borderRadius: '5px', objectFit: 'cover' }}
                                />
                                <button
                                    onClick={() => handleRemoveImage(index)}
                                    style={{
                                        position: 'absolute', top: '-5px', right: '-5px',
                                        backgroundColor: 'black', color: 'white', border: 'none',
                                        borderRadius: '50%', width: '20px', height: '20px',
                                        fontSize: '12px', cursor: 'pointer'
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 제목 */}
                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="글 제목"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%', backgroundColor: 'transparent', border: 'none',
                                color: 'white', fontSize: '18px', outline: 'none'
                            }}
                        />
                    </div>

                    {/* 카테고리 */}
                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            style={{
                                width: '100%', backgroundColor: '#000000', border: 'none',
                                color: 'white', fontSize: '16px', outline: 'none'
                            }}
                        >
                            <option value="1">디지털기기</option>
                            <option value="2">가구/인테리어</option>
                            <option value="3">생활가전</option>
                            <option value="4">스포츠/레저</option>
                        </select>
                    </div>

                    {/* 가격 */}
                    <div style={{ borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', marginRight: '10px' }}>₩</span>
                        <input
                            type="number"
                            placeholder="가격 (선택사항)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            style={{
                                width: '100%', backgroundColor: 'transparent', border: 'none',
                                color: 'white', fontSize: '16px', outline: 'none'
                            }}
                        />
                    </div>

                    {/* 내용 */}
                    <div style={{ marginBottom: '15px' }}>
                        <textarea
                            placeholder="게시글 내용을 작성해주세요. (가품 및 판매금지품목은 게시가 제한될 수 있어요.)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{
                                width: '100%', height: '300px', backgroundColor: 'transparent', border: 'none',
                                color: 'white', fontSize: '16px', outline: 'none', resize: 'none'
                            }}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}

export default PostWritePage;
