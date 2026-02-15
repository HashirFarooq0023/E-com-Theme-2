'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import { Star, ShoppingBag } from "lucide-react";
import TopNav from "./TopNav";
import WaterButton from "./WaterButton";
import TopRatedCarousel from "./TopRatedCarousel";

import Toast from "./Toast";

export default function ProductFeed({ initialProducts, user }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category"); // Get category from URL

  const [products] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [toast, setToast] = useState({ show: false, message: '', id: 0 });

  // Cart State
  const [cartCount, setCartCount] = useState(0);

  // Derive unique categories
  const categories = [...new Set(products.map((p) => p.category))];

  // Filter products
  const visibleProducts = !selectedCategory
    ? products
    : products.filter((p) => p.category === selectedCategory);

  // 1. Load Cart on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      updateCartState(savedCart);
    }
  }, []);

  // Helper to calculate totals
  function updateCartState(cart) {
    setCartCount(cart.length);
  }

  // 2. Add to Cart Function
  function addToCart(e, product) {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window === "undefined") return;

    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const index = existing.findIndex((item) => item.id === product.id);

    let next;
    if (index > -1) {
      next = [...existing];
      next[index].quantity = (next[index].quantity || 1) + 1;
    } else {
      next = [...existing, { ...product, quantity: 1 }];
    }

    localStorage.setItem("cart", JSON.stringify(next));
    updateCartState(next);
    setToast({ show: true, message: "Added to Cart", id: Date.now() });
  }

  return (
    <div className="page-wrapper">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        id={toast.id}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      <main className="main-layout">
        <TopNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat === selectedCategory ? null : cat)}
          cartCount={cartCount}
          user={user}
        />

        {/* CAROUSEL TOP (Only for All Collection) */}
        {!selectedCategory && <TopRatedCarousel products={products} />}

        {/* PRODUCT GRID SECTION */}
        <section className="products-section">
          <div className="section-header">
            <div>
              <h2 className="logo-golden-wave">{selectedCategory ? selectedCategory : "The Collection"}</h2>
              <div className="header-line"></div>
            </div>
            <span className="count-pill">
              {visibleProducts.length} ITEMS
            </span>
          </div>

          <div className="product-grid">
            {visibleProducts.map((product, index) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className="card-link animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

                  {/* Image Area */}
                  <div className="tile-media">
                    <img src={product.image} alt={product.name} />

                    {/* Floating Badges */}
                    <div className="badges-overlay">

                      {product.stock !== undefined && product.stock < 10 && (
                        <span className="stock-badge">Low Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="tile-content">
                    <div className="tile-top">
                      <div className="name-row">
                        <h3>{product.name}</h3>
                      </div>
                      <div className="rating-row">
                        <div className="rating">
                          <Star size={15} fill="#c4a775" stroke="none" />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                      <div className="price-container">
                        <span className="amount">PKR {Number(product.price).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="tile-footer">
                      <div className="action-wrapper" style={{ width: '100%' }}>
                        <WaterButton
                          variant="ghost"
                          className="luxury-add-btn"
                          onClick={(e) => addToCart(e, product)}
                        >
                          <ShoppingBag size={12} />
                          <span className="btn-text">CART</span>
                        </WaterButton>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* CAROUSEL BOTTOM (Only for Specific Categories) */}
        {selectedCategory && (
          <div style={{ marginTop: '60px' }}>
            <div className="section-header" style={{ marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>You Might Also Like</h2>
                <div className="header-line"></div>
              </div>
            </div>
            <TopRatedCarousel products={products} />
          </div>
        )}
      </main>

      {/*  LUXURY THEME CSS INJECTION */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* --- Page Layout --- */
        .page-wrapper {
          min-height: 100vh;
          background: #0e0e0e; 
          color: #e2e8f0;
          padding: 0 1%; /* Reduced from 3% */
        }

        .main-layout {
          max-width: 98%; /* Wider layout for 5 cols */
          margin: 0 auto;
          padding: 0 12px 64px; /* Reduced side padding */
        }

        /* --- Section Header --- */
        .products-section {
          margin-top: 40px; /* Reduced top margin slightly */
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 15px;
        }

        .section-header h2 {
          font-family: var(--font, sans-serif);
          font-size: 1.8rem;
          color: white;
          margin: 0;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        /* Gold Underline for Title */
        .header-line {
          width: 50px;
          height: 2px;
          background: #c4a775;
          margin-top: 10px;
        }

        .count-pill {
          color: #64748b;
          font-size: 0.75rem;
          letter-spacing: 1px;
          font-weight: 600;
          text-transform: uppercase;
        }

        /* --- Grid Layout (5 Columns) --- */
        .product-grid {
          display: grid;
          /* UPDATED: Min 220px allows approx 5 items on typical 1400px+ screens */
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        /* --- The Luxury Card --- */
        .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .glass-panel:hover {
          transform: translateY(-5px);
          border-color: #c4a775; 
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 20px 50px rgba(0,0,0,0.8);
          transition: all 0.4s ease;
        }

        /* --- Image Area --- */
        .tile-media {
          position: relative;
          aspect-ratio: 1 / 1; 
          overflow: hidden;
          background: #000;
        }

        .tile-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
          opacity: 0.9;
        }

        .glass-panel:hover .tile-media img {
          transform: scale(1.05);
          opacity: 1;
        }

        .badges-overlay {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }



        .stock-badge {
          background: #7f1d1d; 
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 6px 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* --- Content Area --- */
        .tile-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
          gap: 12px;
          background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.2));
        }

        .tile-top h3 {
          font-family: var(--font, sans-serif);
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 6px 0;
          line-height: 1.4;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          
          /* Clamp text to 2 lines */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .rating-row {
          margin-bottom: 4px;
        }

        .rating {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #ced4dbff;
          font-size: 0.9rem;
          font-family: var(--font-serif, serif);
          font-style: italic;
        }

        /* --- Footer (Price & Button) --- */
        .tile-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .price-container .amount {
          font-family: var(--font, sans-serif); /* Changed to sans-serif */
          font-size: 0.95rem;
          font-weight: 500;
          color: #c4a775; 
          letter-spacing: 0.5px;
          white-space: nowrap; /* Prevent price wrapping */
        }

        /* Compact Button */
        .luxury-add-btn {
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 0 !important; 
          padding: 8px 12px;
          color: #fff;
          font-size: 0.75rem;
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          transition: all 0.3s ease;
          background: transparent;
        }
        
        .glass-panel:hover .luxury-add-btn {
          background: #c4a775;
          color: #000;
          border-color: #c4a775;
        }

        /* --- Mobile Adjustments --- */
        @media (max-width: 900px) {
          .product-grid {
            /* Fallback to 3 cols on tablet */
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
          }
        }
        
        @media (max-width: 600px) {
          .product-grid {
            /* 2 cols on standard mobile */
            grid-template-columns: repeat(2, 1fr); 
            gap: 15px;
          }
          
          .section-header h2 {
            font-size: 1.2rem; /* Reduced for mobile */
          }

          .count-pill {
             font-size: 0.6rem;
          }

          .main-layout {
            padding: 0 16px 40px;
          }
        }

        /* Essential for small devices (iPhone SE, etc) */
        @media (max-width: 370px) {
          .product-grid {
            grid-template-columns: 1fr; /* Force 1 column on tiny screens */
          }
        }
      `}} />
    </div>
  );
}