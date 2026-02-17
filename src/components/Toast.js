'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, isVisible, onClose, id }) {
    const [show, setShow] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isVisible) {

            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, id]); // Trigger on 'id' change too

    if (!mounted) return null;
    if (!isVisible && !show) return null;

    return createPortal(
        <>
            <div className={`toast-notification ${show ? 'show' : ''}`}>
                <div className="toast-content">
                    <CheckCircle size={20} className="toast-icon" />
                    <span className="toast-message">{message}</span>
                </div>
            </div>

            <style jsx global>{`
                .toast-notification {
                    position: fixed;
                    top: -100px; /* Start above screen */
                    left: 24px; /* ALIGN TOP LEFT */
                    transform: none; /* NO CENTERING TRANSFORM */
                    background: rgba(14, 14, 14, 0.98);
                    border: 1px solid #c4a775;
                    padding: 16px 24px;
                    border-radius: 4px;
                    z-index: 2147483650 !important; /* Force on top with very high index */
                    transition: top 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                    width: auto;
                    min-width: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                }

                .toast-notification.show {
                    top: 24px !important; /* Slide down to 24px from top */
                }

                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .toast-message {
                    color: #fff;
                    font-family: var(--font, sans-serif);
                    font-size: 0.95rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .toast-icon {
                    color: #c4a775;
                    flex-shrink: 0;
                }

                @media (max-width: 600px) {
                    .toast-notification {
                        /* Force center on mobile for better UX */
                        left: 50%;
                        transform: translateX(-50%);
                        width: 90%;
                        min-width: auto;
                    }
                    
                    .toast-notification.show {
                        top: 10px !important;
                    }
                }
            `}</style>
        </>,
        document.body
    );
}
