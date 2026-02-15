'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import TopNav from "./TopNav";
import WaterButton from "./WaterButton";
import {
  Star, ShoppingCart, ArrowLeft, Check, Minus, Plus,
  ShieldCheck, Truck, CreditCard, RotateCcw
} from "lucide-react";
import TopRatedCarousel from "./TopRatedCarousel";

import Toast from "./Toast";

export default function ProductDetails({ product, user, categories = [], products = [] }) {

  const [activeImage, setActiveImage] = useState(product.image);
  const [cartCount, setCartCount] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', id: 0 });

  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.length);
    }
  }, []);

  function addToCart() {
    if (typeof window === "undefined") return;

    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const index = existing.findIndex((item) => item.id === product.id);

    let next;
    if (index > -1) {
      next = [...existing];
      next[index].quantity = (next[index].quantity || 1) + quantity;
    } else {
      next = [...existing, { ...product, quantity: quantity }];
    }

    localStorage.setItem("cart", JSON.stringify(next));
    setCartCount(next.length);

    setIsAdded(true);
    setToast({ show: true, message: `Added ${product.name} to Cart`, id: Date.now() });
    setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className="page-wrapper">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        id={toast.id}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      <div className="main-container">
        <TopNav user={user} cartCount={cartCount} categories={categories} />

        {/* Breadcrumb */}
        <div className="breadcrumb-nav">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            <span>BACK TO COLLECTION</span>
          </Link>
        </div>

        <div className="product-layout">

          {/* LEFT: GALLERY (Sticky) */}
          <div className="gallery-column">
            <div className="hero-image-frame">
              <img
                src={activeImage || product.image || "https://placehold.co/600x400?text=No+Image"}
                alt={product.name}
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="thumbnail-strip">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: INFO (Open Layout) */}
          <div className="info-column">

            <div className="header-section">
              <span className="category-text">{product.category}</span>
              <h1 className="product-title">{product.name}</h1>

              <div className="rating-row">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(product.rating || 0) ? "#c4a775" : "none"}
                      stroke={i < Math.round(product.rating || 0) ? "none" : "#444"}
                    />
                  ))}
                </div>
                <span className="rating-count">{product.rating} (120 REVIEWS)</span>
              </div>
            </div>

            <div className="price-section">
              <span className="amount">PKR {Number(product.price).toLocaleString()}</span>
            </div>

            <div className="divider-line" />

            <div className="description-section">
              <h3>DESCRIPTION</h3>
              <p className="description-text">{product.description}</p>
            </div>

            {/* Highlights */}
            {product.highlights && (
              <div className="highlights-grid">
                {(Array.isArray(product.highlights)
                  ? product.highlights
                  : (product.highlights || "").split(',')
                ).map((item, idx) => (
                  <div key={idx} className="feature-item">
                    <Check size={14} className="check-icon" />
                    <span>{item.trim()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="divider-line" />

            {/* Action Area */}
            <div className="actions-section">
              <div className="quantity-stepper">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={14} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>

              <div className="cta-wrapper">
                <WaterButton
                  variant="primary"
                  onClick={addToCart}
                  className={`add-to-cart-btn ${isAdded ? 'success' : ''}`}
                >
                  {isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
                  <span>{isAdded ? "ADDED TO CART" : "ADD TO CART"}</span>
                </WaterButton>
              </div>
            </div>

            {/* TRUST BADGES ROW */}
            <div className="trust-grid">
              <div className="trust-item">
                <div className="icon-box"><Truck size={16} /></div>
                <span>Fast Delivery</span>
              </div>
              <div className="trust-item">
                <div className="icon-box"><ShieldCheck size={16} /></div>
                <span>Authentic</span>
              </div>
              <div className="trust-item">
                <div className="icon-box"><CreditCard size={16} /></div>
                <span>Secure Pay</span>
              </div>
              <div className="trust-item">
                <div className="icon-box"><RotateCcw size={16} /></div>
                <span>Returns</span>
              </div>
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="related-section">
          <div className="section-title">
            <h3>YOU MAY ALSO LIKE</h3>
          </div>
          <TopRatedCarousel products={products} />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* --- Layout & Background --- */
        .page-wrapper {
          min-height: 100vh;
          background: #0e0e0e; 
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }

        .main-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        /* --- Breadcrumbs --- */
        .breadcrumb-nav {
          margin: 40px 0;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #888;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .back-link:hover { color: #c4a775; }

        /* --- Layout Grid --- */
        .product-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: start;
        }

        /* --- LEFT: Gallery --- */
        .gallery-column {
          position: sticky;
          top: 40px;
        }

        .hero-image-frame {
          width: 100%;
          aspect-ratio: 1;
          background: #000;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0; /* Sharp corners */
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .hero-image-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .thumbnail-strip {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          justify-content: flex-start;
        }
        .thumb-btn {
          width: 80px;
          height: 80px;
          border-radius: 0; /* Sharp */
          border: 1px solid rgba(255,255,255,0.1);
          background: #000;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
          opacity: 0.6;
        }
        .thumb-btn:hover { opacity: 1; }
        .thumb-btn.active {
          border-color: #c4a775;
          opacity: 1;
        }
        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* --- RIGHT: Info --- */
        .info-column {
          padding-top: 0;
        }

        .category-text {
          color: #c4a775; /* Gold */
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 12px;
          display: block;
        }

        .product-title {
          font-family: var(--font, sans-serif);
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 16px 0;
          line-height: 1.1;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .stars { display: flex; gap: 4px; }
        .rating-count { 
            color: #666; 
            font-size: 0.7rem; 
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .price-section {
          margin-bottom: 24px;
        }
        .price-section .amount {
          font-family: var(--font-serif, serif);
          font-size: 2rem;
          font-weight: 400;
          color: #c4a775;
          letter-spacing: 1px;
        }

        /* --- Dividers --- */
        .divider-line {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          width: 100%;
          margin: 30px 0;
        }

        /* --- Description --- */
        .description-section h3 {
          font-size: 0.9rem;
          color: white;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .description-text {
          color: #a0a0a0;
          line-height: 1.8;
          font-size: 1rem;
          margin: 0;
          font-family: var(--font-serif, serif);
        }

        /* --- Highlights --- */
        .highlights-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(2, 1fr); 
          gap: 16px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ccc;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
        }
        .check-icon { color: #c4a775; flex-shrink: 0; }

        /* --- Actions --- */
        .actions-section {
          margin-top: 30px;
          display: flex;
          gap: 20px;
          height: 50px;
        }

        .quantity-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0; /* Square */
          padding: 0;
          width: 120px;
        }
        .quantity-stepper button {
          width: 40px;
          height: 100%;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .quantity-stepper button:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .qty-value {
          font-weight: 600;
          font-size: 1rem;
          font-family: var(--font-serif, serif);
        }

        .cta-wrapper { flex: 1; }
        .add-to-cart-btn {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 0 !important; /* Square */
          letter-spacing: 2px;
          text-transform: uppercase;
          background: #c4a775 !important;
          border-color: #c4a775 !important;
          color: #000 !important;
        }
        .add-to-cart-btn:hover {
           background: #fff !important;
           color: #000 !important;
           border-color: #fff !important;
        }
        .add-to-cart-btn.success {
          background: #fff !important;
          color: #000 !important;
          border-color: #fff !important;
          animation: pulseSuccess 0.3s ease-in-out;
        }

        @keyframes pulseSuccess {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        /* --- TRUST BADGES --- */
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 30px;
        }
        .trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
        }
        .icon-box {
          width: 40px;
          height: 40px;
          border-radius: 0; /* Square */
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c4a775;
        }
        .trust-item span {
          font-size: 0.65rem;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* --- Related Section --- */
        .related-section {
          margin-top: 100px;
          margin-bottom: 60px;
        }
        .section-title h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0 0 30px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-align: center;
        }

        /* --- Responsive --- */
        @media (max-width: 900px) {
          .product-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .gallery-column { position: static; }
          .product-title { font-size: 2rem; }
          .actions-section { flex-direction: column; height: auto; }
          .quantity-stepper { width: 100%; height: 50px; margin-bottom: 16px; }
          .add-to-cart-btn { height: 50px; }
        }
      `}} />
    </div>
  );
}