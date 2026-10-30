import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/funnel/seo-landing-template";

export const metadata: Metadata = {
  title: "Private Christmas Party Santa Manila & Philippines | Brillo Events",
  description:
    "Bring the magic of Christmas home with a private visit from an authentic Real-Beard Santa, Classic Santa, or Santa & Elves for family gatherings in Manila.",
  keywords: [
    "Private Christmas Party Santa Manila",
    "Hire Santa for Home Visit Philippines",
    "Christmas Party Entertainment Manila",
    "Real Beard Santa Private Party",
  ],
};

export default function PrivateChristmasPartiesPage() {
  return (
    <SeoLandingTemplate
      badge="Private Residences, Clubhouses & Family Reunions"
      headline="Unforgettable Santa Visits for Private Christmas Parties"
      subheadline="Imagine the look on your children's faces when Santa Claus walks into your living room, calls them by name, and shares a magical Christmas moment."
      heroImage="/talents/Benito/benito_photo_1.jpg"
      heroImageAlt="Private Family Christmas Party Santa Visit in Manila"
      primaryCtaLabel="Inquire for Private Party"
      primaryCtaHref="/request-quote?type=private"
      highlightTier="ALL"
      introHeading="Give Your Family More Than a Photo — Give Them a Memory"
      introParagraphs={[
        "Private family gatherings deserve warmth, sincerity, and personal attention. Whether you are hosting an intimate dinner in Makati, BGC, Alabang, Quezon City, or a festive village clubhouse celebration, Brillo Events brings authentic holiday wonder right to your door.",
        "We coordinate discreet arrival cues with parents and hosts so gift distribution, storytelling, and family portraits unfold effortlessly.",
      ]}
      featuresHeading="Designed Around Meaningful Family Moments"
      features={[
        {
          title: "Personalized Gift Handover",
          description:
            "Coordinate gift bags in advance so Santa greets your children and guests personally during gift-giving.",
        },
        {
          title: "Heirloom Family Portraits",
          description:
            "Plenty of relaxed time for individual kids' photos, cousins' group shots, and multi-generational family portraits.",
        },
        {
          title: "Choice of 3 Festive Packages",
          description:
            "Select Real-Beard Santa (from ₱24,000), Classic Santa (from ₱15,000), or Santa & Two Elves (₱32,000) for a minimum 3-hour visit.",
        },
      ]}
      faqs={[
        {
          question: "Are December 24 and December 25 available for private home visits?",
          answer:
            "Yes, peak holiday dates are offered under our Holiday Rate (₱26,000 for Real-Beard Santa; ₱18,000 for Classic Santa; min 3 hours), subject to strict calendar availability.",
        },
        {
          question: "How do we secretly hand the gifts to Santa before he enters?",
          answer:
            "Our coordinator arranges arrival timing and phone cues with a designated family member so gifts can be handed off discreetly before Santa makes his grand entrance.",
        },
      ]}
    />
  );
}
