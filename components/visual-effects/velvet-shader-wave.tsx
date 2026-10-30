"use client";

import React, { useEffect, useRef } from "react";

/**
 * Subtle Velvet-Crimson & Champagne-Gold Shader Wave
 * Mounted strictly on Public Hero / Auth Portal backgrounds (never on admin tables).
 * Respects prefers-reduced-motion automatically.
 */
export function VelvetShaderWave({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animId = 0;
    let t = 0;

    const renderFrame = () => {
      const w = (canvas.width = canvas.offsetWidth || 800);
      const h = (canvas.height = canvas.offsetHeight || 400);

      ctx.clearRect(0, 0, w, h);

      const g1 = ctx.createRadialGradient(
        w * (0.3 + 0.12 * Math.sin(t)),
        h * (0.35 + 0.1 * Math.cos(t * 0.8)),
        20,
        w * 0.35,
        h * 0.4,
        w * 0.65
      );
      g1.addColorStop(0, "rgba(155, 27, 48, 0.24)");
      g1.addColorStop(0.55, "rgba(198, 138, 18, 0.08)");
      g1.addColorStop(1, "rgba(9, 9, 11, 0)");

      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      if (!prefersReduced) {
        t += 0.012;
        animId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full opacity-80 ${className}`}
    />
  );
}
