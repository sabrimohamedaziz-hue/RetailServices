"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Crystal cursor — a small prism ring that follows the pointer.
 * Disabled on touch devices and when reduced motion is requested.
 */
export function CrystalCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;
    setEnabled(true);

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const onDown = () => ring.classList.add("is-pressed");
    const onUp = () => ring.classList.remove("is-pressed");

    const loop = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      dot.style.transform = `translate(${tx - 4}px, ${ty - 4}px)`;
      ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="crystal-cursor-dot" aria-hidden />
      <div ref={ringRef} className="crystal-cursor-ring" aria-hidden />
    </>
  );
}