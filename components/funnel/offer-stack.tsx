"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Zap, Sparkles, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface OfferStackProps {
  onOpenBooking: () => void;
}

export function OfferStack({ onOpenBooking }: OfferStackProps) {
  const stackItems = [
    {
      title: "Authenticated Real-Beard Santa Claus Performer",
      desc: "Zero synthetic fake beards. Immersive character portrayal, photo-ready natural beard, trained vocal presence for high-impact mall atriums.",
      value: "₱25,000",
    },
    {
      title: "Dedicated On-Site Production Assistant (PA)",
      desc: "Full handler coordination: Santa hydration, dressing room security, line pacing, crowd safety, and direct liaison with mall event operations.",
      value: "₱6,000",
    },
    {
      title: "Custom Tailored Velour Wardrobe & Authenticated Props",
      desc: "Dry-cleaned deep-crimson suit, white fur trim, gold-buckle belt, polished boots, and bell accessories ready for corporate camera flash.",
      value: "₱5,000",
    },
    {
      title: "Institutional Ingress & Security Clearance Protocol",
      desc: "Advance mall permit compliance, loading dock call-time alignment, and backstage protocol handled by Brillo Events dispatchers.",
      value: "₱4,000",
    },
    {
      title: "Commercial Contract Certainty & 24h Soft Hold Protection",
      desc: "Binding SM / Ayala framework booking agreements, official BIR invoices, and 24-hour soft holds preventing calendar collisions.",
      value: "₱5,000",
    },
  ];

  return (
    <section className="py-20 bg-[#09090B] relative overflow-hidden" id="offer-stack">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E11D48]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Complete Corporate Activation Stack</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-headline font-black text-white tracking-tight leading-tight">
            Everything Required For A Flawless Q4 Launch In One Guaranteed Bundle
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            We don’t just supply a performer—we deliver an end-to-end commercial operations pipeline trusted by the country’s biggest shopping centers.
          </p>
        </div>

        {/* 3D Stack Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Stack Deliverables (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {stackItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-zinc-600 transition flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-[#22C55E] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-headline font-bold text-white group-hover:text-[#D4AF37] transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-zinc-500 line-through block">
                    {item.value}
                  </span>
                  <span className="text-[10px] font-mono text-[#22C55E] uppercase font-bold">
                    INCLUDED
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: The Anchor Pricing Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-2xl bg-gradient-to-b from-[#18181B] via-[#121215] to-[#09090B] border-2 border-[#D4AF37]/50 shadow-2xl relative space-y-6">
              {/* Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#E11D48] text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-crimson-glow">
                Strict Q4 Date Scarcity
              </div>

              <div className="text-center pt-2">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">
                  Total Real-World Value
                </span>
                <div className="text-2xl font-mono text-zinc-500 line-through mt-0.5 font-bold">
                  ₱45,000.00
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#09090B] border border-[#27272A] text-center space-y-2">
                <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold block">
                  Corporate Mall Investment (Metro Manila)
                </span>
                <div className="text-4xl sm:text-5xl font-headline font-black text-white font-mono">
                  ₱18,000
                </div>
                <div className="text-[11px] text-zinc-400">
                  Full 4-Hour Turnkey Appearance • 50% Deposit (₱9,000) to Lock Date
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Provincial Surcharge:</span>
                  <span className="font-mono text-white font-bold">+30% (₱23,400 Total)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Peak Holiday (Dec 24/25):</span>
                  <span className="font-mono text-[#E11D48] font-bold">Custom Quote Range</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Calendar Hold Window:</span>
                  <span className="font-mono text-[#22C55E] font-bold">24-Hour Soft Hold</span>
                </div>
              </div>

              {/* High-Contrast Electric Green CTA */}
              <button
                onClick={onOpenBooking}
                className="w-full py-4 px-6 rounded-xl font-headline font-black text-sm uppercase tracking-wide text-zinc-950 bg-[#22C55E] hover:bg-[#16A34A] shadow-electric-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
              >
                <span>SECURE YOUR SANTA SLOT</span>
                <ArrowRight className="w-4 h-4 text-zinc-950 font-bold" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-zinc-500 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Zero Risk: 24-Hour Temporary Hold Before Binding Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
