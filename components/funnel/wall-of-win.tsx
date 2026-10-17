"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, ShieldCheck, Sparkles, Trophy } from "lucide-react";

const clientPartners = [
  { name: "SM SUPERMALLS", sub: "Flagship Mall Tours", tag: "28+ Venues" },
  { name: "AYALA MALLS", sub: "Atrium Activations", tag: "Annual Partner" },
  { name: "ROBINSONS MALLS", sub: "Holiday Launches", tag: "Corporate" },
  { name: "ENTCARS MARKETING", sub: "Brand Campaigns", tag: "Direct Partner" },
  { name: "SAGA PRODUCTIONS", sub: "High-Profile Broadcast", tag: "Agency" },
  { name: "PROFESSIONAL ORGANIZERS", sub: "Executive Galas", tag: "Enterprise" },
];

export function WallOfWin() {
  // Duplicate for seamless infinite loop
  const marqueeItems = [...clientPartners, ...clientPartners, ...clientPartners];

  return (
    <section className="py-12 bg-[#09090B] border-y border-[#27272A] relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-transparent to-[#09090B] z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>The Institutional Choice for Flagship Commercial Venues</span>
        </div>
        <h3 className="text-sm font-headline tracking-tight text-zinc-400 uppercase font-bold">
          Trusted by the Philippines&apos; Premier Mall Operators &amp; Production Houses
        </h3>
      </div>

      {/* Infinite Horizontal Marquee */}
      <div className="flex overflow-hidden select-none">
        <motion.div
          className="flex space-x-6 shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25,
          }}
        >
          {marqueeItems.map((partner, idx) => (
            <div
              key={idx}
              className="w-64 p-4 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between shrink-0 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {partner.tag}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#D4AF37] transition" />
              </div>

              <div className="mt-3">
                <div className="text-sm font-headline font-black tracking-wider text-zinc-200 group-hover:text-white transition">
                  {partner.name}
                </div>
                <div className="text-[11px] text-zinc-500 font-medium">
                  {partner.sub}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
