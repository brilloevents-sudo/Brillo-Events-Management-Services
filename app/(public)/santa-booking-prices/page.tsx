import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/funnel/seo-landing-template";

export const metadata: Metadata = {
  title: "Santa Claus Booking Prices Philippines (2026 Rate Card) | Brillo Events",
  description:
    "View transparent starting rates to hire a Real-Beard Santa (₱24,000), Classic Santa (₱15,000), or Santa & Two Elves (₱32,000) in Metro Manila and nationwide.",
  keywords: [
    "Santa Claus Booking Prices Philippines",
    "How much to hire Santa Claus Manila",
    "Real Beard Santa Rate Philippines",
    "Santa Rental Rates Manila",
  ],
};

export default function SantaBookingPricesPage() {
  return (
    <SeoLandingTemplate
      badge="Official 2026 Holiday Rate Card"
      headline="Transparent Santa Claus Booking Prices in the Philippines"
      subheadline="Plan your mall launch, hotel celebration, corporate party, or family gathering with clear starting package rates before requesting your formal quotation."
      heroImage="/talents/Bob/bob_photo_2.jpg"
      heroImageAlt="Brillo Events Official Santa Claus Booking Rates Philippines"
      primaryCtaLabel="Calculate & Request Quotation"
      primaryCtaHref="/request-quote"
      highlightTier="ALL"
      introHeading="Clear, Honest Pricing Designed Around Your Event"
      introParagraphs={[
        "At Brillo Events, we publish clear starting rates so event planners, brand managers, and families can budget confidently. All appearances include a minimum 3-hour booking window, with additional hours available at +₱3,000 per hour.",
        "Real-Beard Santa starts at ₱24,000 in Metro Manila (₱26,000 for Holiday or Out-of-Town dates). Classic Santa starts at ₱15,000 in Metro Manila (₱18,000 for Holiday or Out-of-Town dates). Our complete Santa & Two Elves package starts at ₱32,000.",
      ]}
      featuresHeading="What Shapes Your Final Quotation"
      features={[
        {
          title: "Chosen Performer Experience",
          description:
            "Choose between our limited-roster Authentic Real-Beard Santas, festive Classic Santas, or our three-character Santa & Two Elves package.",
        },
        {
          title: "Date & Event Location",
          description:
            "Standard Metro Manila rates apply to NCR venues, while peak holiday dates and out-of-town provincial destinations carry holiday/provincial rates plus separate travel and lodging.",
        },
        {
          title: "Hours & Custom Requirements",
          description:
            "Every package covers 3 hours. Need longer coverage for all-day mall meet-and-greets or shoots? Add extra hours seamlessly at +₱3,000 per hour.",
        },
      ]}
      faqs={[
        {
          question: "Are there any hidden charges?",
          answer:
            "No. Your formal quotation clearly itemizes your 3-hour base package, any requested overtime hours (+₱3,000/hr), and—for provincial events outside Metro Manila—separate transportation and hotel accommodation requirements.",
        },
        {
          question: "What downpayment is required to lock our date?",
          answer:
            "Availability is confirmed upon booking with a signed Service Agreement and our standard 50% reservation downpayment.",
        },
        {
          question: "Can I compute my exact package online right now?",
          answer:
            "Yes! Click 'Calculate & Request Quotation' to use our interactive quotation calculator and submit your date directly to our coordination desk.",
        },
      ]}
    />
  );
}
