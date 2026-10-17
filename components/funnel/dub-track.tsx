"use client";

import React from "react";

interface DubTrackProps {
  children: React.ReactNode;
  event: string;
  targetUrl?: string;
  properties?: Record<string, any>;
  className?: string;
  onClick?: () => void;
}

/**
 * Dub.co Link Tracking & Telemetry Wrapper
 * Based on https://github.com/dubinc/dub
 * Intercepts clicks and emits custom conversion pixels before routing.
 */
export function DubTrack({
  children,
  event,
  targetUrl,
  properties = {},
  className = "",
  onClick,
}: DubTrackProps) {
  const handleClick = (e: React.MouseEvent) => {
    try {
      // 1. Dub.co / Meta Pixel / Google Analytics Telemetry
      if (typeof window !== "undefined") {
        const payload = {
          event,
          timestamp: new Date().toISOString(),
          url: targetUrl || window.location.href,
          ...properties,
        };

        // Push to dataLayer if available
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push(payload);

        // Native Beacon telemetry
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
          navigator.sendBeacon("/api/telemetry/track", blob);
        }

        console.log(`[Dub.co Tracking] Emitted event: ${event}`, payload);
      }
    } catch (err) {
      console.warn("[Dub.co Tracking] Telemetry dispatch failed silently:", err);
    }

    if (onClick) onClick();
  };

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  );
}
