import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/funnel/seo-landing-template";

export const metadata: Metadata = {
  title: "Santa for Mall Events & Tree Lightings Philippines | Brillo Events",
  description:
    "Book professionally managed real-beard Santa Claus and Elf performers for shopping mall activations, Christmas tree lightings, and holiday meet-and-greets across the Philippines.",
  keywords: [
    "Santa for Mall Events Philippines",
    "Mall Santa Claus Manila",
    "Christmas Tree Lighting Santa Philippines",
    "Shopping Mall Holiday Entertainment",
  ],
};

export default function SantaForMallsPage() {
  return (
    <SeoLandingTemplate
      badge="Shopping Mall Activations & Tree Lightings"
      headline="Spectacular Santa Claus Experiences for Shopping Malls"
      subheadline="Drive foot traffic, create share-worthy atrium moments, and delight thousands of families with professionally coordinated mall Santa appearances."
      heroImage="/talents/Terry/terry_photo_1.jpg"
      heroImageAlt="Mall Christmas Tree Lighting and Santa Meet and Greet in the Philippines"
      primaryCtaLabel="Inquire for Mall Activation"
      primaryCtaHref="/request-quote?tier=REAL_BEARD&type=mall"
      highlightTier="REAL_BEARD"
      introHeading="Designed for High-Traffic Commercial Centers & Grand Launches"
      introParagraphs={[
        "A shopping mall's Christmas centerpiece sets the tone for the entire holiday retail season. Whether you are staging a grand atrium tree-lighting countdown, weekend family meet-and-greet sessions, or a multi-branch regional tour, Brillo Events delivers reliable, camera-ready holiday entertainment.",
        "Choose from our flagship Real-Beard Santa performers, Classic Santa appearances, or our lively Santa & Two Elves ensemble to match your mall's foot traffic and creative concept.",
      ]}
      featuresHeading="Built Around Smooth Mall Operations"
      features={[
        {
          title: "Grand Launch & Countdown Ready",
          description:
            "Experienced performers comfortable on stage alongside mall executives, choirs, hosts, and press photographers.",
        },
        {
          title: "Structured Meet-and-Greet Flow",
          description:
            "Coordinated appearance sets and rest intervals so every family in line receives a warm, unhurried photo moment.",
        },
        {
          title: "Metro Manila & Nationwide Tours",
          description:
            "Experienced with single-day launches and multi-weekend mall tours across NCR, Luzon, Visayas, and Mindanao.",
        },
      ]}
      galleryImages={[
        { src: "/talents/Terry/terry_photo_1.jpg", caption: "Atrium Holiday Spectacular" },
        { src: "/talents/Perry/perry_photo_1.jpg", caption: "Mall Throne Family Meet-and-Greet" },
        { src: "/talents/Bob/bob_photo_1.png", caption: "Grand Christmas Tree Launch" },
      ]}
      faqs={[
        {
          question: "What is the minimum booking duration for mall appearances?",
          answer:
            "All mall Santa packages have a minimum 3-hour booking window, with additional hours available at +₱3,000 per hour.",
        },
        {
          question: "Can we book Santa together with Christmas Elves for our mall atrium?",
          answer:
            "Yes! Our Santa & Two Elves package starts at ₱32,000 (minimum 3 hours) and is ideal for energetic mall parades, stage openings, and high-volume photo sessions.",
        },
        {
          question: "Do you handle multi-date or multi-mall bookings?",
          answer:
            "Yes. Send us your target schedule dates and mall branches, and our coordination desk will prepare a consolidated availability plan and formal quotation.",
        },
      ]}
    />
  );
}
