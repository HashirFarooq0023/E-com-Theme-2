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

  const classes = `btn ${variant} ${block ? "block" : ""} ${className}`;

  return (
    <button
      {...props}
      className={classes}
      onMouseMove={handleMove}
    >
      {children}
    </button>
  );
}


