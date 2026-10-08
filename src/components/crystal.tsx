"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive 3D crystal — a glass cube with a glowing core and orbit rings.
 * Tilts toward the mouse with smooth lerped motion.
 */
export function Crystal() {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const loop = () => {
      curX += (targetX - curX) * 0.045;
      curY += (targetY - curY) * 0.045;
      if (tiltRef.current) {
        tiltRef.current.style.transform = `rotateY(${curX * 22}deg) rotateX(${-curY * 16}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="crystal-scene" aria-hidden>
      <div ref={tiltRef} className="crystal-tilt">
        <div className="crystal-cube">
          <div className="crystal-face crystal-front" />
          <div className="crystal-face crystal-back" />
          <div className="crystal-face crystal-right" />
          <div className="crystal-face crystal-left" />
          <div className="crystal-face crystal-top" />
          <div className="crystal-face crystal-bottom" />
          <div className="crystal-core" />
        </div>
        <div className="crystal-ring crystal-ring-1" />
        <div className="crystal-ring crystal-ring-2" />
        <div className="crystal-glow" />
      </div>
    </div>
  );
}
