import type { Metadata } from "next";
import { SeoLandingTemplate } from "@/components/funnel/seo-landing-template";

export const metadata: Metadata = {
  title: "Corporate Christmas Event Santa Philippines | Brillo Events",
  description:
    "Elevate corporate Christmas parties, employee family days, brand campaigns, and holiday shoots with authentic Santa Claus entertainment by Brillo Events.",
  keywords: [
    "Corporate Christmas Event Santa",
    "Christmas Party Entertainment Manila",
    "Santa for Brand Shoot Philippines",
    "Employee Family Day Santa Claus",
  ],
};

export default function SantaForCorporateEventsPage() {
  return (
    <SeoLandingTemplate
      badge="Corporate Events, Brand Campaigns & Family Days"
      headline="Professional Santa Entertainment for Corporate Celebrations & Brands"
      subheadline="Bring warmth, prestige, and festive excitement to your company's year-end gala, employee kids' Christmas party, or commercial holiday shoot."
      heroImage="/talents/Cedric/cedric_photo_1.jpg"
      heroImageAlt="Corporate Event Santa Claus Performer in Metro Manila"
      primaryCtaLabel="Request Corporate Quotation"
      primaryCtaHref="/request-quote?tier=REAL_BEARD"
      highlightTier="ALL"
      introHeading="Polished Holiday Execution for Companies & Creative Agencies"
      introParagraphs={[
        "Corporate organizers and creative directors need performers who are punctual, camera-ready, and effortless to work with on set or on stage. Brillo Events partners with corporate HR teams, events agencies, and production houses across Metro Manila and the Philippines.",
        "From surprise executive gift handovers and employee children's parties to commercial photo and video productions, our Santa experiences elevate your brand's Christmas story.",
      ]}
      featuresHeading="Tailored for Corporate & Agency Standards"
      features={[
        {
          title: "Employee Kids' Parties & Family Days",
          description:
            "Create heartwarming moments for employees and their children with organized gift distribution and family portraits.",
        },
        {
          title: "Commercial Photo & Video Shoots",
          description:
            "Authentic real-beard Santa performers ideal for holiday TVCs, social media campaigns, and print lookbooks.",
        },
        {
          title: "Clear Quotations & Agreements",
          description:
            "Straightforward corporate quotations, formal service agreements, and dedicated scheduling support.",
        },
      ]}
      faqs={[
        {
          question: "Can we book a Santa for a commercial brand shoot or studio campaign?",
          answer:
            "Yes. Both our Real-Beard Santa (starting at ₱24,000 Metro Manila) and Classic Santa (starting at ₱15,000 Metro Manila) are available for minimum 3-hour photo and video production calls.",
        },
        {
          question: "How are corporate dates reserved?",
          answer:
            "Once availability is verified, we issue a formal quotation and service agreement. Dates are confirmed upon signed agreement and the standard 50% reservation downpayment.",
        },
      ]}
    />
  );
}
