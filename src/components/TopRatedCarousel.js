'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export default function TopRatedCarousel({ products = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Filter products with rating = 5
  const topRatedProducts = products.filter(p => Number(p.rating) === 5);

  // Auto-rotate carousel
  useEffect(() => {
    if (topRatedProducts.length <= 1 || isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topRatedProducts.length);
    }, 4000); // Rotate every 4 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [topRatedProducts.length, isPaused]);

  // Handle manual navigation
  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000); // Resume auto-rotation after 5 seconds
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + topRatedProducts.length) % topRatedProducts.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % topRatedProducts.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  if (topRatedProducts.length === 0) {
    return null; // Don't render if no top-rated products
  }

  return (
    <div className="top-rated-carousel">
      <div className="carousel-header">
        <div>
          <h2>Top Rated Collection</h2>
        </div>
        <div className="carousel-indicators">
          {topRatedProducts.map((_, idx) => (
            <button
              key={idx}
              className={`indicator ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="carousel-container">
        <button
          className="carousel-nav prev"
          onClick={goToPrev}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <div className="carousel-track" style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}>
          {topRatedProducts.map((product, idx) => (
            <div key={product.id} className="carousel-slide">
              <Link
                href={`/products/${product.id}`}
                className="product-tile"
              >
                <div className="tile-image">
                  <img src={product.image} alt={product.name} />
                  <div className="rating-badge">
                    <Star size={11} fill="#000" color="#000" />
                    <span>{Number(product.rating || 0).toFixed(1)}</span>
                  </div>
                </div>

                <div className="tile-content">
                  <span className="tile-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="tile-description">
                    {product.description ? product.description.substring(0, 120) + "..." : "Experience the epitome of luxury and performance."}
                  </p>
                  <div className="tile-footer">
                    <span className="tile-price">PKR {Number(product.price).toLocaleString()}</span>
                    {product.stock !== undefined && product.stock < 10 && (
                      <span className="stock-badge">Limited Edition</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <button
          className="carousel-nav next"
          onClick={goToNext}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .top-rated-carousel {
          width: 100%;
          margin: 0;
          padding: 15px 0;
          background: #080808; 
          color: white;
          font-family: var(--font, sans-serif); 
        }

        /* --- Header Section --- */
        .carousel-header {
          max-width: 1200px;
          margin: 0 auto 20px;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .carousel-header h2 {
          font-family: var(--font-serif, serif); /* Use global Playfair */
          font-size: 2.2rem;
          color: c4a775; /* Gold */
          letter-spacing: 1px;
          margin: 0;
          text-transform: uppercase;
        }

        .carousel-indicators {
          display: flex;
          gap: 12px;
        }

        .carousel-indicators .indicator {
          width: 40px;
          height: 3px;
          border-radius: 0;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          cursor: pointer;
          transition: all 0.4s ease;
        }

        .carousel-indicators .indicator.active {
          background: #c4a775;
          width: 60px;
        }

        /* --- Carousel Structure --- */
        .carousel-container {
          position: relative;
          max-width: 1920px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 0;
          background: transparent;
          border: none;
        }

        .carousel-track {
          display: flex;
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .carousel-slide {
          min-width: 100%;
          padding: 0 20px;
        }

        /* --- Product Card (Hero Style) --- */
        .product-tile {
          display: grid;
          grid-template-columns: 1fr 1.2fr; /* Layout: Image left, Text right */
          gap: 20px;
          padding: 25px;
          text-decoration: none;
          color: inherit;
          align-items: center;
          min-height: 500px;
        }

        /* --- Image Styling --- */
        .tile-image {
          position: relative;
          width: 100%;
          aspect-ratio: 1; /* Square for watch-like focus */
          border-radius: 0;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tile-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));
          transition: transform 0.5s ease;
        }

        .product-tile:hover .tile-image img {
          transform: scale(1.05);
        }

        .rating-badge {
          position: absolute;
          top: 0; left: 0;
          background: #b88b3dff; /* Gold Badge */
          color: #000;
          padding: 6px 6px;
          border-radius: 0;
          font-family: var(--font, sans-serif);
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
        }

        /* --- Content Styling --- */
        .tile-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .tile-category {
          color: #c4a775;
          font-size: 0.9rem;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 20px;
          background: transparent;
          padding: 0;
          width: auto;
          font-weight: 700;
        }

        .tile-content h3 {
          font-family: var(--font-serif, serif);
          font-size: 3.5rem;
          line-height: 1.1;
          margin: 0 0 24px 0;
          color: white;
          font-weight: 400;
        }

        .tile-description {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #a3a3a3;
          margin-bottom: 30px;
          font-weight: 300;
          max-width: 90%;
        }

        /* --- Footer & Price --- */
        .tile-footer {
          display: flex;
          align-items: center;
          gap: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 30px;
        }

        .tile-price {
          font-family: var(--font-serif, serif);
          font-size: 2.2rem;
          color: #fff;
          font-weight: 400;
        }

        .stock-badge {
          background: transparent;
          color: #c4a775;
          border: 1px solid #c4a775;
          padding: 8px 16px;
          border-radius: 0;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 2px;
        }

        /* --- Navigation Buttons --- */
        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #c4a775;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 20;
        }

        .carousel-nav:hover {
          background: #c4a775;
          color: black;
          border-color: #c4a775;
        }

        .carousel-nav.prev { left: 10px; }
        .carousel-nav.next { right: 10px; }

        /* --- Mobile Responsiveness --- */
        @media (max-width: 900px) {
          .product-tile {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 20px;
            padding: 15px;
            min-height: auto; /* Allow height to shrink */
          }

          .tile-image {
            max-width: 200px; /* Smaller image */
            margin: 0 auto;
            aspect-ratio: 16/9; /* Widescreen aspect for mobile if landscape, but square is safer. Let's stick to square but smaller. */
            aspect-ratio: 1;
          }

          .tile-content h3 {
            font-size: 1.5rem; /* Smaller product title */
            margin-bottom: 10px;
          }

          .tile-description {
            display: none; /* Hidden on mobile per request */
          }

          .tile-footer {
            justify-content: center;
            padding-top: 15px;
            gap: 15px;
          }
          
          .tile-price {
            font-size: 1.5rem;
          }

          .carousel-header {
            flex-direction: column;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .carousel-header h2 {
            font-size: 1.5rem; /* Much smaller header */
          }
        }

        @media (max-width: 480px) {
          /* Further reduction for small phones */
          .product-tile {
            padding: 10px 0;
          }
          .tile-image {
            max-width: 160px;
          }
           .carousel-header h2 {
            font-size: 1.2rem;
          }
          .tile-content h3 {
             font-size: 1.2rem;
          }
        }

      `}} />
    </div>
  );
}