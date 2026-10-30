import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/funnel/seo-landing-template";

export const metadata: Metadata = {
  title: "Hotel Christmas Entertainment & Santa Appearances Philippines | Brillo Events",
  description:
    "Luxury Real-Beard Santa Claus appearances for five-star hotels, resorts, Christmas tree lightings, and festive brunch celebrations across the Philippines.",
  keywords: [
    "Hotel Christmas Entertainment Philippines",
    "Luxury Hotel Santa Claus Manila",
    "Resort Christmas Santa Appearance",
    "Real Beard Santa for Hotels",
  ],
};

export default function SantaForHotelsAndResortsPage() {
  return (
    <SeoLandingTemplate
      badge="Luxury Hospitality, Resorts & Festive Brunches"
      headline="Refined Santa Claus Experiences for Hotels & Resorts"
      subheadline="Complement your property's luxury holiday decor, lobby tree-lighting ceremony, and Christmas Eve or Christmas Day dining experiences with authentic Santa hospitality."
      heroImage="/talents/Edwin/edwin_photo_1.jpg"
      heroImageAlt="Luxury Hotel Santa Claus Appearance in the Philippines"
      primaryCtaLabel="Inquire for Hotel or Resort"
      primaryCtaHref="/request-quote?tier=REAL_BEARD"
      highlightTier="REAL_BEARD"
      introHeading="Hospitality-Grade Presence Worthy of Five-Star Venues"
      introParagraphs={[
        "In luxury hotels and destination resorts, guests interact with Santa up close — table by table during Christmas brunch, beside the grand lobby tree, and at VIP suite welcomes. Presence, grooming, warmth, and etiquette matter.",
        "Brillo Events supplies authentic real-beard Santa performers and festive ensembles across Metro Manila's premier hotel districts as well as island and highland resorts nationwide.",
      ]}
      featuresHeading="Curated for Hospitality & Guest Experience Teams"
      features={[
        {
          title: "Lobby Tree-Lighting Ceremonies",
          description:
            "Commanding, authentic visual presence alongside general managers, ambassadors, and holiday choirs.",
        },
        {
          title: "Festive Buffet & Brunch Table Visits",
          description:
            "Warm, gracious table-side greetings and family photo moments for Christmas Eve dinner and Christmas Day brunch.",
        },
        {
          title: "Destination Resort Readiness",
          description:
            "Available for out-of-town properties in Tagaytay, Clark, Cebu, Boracay, Bohol, Davao, and beyond (travel & lodging arranged separately).",
        },
      ]}
      faqs={[
        {
          question: "What are the rates for hotel appearances in Metro Manila vs. destination resorts?",
          answer:
            "Real-Beard Santa starts at ₱24,000 in Metro Manila and ₱26,000 for Peak Holiday or Out-of-Town resort bookings (minimum 3 hours, +₱3,000/extra hour). Flights, transfers, and hotel rooms for provincial resorts are arranged separately.",
        },
        {
          question: "Can we book multiple dates across November and December?",
          answer:
            "Yes. Many hotels book both their November tree-lighting launch and December 24–25 dining dates together to secure their preferred performer early.",
        },
      ]}
    />
  );
}
