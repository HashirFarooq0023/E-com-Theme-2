'use client';

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Slides
  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch('/api/hero-slides');
        if (res.ok) {
          const data = await res.json();
          setSlides(data);
        }
      } catch (error) {
        console.error("Failed to load hero slides", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  // Auto-Rotate
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 Seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (loading) return <div className="hero-skeleton" />;
  if (slides.length === 0) return null;

  return (
    <div className="hero-carousel">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index} // Use index as key to ensure uniqueness
          className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image_url})` }}
        />
      ))}

      {/* Navigation (Only show if multiple slides) */}
      {slides.length > 1 && (
        <>
          <button className="hero-nav prev" onClick={goToPrev} aria-label="Previous Slide">
            <ChevronLeft size={32} />
          </button>
          <button className="hero-nav next" onClick={goToNext} aria-label="Next Slide">
            <ChevronRight size={32} />
          </button>

          {/* Indicators */}
          <div className="hero-indicators">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .hero-carousel {
          position: relative;
          width: 100%;
          height: 100vh; /* Full Screen */
          overflow: hidden;
          background: #000;
        }

        .hero-skeleton {
          width: 100%;
          height: 100vh;
          background: #111;
          animation: pulse 1.5s infinite;
        }

        .hero-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 1s ease-in-out;
          z-index: 1;
        }

        .hero-slide.active {
          opacity: 1;
          z-index: 2;
        }

        /* Navigation Buttons */
        .hero-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s;
        }

        .hero-nav:hover {
          background: #c4a775; /* Gold */
          color: black;
          border-color: #c4a775;
        }

        .hero-nav.prev { left: 30px; }
        .hero-nav.next { right: 30px; }

        /* Indicators */
        .hero-indicators {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 10;
        }

        .hero-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .hero-dot.active {
          background: #c4a775;
          transform: scale(1.2);
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.8; }
          100% { opacity: 0.6; }
        }

        @media (max-width: 768px) {
           .hero-carousel { height: 60vh; }
           .hero-nav { width: 40px; height: 40px; }
           .hero-nav.prev { left: 10px; }
           .hero-nav.next { right: 10px; }
        }
      `}</style>
    </div>
  );
}
