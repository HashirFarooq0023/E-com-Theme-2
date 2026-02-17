'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react'; // Import Icon

import Toast from './Toast';

export default function ChatWidget({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', id: 0 });
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- ADD TO CART LOGIC ---
  const handleAddToCart = (e, product) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    if (typeof window === "undefined") return;

    // 1. Get existing cart
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const index = existing.findIndex((item) => item.id === product.id);

    // 2. Update quantity or add new
    let next;
    if (index > -1) {
      next = [...existing];
      next[index].quantity = (next[index].quantity || 1) + 1;
    } else {
      next = [...existing, { ...product, quantity: 1 }];
    }

    // 3. Save back to storage
    localStorage.setItem("cart", JSON.stringify(next));

    // 4. Dispatch event so TopNav updates immediately
    window.dispatchEvent(new Event("storage"));

    // 5. Trigger Toast
    setToast({ show: true, message: `Added ${product.name} to Cart`, id: Date.now() });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, session_id: 'guest' })
      });

      const data = await res.json();

      // Main AI answer
      setMessages((prev) => [...prev, { role: 'bot', text: data.response }]);

      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }

      // If the AI specifically says to add to cart automatically (optional advanced feature)
      if (data.action === 'ADD_TO_CART' && data.payload) {

        // You could call handleAddToCart here programmatically if you wanted
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        isVisible={toast.show}
        id={toast.id}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
      <div
        className={`chat-widget-container ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '30%',
          minWidth: '340px',
          height: '100vh',
          margin: 0,
          borderRadius: 0,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          left: 'auto',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 3000,
          background: '#0e0e0e',
          borderLeft: '1px solid #c4a775',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.8)'
        }}
      >
        <div className="chat-window" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

          <div className="chat-header">
            <h3 className="chat-title">STORE ASSISTANT</h3>
            <button onClick={() => setIsOpen(false)} className="chat-close-button">✕</button>
          </div>

          <div className="chat-messages-area">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '40px', color: '#666', fontSize: '0.85rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                How may I assist you with our collection today?
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-message-row ${m.role}`}>
                <div className={`chat-message-bubble ${m.role}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="chat-typing-indicator">Typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Matched products section */}
          {products.length > 0 && (
            <div className="chat-products-area">
              <h4 className="chat-products-title">RECOMMENDED FOR YOU</h4>
              <div className="product-grid">
                {products.map((product) => (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="card-link animate-in"
                  >
                    <article className="glass-panel" style={{ position: 'relative', aspectRatio: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div className="tile-media">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className="tile-content">
                        <div className="name-row">
                          <h3>{product.name}</h3>
                        </div>
                        <div className="tile-footer">
                          <div className="price-container">
                            <span className="amount">
                              PKR {Number(product.price).toLocaleString()}
                            </span>
                          </div>
                          {/* ADD TO CART BUTTON */}
                          <button
                            className="chat-add-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <ShoppingBag size={10} /> ADD
                          </button>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about our collection..."
              className="chat-input-field"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="chat-send-button"
            >
              ➤
            </button>
          </div>

        </div>
      </div>

      {/* Luxury Theme Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* --- Header --- */
        .chat-header {
          padding: 24px;
          background: #111;
          border-bottom: 1px solid rgba(196, 167, 117, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-title {
          font-family: var(--font, sans-serif);
          font-size: 1rem;
          color: #c4a775; /* Gold */
          margin: 0;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .chat-close-button {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .chat-close-button:hover {
          color: #c4a775;
        }

        /* --- Messages Area --- */
        .chat-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #0e0e0e;
        }

        .chat-message-row {
          display: flex;
          width: 100%;
        }
        .chat-message-row.user { justify-content: flex-end; }
        .chat-message-row.bot { justify-content: flex-start; }

        .chat-message-bubble {
          max-width: 85%;
          padding: 14px 18px;
          border-radius: 0; /* Sharp Corners */
          font-size: 0.9rem;
          line-height: 1.5;
          font-family: var(--font-serif, serif);
        }

        .chat-message-bubble.user {
          background: #c4a775;
          color: #000;
          font-weight: 500;
        }

        .chat-message-bubble.bot {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #d1d5db;
        }

        .chat-typing-indicator {
          color: #c4a775;
          font-size: 0.75rem;
          font-style: italic;
          margin-left: 10px;
          font-family: var(--font-serif, serif);
        }

        /* --- Products Area --- */
        .chat-products-area {
          padding: 16px 24px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: #111;
          max-height: 35vh;
          overflow-y: auto;
        }

        .chat-products-title {
          font-family: var(--font, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 12px;
          color: #c4a775;
          text-transform: uppercase;
        }

        .chat-products-area .product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .chat-products-area .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .chat-products-area .glass-panel:hover {
          border-color: #c4a775;
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }

        .chat-products-area .tile-media {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
          background: #000;
        }
        .chat-products-area .tile-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .chat-products-area .tile-content {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 5;
          background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 80%, transparent);
          backdrop-filter: blur(4px);
        }

        .chat-products-area .name-row h3 {
          font-size: 0.75rem;
          font-weight: 600;
          margin: 0;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: var(--font, sans-serif);
        }
        
        /* Footer Row (Price + Button) */
        .chat-products-area .tile-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }

        .chat-products-area .amount {
          font-size: 0.8rem;
          font-weight: 500;
          color: #c4a775;
          font-family: var(--font-serif, serif);
        }

        /* NEW ADD BTN STYLE */
        .chat-add-btn {
          background: transparent;
          border: 1px solid #c4a775;
          color: #c4a775;
          font-size: 0.65rem;
          padding: 4px 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
          font-weight: 600;
        }
        .chat-add-btn:hover {
          background: #c4a775;
          color: #000;
        }

        /* --- Input Area --- */
        .chat-input-area {
          padding: 20px;
          background: #151515;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 0; 
        }

        .chat-input-field {
          flex: 1;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-right: none;
          border-radius: 0;
          padding: 12px 16px;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          font-family: var(--font-serif, serif);
        }

        .chat-input-field:focus {
          border-color: #c4a775;
        }

        .chat-send-button {
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-left: none;
          border-radius: 0;
          padding: 0;
          width: 50px;
          height: 47px; 
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #c4a775;
          transition: all 0.2s;
        }

        .chat-send-button:hover:not(:disabled) {
          background: #c4a775;
          color: #000;
          border-color: #c4a775;
        }
        
        .chat-send-button:disabled {
          color: #444;
          cursor: not-allowed;
        }

        .chat-messages-area::-webkit-scrollbar,
        .chat-products-area::-webkit-scrollbar {
          width: 4px;
        }
        .chat-messages-area::-webkit-scrollbar-thumb,
        .chat-products-area::-webkit-scrollbar-thumb {
          background: #333;
        }
      `}} />
    </>
  );
}