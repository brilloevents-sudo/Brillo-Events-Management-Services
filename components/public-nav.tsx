"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Calendar, Sparkles, Menu, X, Phone, LogIn, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth-context";

export function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/#experiences", label: "Santa Experiences" },
    { href: "/#packages", label: "Packages & Pricing" },
    { href: "/#roster", label: "Our Santas" },
    { href: "/#events", label: "Events" },
    { href: "/#faq", label: "FAQs" },
    { href: "/availability", label: "Check Dates" },
  ];

  const portalHref = !user
    ? "/client-login"
    : user.role === "CLIENT"
    ? "/portal"
    : "/admin";
  const portalLabel = !user
    ? "Client Portal"
    : user.role === "CLIENT"
    ? "My Portal"
    : user.role === "CREATOR"
    ? "Creator Hub"
    : "Admin Hub";

  return (
    <header className="sticky top-0 z-50 bg-[#211619]/95 backdrop-blur-md border-b border-[#D6B36A]/25 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo (Cinzel) */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A61932] to-[#780D22] border border-[#D6B36A]/60 flex items-center justify-center shadow-gold-glow">
              <Sparkles className="w-5 h-5 text-[#D6B36A] group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <span className="font-brand text-lg sm:text-xl font-bold tracking-[0.08em] text-[#FFF8F0] block">
                BRILLO EVENTS
              </span>
              <span className="text-[10px] text-[#D6B36A] tracking-[0.18em] font-semibold uppercase block">
                Christmas Experiences
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-[13px] font-medium tracking-wide transition-colors ${
                    active
                      ? "text-[#D6B36A] bg-[#780D22]/40 border border-[#D6B36A]/35"
                      : "text-[#FFF8F0]/85 hover:text-[#D6B36A] hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs & Protected Login Link */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="tel:09278872343"
              className="hidden lg:inline-flex items-center space-x-1.5 text-[12px] font-semibold text-[#D6B36A] hover:text-[#FFF8F0] transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0927 887 2343</span>
            </a>

            <Link
              href={portalHref}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#FFF8F0]/90 hover:text-[#D6B36A] px-3.5 py-2 rounded-xl border border-[#D6B36A]/35 hover:border-[#D6B36A] bg-white/5 transition"
            >
              {!user ? (
                <LogIn className="w-3.5 h-3.5 text-[#D6B36A]" />
              ) : user.role === "CLIENT" ? (
                <User className="w-3.5 h-3.5 text-[#D6B36A]" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6B36A]" />
              )}
              <span>{portalLabel}</span>
            </Link>

            <Link
              href="/#inquiry-form"
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide text-[#FFF8F0] bg-gradient-to-r from-[#A61932] to-[#B82038] hover:from-[#B82038] hover:to-[#A61932] border border-[#D6B36A]/50 shadow-crimson-glow transition transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 mr-2 text-[#D6B36A]" />
              Book Your Santa
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#FFF8F0] hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#211619] border-b border-[#D6B36A]/30 px-4 pt-3 pb-6 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#FFF8F0] hover:bg-[#780D22]/50 hover:text-[#D6B36A]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col space-y-2.5">
            <Link
              href="/#inquiry-form"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl font-semibold text-sm text-[#FFF8F0] bg-gradient-to-r from-[#A61932] to-[#B82038] border border-[#D6B36A]/50"
            >
              Book Your Santa Experience
            </Link>
            <Link
              href="/request-quote"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl font-medium text-xs text-[#D6B36A] border border-[#D6B36A]/35"
            >
              Open Full Quotation Calculator
            </Link>
            <Link
              href={portalHref}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-[#FFF8F0] bg-white/5 border border-white/15"
            >
              {portalLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
