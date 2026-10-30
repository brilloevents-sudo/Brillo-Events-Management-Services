import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/funnel/seo-landing-template";

export const metadata: Metadata = {
  title: "Real Beard Santa for Hire Philippines | Authentic Santa Claus | Brillo Events",
  description:
    "Hire an authentic real-beard Santa Claus in Metro Manila and across the Philippines. Professionally managed Christmas appearances for malls, luxury hotels, brands, and private events.",
  keywords: [
    "Real Beard Santa Philippines",
    "Real Beard Santa for Hire Manila",
    "Authentic Santa Claus Philippines",
    "Hire Santa Claus Manila",
    "Brillo Events Santa",
  ],
};

export default function RealBeardSantaForHirePage() {
  return (
    <SeoLandingTemplate
      badge="Authentic Real-Beard Performers • Limited Talents"
      headline="Authentic Real-Beard Santa Claus for Hire in the Philippines"
      subheadline="Anyone can wear a red suit — creating the feeling of meeting the real Santa Claus takes natural presence, genuine warmth, and bespoke holiday styling."
      heroImage="/talents/Bob/bob_photo_1.png"
      heroImageAlt="Authentic Real-Beard Santa Claus Performer in Manila by Brillo Events"
      primaryCtaLabel="Book Real-Beard Santa"
      primaryCtaHref="/request-quote?tier=REAL_BEARD"
      highlightTier="REAL_BEARD"
      introHeading="Why Leading Malls, Hotels & Families Choose Real-Beard Santas"
      introParagraphs={[
        "For flagship Christmas launches, close-up photography, luxury hotel lobbies, and intimate family celebrations, guests notice every detail immediately. Our authentic real-beard Santa performers bring natural silver-white beards, expressive warmth, and effortless conversational charm.",
        "Brillo Events carefully selects and coordinates real-beard performers across Metro Manila and nationwide destinations so your celebration feels genuinely magical from Santa's grand entrance to the final family portrait.",
      ]}
      featuresHeading="What Sets Our Real-Beard Santa Experience Apart"
      features={[
        {
          title: "100% Natural Real Beards",
          description:
            "Unmatched visual authenticity for high-resolution brand campaigns, stage lighting, and up-close children's meet-and-greets.",
        },
        {
          title: "Warm, Engaging Character",
          description:
            "Selected for kindness, patience, and natural rapport with children, VIP executives, and multi-generational families.",
        },
        {
          title: "Dedicated Event Coordination",
          description:
            "Our team coordinates call times, holding room readiness, guest queue flow, and scheduled rest breaks.",
        },
      ]}
      galleryImages={[
        { src: "/talents/Bob/bob_photo_1.png", caption: "Santa Bob — Flagship Mall Appearance" },
        { src: "/talents/Cedric/cedric_photo_1.jpg", caption: "Santa Cedric — Classic Velvet Portrait" },
        { src: "/talents/Edwin/edwin_photo_1.jpg", caption: "Santa Edwin — Holiday Celebration" },
      ]}
      faqs={[
        {
          question: "How much does it cost to hire a real-beard Santa in Metro Manila?",
          answer:
            "Our Real-Beard Santa starts at ₱24,000 in Metro Manila and ₱26,000 for peak Holiday dates or Out-of-Town events, based on a minimum 3-hour booking (+₱3,000 per additional hour).",
        },
        {
          question: "How early should we reserve a real-beard Santa?",
          answer:
            "Because authentic real-beard performers in the Philippines are strictly limited, November tree-lighting weekends and December dates book out weeks in advance. Early inquiry is strongly encouraged.",
        },
        {
          question: "Can your real-beard Santas travel outside Metro Manila?",
          answer:
            "Yes. We coordinate provincial mall activations, resort celebrations, and regional Christmas launches nationwide. Travel and hotel accommodations are arranged separately.",
        },
      ]}
    />
  );
}
