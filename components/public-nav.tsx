"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Calendar, ShieldCheck, Sparkles, Menu, X, PhoneCall } from "lucide-react";

export function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/corporate", label: "Corporate & Malls" },
    { href: "/private-events", label: "Private & Family" },
    { href: "/how-booking-works", label: "How Booking Works" },
    { href: "/availability", label: "Check Dates" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-obsidian-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-crimson-800 border border-crimson-600/50 flex items-center justify-center shadow-md shadow-crimson-900/30">
              <Sparkles className="w-5 h-5 text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">
                BRILLO EVENTS
              </span>
              <span className="text-xs text-gold-400 tracking-wider font-medium uppercase block">
                Santa Operations Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "text-gold-300 bg-obsidian-850 border border-gold-500/30"
                      : "text-slate-300 hover:text-white hover:bg-obsidian-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA & CRM Link */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded border border-slate-800 hover:border-slate-700 transition"
              title="Brillo Staff Access"
            >
              Staff CRM
            </Link>
            <Link
              href="/request-quote"
              className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-crimson-700 to-crimson-600 hover:from-crimson-600 hover:to-crimson-500 shadow-lg shadow-crimson-900/40 border border-crimson-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calendar className="w-4 h-4 mr-2 text-gold-300" />
              Request a Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-obsidian-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-obsidian-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-obsidian-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
            <Link
              href="/request-quote"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-lg font-semibold text-white bg-crimson-700 hover:bg-crimson-600"
            >
              Request a Quote
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs text-slate-400"
            >
              Staff Portal Access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
