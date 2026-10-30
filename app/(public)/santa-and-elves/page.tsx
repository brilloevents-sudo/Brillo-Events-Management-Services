import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/funnel/seo-landing-template";

export const metadata: Metadata = {
  title: "Santa and Elves Package Philippines | Christmas Entertainment | Brillo Events",
  description:
    "Book our complete Santa & Two Elves package (₱32,000 starting rate) for lively mall activations, corporate family days, hotel celebrations, and private Christmas parties.",
  keywords: [
    "Santa and Elves Package Philippines",
    "Hire Santa and Elves Manila",
    "Christmas Character Performers Philippines",
    "Christmas Party Entertainment Manila",
  ],
};

export default function SantaAndElvesPage() {
  return (
    <SeoLandingTemplate
      badge="Complete Holiday Trio • 1 Santa + 2 Elves"
      headline="Santa & Two Elves — Complete Christmas Character Package"
      subheadline="Bring vibrant color, festive choreography, and interactive holiday energy to your mall activation, hotel celebration, or family Christmas party."
      heroImage="/talents/Perry/perry_photo_1.jpg"
      heroImageAlt="Santa and Christmas Elves Package by Brillo Events"
      primaryCtaLabel="Book Santa & Two Elves (₱32,000)"
      primaryCtaHref="/request-quote?tier=SANTA_AND_ELVES"
      highlightTier="SANTA_AND_ELVES"
      introHeading="Triple the Festive Energy for High-Impact Celebrations"
      introParagraphs={[
        "When your event calls for lively crowd engagement, cheerful gift assistance, and colorful group photographs, pairing Santa Claus with two costumed Christmas Elves transforms the entire room.",
        "Our Santa & Two Elves package is a favorite for shopping mall activations, hotel kids' clubs, corporate family days, and grand private village celebrations.",
      ]}
      featuresHeading="What's Included in the Santa & Two Elves Experience"
      features={[
        {
          title: "One Santa + Two Christmas Elves",
          description:
            "A coordinated three-performer holiday ensemble dressed in festive theatrical attire.",
        },
        {
          title: "Interactive Crowd & Gift Assistance",
          description:
            "Elves help welcome shy children, hand out gifts smoothly, and keep photo queues cheerful and moving.",
        },
        {
          title: "Transparent ₱32,000 Starting Package",
          description:
            "Includes a minimum 3-hour appearance window, with additional hours available at +₱3,000 per hour.",
        },
      ]}
      faqs={[
        {
          question: "What is the starting rate for the Santa & Two Elves package?",
          answer:
            "The Santa & Two Elves package starts at ₱32,000 for a minimum 3-hour booking, with additional hours at +₱3,000 per hour.",
        },
        {
          question: "Is this package suitable for private parties as well as malls?",
          answer:
            "Absolutely. Families hosting large Christmas reunions, clubhouse celebrations, or children's holiday parties love the extra energy and interaction the two Elves bring.",
        },
      ]}
    />
  );
}
