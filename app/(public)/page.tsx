"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Play,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Clock,
  Star,
  Users2,
  Building2,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { WallOfWin } from "@/components/funnel/wall-of-win";
import { OfferStack } from "@/components/funnel/offer-stack";
import { BookingModal } from "@/components/funnel/booking-modal";
import { DubTrack } from "@/components/funnel/dub-track";

export default function B2BFunnelHomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="bg-[#09090B] text-zinc-100 min-h-screen selection:bg-[#22C55E] selection:text-black">
      {/* ========================================================
          SECTION A: THE B2B HERO (Split-Screen Layout)
         ======================================================== */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden border-b border-[#27272A]">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E11D48]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Side: Heavy, Authoritative Headline & Electric Green CTA (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Scarcity & Social Proof Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#18181B] border border-[#E11D48]/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-ping" />
                <span className="text-xs font-mono font-bold text-[#E11D48] tracking-wide uppercase">
                  Strict Q4 2026 Calendar Scarcity • Metro Manila &amp; Regional
                </span>
              </div>

              {/* Authoritative Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-black text-white tracking-tight leading-[1.08]">
                Don’t Let A Fake-Beard Amateur Ruin Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E11D48] via-rose-400 to-[#D4AF37]">
                  Q4 Mall Launch
                </span>
              </h1>

              {/* Body Copy */}
              <p className="text-base sm:text-lg text-zinc-300 font-sans leading-relaxed max-w-xl">
                Securing a premier shopping mall centerpiece requires authentic, vetted talent. We supply verified <strong>100% natural real-beard Santas</strong>, dedicated on-ground production handlers, and complete SM / Ayala contract compliance.
              </p>

              {/* Bullet Points */}
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-zinc-300 pt-2 font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>100% Natural Real Beards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Dedicated Production Assistant (PA)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>SM Supermalls Executed Contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>24-Hour Soft Hold Guarantee</span>
                </div>
              </div>

              {/* Primary Conversion CTA: Electric Green with Glow */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <DubTrack event="hero_cta_clicked" properties={{ section: "hero_primary" }}>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-headline font-black text-sm uppercase tracking-wider text-zinc-950 bg-[#22C55E] hover:bg-[#16A34A] shadow-electric-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
                  >
                    <span>SECURE YOUR SANTA SLOT</span>
                    <ArrowRight className="w-4 h-4 font-bold" />
                  </button>
                </DubTrack>

                <Link
                  href="#offer-stack"
                  className="px-6 py-4 rounded-xl font-headline font-bold text-xs uppercase tracking-wide text-zinc-300 bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-center transition"
                >
                  View Corporate Offer Stack ↓
                </Link>
              </div>

              {/* Trust Subtext */}
              <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Zero deposit required to place initial 24-hour calendar hold.</span>
              </div>
            </motion.div>

            {/* Right Side: 16:9 Cinematic Video Player Placeholder (The VSL) (5 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="relative aspect-video rounded-2xl bg-[#18181B] border-2 border-[#27272A] overflow-hidden shadow-2xl group">
                {/* Poster Image / Video Thumbnail */}
                <img
                  src="/talents/Bob/bob_photo_1.png"
                  alt="Brillo Events Real Beard Santa VSL"
                  className="w-full h-full object-cover object-top opacity-80 group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30" />

                {/* VSL Duration & Quality Badges */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#D4AF37] border border-zinc-700 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
                  <span>WATCH: 2026 Casting Reel (2:14)</span>
                </div>

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E11D48] text-white">
                  4K MASTER
                </div>

                {/* Play Button Trigger */}
                <button
                  onClick={() => setModalOpen(true)}
                  className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                  aria-label="Play Video Sales Letter"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-crimson-glow border border-white/20 transition-all group-hover:bg-[#BE123C]">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                  </div>
                </button>

                {/* Bottom Video Banner */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#09090B]/90 backdrop-blur-md border border-zinc-800 text-left">
                  <div className="text-xs font-headline font-bold text-white">
                    Mall Atrium Performance Standards
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    See real client crowd reactions at SM Megamall &amp; SM Clark
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION B: THE HERO PROOF (WALL OF WIN MARQUEE)
         ======================================================== */}
      <WallOfWin />

      {/* ========================================================
          SECTION C: THE OFFER STACK UI (₱45,000 -> ₱18,000)
         ======================================================== */}
      <OfferStack onOpenBooking={() => setModalOpen(true)} />

      {/* ========================================================
          FEATURED TALENT PORTFOLIO (REAL EXTRACTED PHOTOS)
         ======================================================== */}
      <section className="py-20 bg-[#09090B] border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
                Vetted Roster Directory
              </span>
              <h2 className="text-3xl sm:text-4xl font-headline font-black text-white mt-1">
                Authentic Real-Beard Santa Performers
              </h2>
            </div>
            <DubTrack event="view_all_santas_clicked">
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-mono font-bold text-[#22C55E] hover:underline flex items-center"
              >
                Inquire Specific Talent Availability →
              </button>
            </DubTrack>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Bob", code: "TAL-BOB", img: "/talents/Bob/bob_photo_1.png", exp: "8 Seasons • SM Flagship Headliner" },
              { name: "Cedric", code: "TAL-CEDRIC", img: "/talents/Cedric/cedric_photo_1.jpg", exp: "SM Pampanga & Clark Tour Lead" },
              { name: "Perry", code: "TAL-PERRY", img: "/talents/Perry/perry_photo_1.jpg", exp: "Luxury Hotel & Tree-Lighting Specialist" },
              { name: "Terry", code: "TAL-TERRY", img: "/talents/Terry/terry_photo_1.jpg", exp: "North Luzon Commercial Mall Resident" },
            ].map((santa, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden group hover:border-[#D4AF37]/50 transition shadow-lg flex flex-col justify-between"
              >
                <div className="h-60 overflow-hidden bg-black relative">
                  <img
                    src={santa.img}
                    alt={santa.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-[#D4AF37] border border-zinc-700">
                    Real Beard • {santa.code}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-headline font-bold text-white">Santa {santa.name}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{santa.exp}</p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full mt-2 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-headline font-bold text-white transition"
                  >
                    Select Santa {santa.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          BOTTOM CONVERSION BANNER
         ======================================================== */}
      <section className="py-16 bg-gradient-to-b from-[#09090B] to-[#18181B] border-t border-[#27272A] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/30 text-xs font-mono text-[#E11D48] font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Over 70% of Prime December Dates Are Currently Committed</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-headline font-black text-white tracking-tight">
            Lock Your Date With A Zero-Risk 24-Hour Soft Hold
          </h2>

          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Once submitted, your date is marked held in our operations system for 24 hours while your marketing and procurement teams review the formal agreement.
          </p>

          <div>
            <DubTrack event="bottom_cta_clicked">
              <button
                onClick={() => setModalOpen(true)}
                className="px-10 py-4 rounded-xl font-headline font-black text-base uppercase tracking-wider text-zinc-950 bg-[#22C55E] hover:bg-[#16A34A] shadow-electric-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center space-x-2"
              >
                <span>SECURE YOUR SANTA SLOT NOW</span>
                <ArrowRight className="w-5 h-5 font-bold" />
              </button>
            </DubTrack>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION D: THE BOOKING MODAL (Cal.com + Documenso)
         ======================================================== */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultLocation="METRO_MANILA"
      />
    </div>
  );
}
