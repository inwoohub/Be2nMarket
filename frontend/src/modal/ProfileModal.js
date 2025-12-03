// src/modal/Modal.js
import React from "react";
import "../css/Modal.css";

function Modal({ isOpen, onClose, title, children, footer }) {
    if (!isOpen) return null;

    const handleBackdropClick = () => {
        onClose && onClose();
    };

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="modal_backdrop" onClick={handleBackdropClick}>
            <div className="modal_container" onClick={handleContentClick}>
                {title && <h2 className="modal_title">{title}</h2>}

                <div className="modal_body">
                    {children}
                </div>

                {footer && (
                    <div className="modal_footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Modal;
