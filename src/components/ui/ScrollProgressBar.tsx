// src/components/ui/ScrollProgressBar.tsx — alimam variant
"use client";

import { useEffect, useState } from "react";

interface ScrollProgressBarProps {
  height?: number;
  zIndex?: number;
}

export default function ScrollProgressBar({ height = 2, zIndex = 100 }: ScrollProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setProgress(pct);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", top: 0, left: 0, right: 0, height: `${height}px`, zIndex, pointerEvents: "none" }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          // Maroon → Cream gradient (Al Imam brand colors)
          background: "linear-gradient(90deg, var(--color-primary-600, #800000) 0%, var(--color-secondary-300, #f5e6d0) 100%)",
          transition: "width 0.1s linear",
          borderRadius: "0 999px 999px 0",
        }}
      />
    </div>
  );
}
