"use client";

import React from "react";
import { Sparkles } from "lucide-react";

/**
 * Brillo Hub Liquid-Metallic Brand Emblem
 * Inspired by liquid-logo & shadergradient controlled brand polish.
 * Lightweight CSS + SVG specular liquid shimmer—zero impact on table/form FPS.
 */
export function BrilloLiquidEmblem() {
  return (
    <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-md border border-[#C68A12]/45 group">
      {/* Liquid Metallic Velvet + Champagne Shader Gradient Base */}
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
        style={{
          background:
            "conic-gradient(from 140deg at 50% 50%, #9B1B30 0deg, #7A1424 110deg, #C68A12 200deg, #5C0F1C 290deg, #9B1B30 360deg)",
        }}
      />
      {/* Specular Glass Highlight */}
      <div
        className="absolute inset-[1px] rounded-[10px]"
        style={{
          background:
            "radial-gradient(circle at 28% 24%, rgba(255, 246, 224, 0.34), rgba(155, 27, 48, 0.15) 55%, rgba(24, 16, 18, 0.72) 100%)",
        }}
      />
      <Sparkles className="relative z-10 w-4 h-4 text-[#F8E2A8] drop-shadow-sm" />
    </div>
  );
}
