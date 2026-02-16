'use client';

export default function WaterButton({
  variant = "primary",
  block = false,
  className = "",
  children,
  ...props
}) {
  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
  }

  // Ensure "btn" class is always present
  const classes = `btn ${variant} ${block ? "block" : ""} ${className}`;

  return (
    <>
      <button
        {...props}
        className={classes}
        onMouseMove={handleMove}
      >
        {children}
      </button>

      {/* ✅ LUXURY THEME CSS INJECTION */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .btn {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          
          /* Luxury Shape & Type */
          border-radius: 0 !important; /* Sharp corners */
          padding: 14px 28px;
          font-family: var(--font, sans-serif);
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.85rem;
          text-align: center;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid transparent;
        }

        /* --- PRIMARY (Gold Filled) --- */
        .btn.primary {
          background: #c4a775; /* Gold */
          color: #000;
          border-color: #c4a775;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .btn.primary:hover {
          background: #fff;
          color: #000;
          border-color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .btn:active {
          transform: scale(0.95) translateY(0);
          transition: transform 0.1s;
        }

        /* --- GHOST (Outline) --- */
        .btn.ghost {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn.ghost:hover {
          border-color: #c4a775;
          color: #c4a775;
          background: rgba(196, 167, 117, 0.05);
        }

        /* --- BLOCK (Full Width) --- */
        .btn.block {
          width: 100%;
          display: flex;
        }

        /* --- THE "WATER" RIPPLE EFFECT --- */
        /* We use the ::before pseudo-element for the ripple */
        .btn::before {
          content: "";
          position: absolute;
          top: var(--y);
          left: var(--x);
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2); /* Subtle white ripple */
          transition: width 0.6s ease, height 0.6s ease, opacity 0.6s ease;
          pointer-events: none;
          opacity: 0;
        }

        .btn:active::before {
          width: 300px;
          height: 300px;
          opacity: 1;
          transition: 0s; /* Instant expansion on click */
        }
      `}} />
    </>
  );
}