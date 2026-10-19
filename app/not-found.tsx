"use client";

import { XenditPaymentPortal } from "@/components/funnel/xendit-payment-portal";

export default function NotFound() {
  // On static GitHub Pages (brilloevent.com), dynamic routes like /request-status/tok_...
  // are routed through 404.html. Render the Xendit Automatic GCash (0906 439 0028) Payment Portal directly!
  return <XenditPaymentPortal />;
}
