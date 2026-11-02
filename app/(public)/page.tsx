"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Phone,
  Mail,
  Globe,
  Calendar,
  MapPin,
  Copy,
  Check,
  Heart,
  Star,
  ShieldCheck,
  Pencil,
  Upload,
  X,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { SnowfallCanvas } from "@/components/visual-effects/snowfall-canvas";
import { BookingModal } from "@/components/funnel/booking-modal";
import {
  calculateSantaPackageQuote,
  SantaBeardTier,
  SantaRateTerritory,
  SantaEventActivityTag,
} from "@/lib/costing";

const DIFFERENTIATORS = [
  {
    num: "01",
    title: "Authentic Real-Beard Santa Performers",
    desc: "Our real-beard Santa experiences bring a more authentic and immersive Christmas atmosphere to your event.",
  },
  {
    num: "02",
    title: "Professional Event Presence",
    desc: "Our performers are selected to create warm, engaging, and memorable interactions with children, families, VIP guests, and corporate audiences.",
  },
  {
    num: "03",
    title: "More Than Photo Opportunities",
    desc: "From personalized Christmas greetings to genuine conversations and meet-and-greets, our Santas bring character and personality to every appearance.",
  },
  {
    num: "04",
    title: "Dedicated Event Coordination",
    desc: "We coordinate the appearance, event requirements, scheduling, and on-site arrangements to help your event run smoothly.",
  },
  {
    num: "05",
    title: "Experiences for Every Occasion",
    desc: "Whether you are planning a shopping mall activation, a luxury hotel celebration, a brand campaign, or a private Christmas party, we can help build the right Santa experience.",
  },
];

const SPECIALIZED_EVENTS = [
  {
    title: "Shopping Mall Christmas Launches",
    desc: "Make your Christmas tree lighting, grand opening, and holiday campaign more exciting with an unforgettable Santa appearance.",
    image: "/talents/Perry/perry_photo_1.jpg",
    link: "/santa-for-malls",
    activityTag: "CHRISTMAS_LAUNCH" as SantaEventActivityTag,
  },
  {
    title: "Hotels & Luxury Resorts",
    desc: "Give hotel guests a premium festive welcome with personalized Santa appearances and family experiences.",
    image: "/talents/Terry/terry_photo_1.jpg",
    link: "/santa-for-hotels-and-resorts",
    activityTag: "MEET_AND_GREET" as SantaEventActivityTag,
  },
  {
    title: "Corporate Christmas Parties",
    desc: "Create a festive experience for employees, executives, partners, and their families.",
    image: "/talents/Cedric/cedric_photo_1.jpg",
    link: "/santa-for-corporate-events",
    activityTag: "MEET_AND_GREET" as SantaEventActivityTag,
  },
  {
    title: "Brand Activations & Campaigns",
    desc: "Add a recognizable Christmas character to your promotional events, campaigns, and seasonal marketing activities.",
    image: "/talents/Edwin/edwin_photo_1.jpg",
    link: "/real-beard-santa-for-hire",
    activityTag: "CHRISTMAS_LAUNCH" as SantaEventActivityTag,
  },
  {
    title: "Private & Family Celebrations",
    desc: "Make your family's Christmas party more magical with Santa visits, photos, and personal greetings.",
    image: "/talents/Bob/bob_photo_3.jpg",
    link: "/private-christmas-parties",
    activityTag: "PRIVATE_PARTY" as SantaEventActivityTag,
  },
  {
    title: "Christmas Photo Shoots",
    desc: "Create beautiful seasonal photographs and memorable content with a professional Santa performer.",
    image: "/talents/Roy/roy_photo_1.jpg",
    link: "/real-beard-santa-for-hire",
    activityTag: "PHOTO_SHOOT" as SantaEventActivityTag,
  },
];

const DEFAULT_PACKAGE_TILES = [
  {
    id: "pkg_real_beard",
    title: "REAL-BEARD SANTA CLAUS",
    desc: "For clients who want the authentic Santa Claus experience. Ideal for luxury malls, hotels, corporate launches, brand activations, and exclusive private celebrations.",
    image: "/brand/package_real_beard_santa.jpg",
    badge: "Premium Experience",
    tier: "REAL_BEARD",
  },
  {
    id: "pkg_classic",
    title: "CLASSIC SANTA CLAUS",
    desc: "A festive Santa experience for mall activities, Christmas photo shoots, holiday celebrations, and private parties.",
    image: "/brand/package_classic_santa.jpg",
    badge: "Festive Favorite",
    tier: "FAKE_BEARD",
  },
  {
    id: "pkg_santa_elves",
    title: "SANTA & TWO ELVES",
    desc: "Bring more energy, color, and Christmas excitement to your celebration.",
    image: "/brand/package_santa_and_two_elves.jpg",
    badge: "Complete Character Package",
    tier: "SANTA_AND_ELVES",
  },
];

const PRESET_PHOTOS = [
  { name: "Real-Beard Santa (SM Urdaneta)", url: "/brand/package_real_beard_santa.jpg" },
  { name: "Classic Santa (SM Manila)", url: "/brand/package_classic_santa.jpg" },
  { name: "Santa & Two Elves", url: "/brand/package_santa_and_two_elves.jpg" },
  { name: "Santa Cedric (Portrait)", url: "/talents/Cedric/cedric_photo_1.jpg" },
  { name: "Santa Bob (Red Suit)", url: "/talents/Bob/bob_photo_1.jpg" },
  { name: "Santa Perry (Mall Stage)", url: "/talents/Perry/perry_photo_1.jpg" },
  { name: "Santa Terry (Tree Lighting)", url: "/talents/Terry/terry_photo_1.jpg" },
  { name: "Santa Edwin (Barong)", url: "/talents/Edwin/edwin_photo_1.jpg" },
  { name: "Santa Roy (Tall Velvet)", url: "/talents/Roy/roy_photo_1.jpg" },
  { name: "Santa Benito (Festive)", url: "/talents/Benito/benito_photo_1.jpg" },
];

const BOOKING_STEPS = [
  {
    step: "01",
    title: "Tell Us About Your Event",
    desc: "Submit your event date, location, expected audience, preferred Santa type, and event requirements.",
  },
  {
    step: "02",
    title: "Receive Your Customized Quotation",
    desc: "Our team reviews your requirements and recommends a suitable Santa experience and package.",
  },
  {
    step: "03",
    title: "Confirm Your Booking",
    desc: "Once availability and commercial terms are agreed upon, we prepare the booking agreement and payment instructions.",
  },
  {
    step: "04",
    title: "Event Coordination",
    desc: "We coordinate the performer's schedule, call time, event arrangements, and agreed inclusions.",
  },
  {
    step: "05",
    title: "Let the Christmas Magic Begin!",
    desc: "Your Santa arrives ready to create memorable experiences for your guests.",
  },
];

const FAQS = [
  {
    q: "1. Do you offer real-beard Santa performers?",
    a: "Yes. Brillo Events offers authentic real-beard Santa experiences for clients looking for a premium and immersive Christmas appearance.",
  },
  {
    q: "2. Do you offer Santa Claus with a fake beard?",
    a: "Yes. We also offer classic Santa performers for mall activities, photo shoots, Christmas parties, and other holiday celebrations.",
  },
  {
    q: "3. Can we book Santa for a mall Christmas launch?",
    a: "Absolutely. We cater to shopping malls, hotels, corporate events, and private celebrations.",
  },
  {
    q: "4. Is there a minimum booking duration?",
    a: "For meet-and-greet appearances, our stated minimum booking duration is three hours. Additional hours beyond 3 hours are billed at ₱3,000 per hour. Other event formats may be quoted separately.",
  },
  {
    q: "5. Do you accommodate provincial bookings?",
    a: "Yes. We accept inquiries for out-of-town appearances. Travel and accommodation requirements will be discussed before confirmation.",
  },
  {
    q: "6. Can we request a specific Santa performer?",
    a: "Yes, subject to availability and confirmation.",
  },
  {
    q: "7. Can Santa interact with children and guests?",
    a: "Yes. Santa appearances can include greeting guests, posing for photographs, interacting with children, and delivering personalized Christmas greetings, subject to the agreed event scope.",
  },
  {
    q: "8. How do we reserve our date?",
    a: "Send us your event details. Our team will check availability and provide a quotation and booking agreement.",
  },
  {
    q: "9. Is the booking confirmed immediately after inquiry?",
    a: "No. An inquiry is not a confirmed reservation. Your booking is confirmed once the required agreement and payment conditions are completed.",
  },
  {
    q: "10. Can we book Santa and two elves together?",
    a: "Yes. Our Santa + 2 Elves package is available at ₱32,000, subject to date availability and final confirmation of package inclusions.",
  },
];

export default function BrilloLuxuryLandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [publicTalents, setPublicTalents] = useState<any[]>([]);
  const [selectedTalent, setSelectedTalent] = useState<any | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Embedded Homepage Inquiry Form State (Connected Live to CRM, Calendar & Dashboard)
  const [eventTypeLabel, setEventTypeLabel] = useState(
    "Shopping Mall / Corporate Event"
  );
  const [preferredPackage, setPreferredPackage] =
    useState<SantaBeardTier>("REAL_BEARD");
  const [rateTerritory, setRateTerritory] =
    useState<SantaRateTerritory>("METRO_MANILA");
  const [durationChoice, setDurationChoice] = useState<string>("3");
  const [eventDate, setEventDate] = useState("");
  const [venueLocation, setVenueLocation] = useState("");
  const [preferredTalentId, setPreferredTalentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyOrg, setCompanyOrg] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [additionalReqs, setAdditionalReqs] = useState("");
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Customizable Tiles State (persisted in localStorage for easy user customization)
  const [eventTiles, setEventTiles] = useState(SPECIALIZED_EVENTS);
  const [packageTiles, setPackageTiles] = useState(DEFAULT_PACKAGE_TILES);

  const [tileEditorOpen, setTileEditorOpen] = useState(false);
  const [tileEditorType, setTileEditorType] = useState<"EVENT" | "PACKAGE">("EVENT");
  const [tileEditorIndex, setTileEditorIndex] = useState<number>(0);
  const [tileFormTitle, setTileFormTitle] = useState("");
  const [tileFormDesc, setTileFormDesc] = useState("");
  const [tileFormImage, setTileFormImage] = useState("");
  const [tileFormLink, setTileFormLink] = useState("");
  const [tileSavedToast, setTileSavedToast] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedEvents = localStorage.getItem("brillo_custom_tiles_v1");
        if (savedEvents) {
          setEventTiles(JSON.parse(savedEvents));
        }
        const savedPackages = localStorage.getItem("brillo_package_tiles_v1");
        if (savedPackages) {
          setPackageTiles(JSON.parse(savedPackages));
        }
      } catch {}
    }
  }, []);

  const openTileEditor = (type: "EVENT" | "PACKAGE", idx: number) => {
    setTileEditorType(type);
    setTileEditorIndex(idx);
    if (type === "EVENT") {
      const tile = eventTiles[idx] || SPECIALIZED_EVENTS[idx];
      setTileFormTitle(tile.title);
      setTileFormDesc(tile.desc);
      setTileFormImage(tile.image);
      setTileFormLink(tile.link || "");
    } else {
      const tile = packageTiles[idx] || DEFAULT_PACKAGE_TILES[idx];
      setTileFormTitle(tile.title);
      setTileFormDesc(tile.desc);
      setTileFormImage(tile.image);
      setTileFormLink("");
    }
    setTileEditorOpen(true);
  };

  const handleTileImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTileFormImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTile = () => {
    if (tileEditorType === "EVENT") {
      const updated = [...eventTiles];
      updated[tileEditorIndex] = {
        ...updated[tileEditorIndex],
        title: tileFormTitle,
        desc: tileFormDesc,
        image: tileFormImage,
        link: tileFormLink || updated[tileEditorIndex].link,
      };
      setEventTiles(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("brillo_custom_tiles_v1", JSON.stringify(updated));
      }
    } else {
      const updated = [...packageTiles];
      updated[tileEditorIndex] = {
        ...updated[tileEditorIndex],
        title: tileFormTitle,
        desc: tileFormDesc,
        image: tileFormImage,
      };
      setPackageTiles(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("brillo_package_tiles_v1", JSON.stringify(updated));
      }
    }
    setTileSavedToast(true);
    setTimeout(() => setTileSavedToast(false), 3000);
    setTileEditorOpen(false);
  };

  const handleResetTile = () => {
    if (tileEditorType === "EVENT") {
      const original = SPECIALIZED_EVENTS[tileEditorIndex];
      if (original) {
        setTileFormTitle(original.title);
        setTileFormDesc(original.desc);
        setTileFormImage(original.image);
        setTileFormLink(original.link);
      }
    } else {
      const original = DEFAULT_PACKAGE_TILES[tileEditorIndex];
      if (original) {
        setTileFormTitle(original.title);
        setTileFormDesc(original.desc);
        setTileFormImage(original.image);
      }
    }
  };

  const loadPublicTalents = useCallback(() => {
    fetch("/api/talents?publicOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.talents && Array.isArray(data.talents)) {
          setPublicTalents(
            data.talents.filter((t: any) => Boolean(t.approvedForPublicDisplay))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPublicTalents();
    const onFocus = () => loadPublicTalents();
    const onStorage = () => loadPublicTalents();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadPublicTalents]);

  const numericHours =
    durationChoice === "4" ? 4 : durationChoice === "5" ? 5 : 3;

  const inferredActivityTag: SantaEventActivityTag = eventTypeLabel
    .toLowerCase()
    .includes("private")
    ? "PRIVATE_PARTY"
    : eventTypeLabel.toLowerCase().includes("photo")
    ? "PHOTO_SHOOT"
    : eventTypeLabel.toLowerCase().includes("launch")
    ? "CHRISTMAS_LAUNCH"
    : "MEET_AND_GREET";

  const livePackageCalc = calculateSantaPackageQuote({
    santaTier: preferredPackage,
    rateTerritory,
    durationHours: numericHours,
    eventActivityTag: inferredActivityTag,
  });

  const scrollToInquiryWithPackage = (
    pkg: SantaBeardTier,
    talent: any | null = null
  ) => {
    setPreferredPackage(pkg);
    if (talent?.id) {
      setPreferredTalentId(talent.id);
    }
    const el = document.getElementById("inquiry-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEventDateChange = (val: string) => {
    setEventDate(val);
    if (val) {
      const d = new Date(val);
      if (
        d.getMonth() === 11 &&
        (d.getDate() === 24 ||
          d.getDate() === 25 ||
          d.getDate() === 30 ||
          d.getDate() === 31)
      ) {
        setRateTerritory("HOLIDAY");
      }
    }
  };

  const handleCopyInquiryText = () => {
    const summary = [
      "BRILLO EVENTS — SANTA QUOTATION INQUIRY",
      `Event Type: ${eventTypeLabel}`,
      `Preferred Package: ${livePackageCalc.santaTierLabel} (${livePackageCalc.rateTerritoryLabel})`,
      `Indicative Rate: ₱${livePackageCalc.totalQuotedRate.toLocaleString()}`,
      `Event Date: ${eventDate || "TBD"}`,
      `Venue / Location: ${venueLocation || "TBD"}`,
      `Duration: ${
        durationChoice === "discuss"
          ? "To be discussed"
          : `${numericHours} hours`
      }`,
      `Contact Name: ${fullName || "N/A"}`,
      `Company / Org: ${companyOrg || "N/A"}`,
      `Email: ${email || "N/A"}`,
      `Mobile: ${mobile || "N/A"}`,
      `Additional Notes: ${additionalReqs || "None"}`,
    ].join("\n");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittingForm(true);

    try {
      const cleanEmail = email.trim().replace(/@gmial\.com$/i, "@gmail.com");
      if (cleanEmail !== email) {
        setEmail(cleanEmail);
      }
      const endHour = (14 + numericHours) % 24;
      const res = await fetch("/api/public/request-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: fullName,
          companyName: companyOrg || venueLocation || fullName,
          email: cleanEmail,
          phone: mobile,
          bookingType:
            inferredActivityTag === "PRIVATE_PARTY" ? "PRIVATE" : "CORPORATE",
          eventName: `${venueLocation} — ${eventTypeLabel}`,
          eventDate,
          startTime: "14:00",
          endTime: `${String(endHour).padStart(2, "0")}:00`,
          durationHours: numericHours,
          venueName: venueLocation,
          mallOrVenue: venueLocation,
          city:
            rateTerritory === "OUT_OF_TOWN"
              ? "Out of Town / Provincial"
              : "Metro Manila",
          isProvincial: rateTerritory === "OUT_OF_TOWN",
          santaTier: preferredPackage,
          rateTerritory,
          eventActivityTag: inferredActivityTag,
          clientQuotedAmount: livePackageCalc.totalQuotedRate,
          specialRequests: `${eventTypeLabel}${
            durationChoice === "discuss" ? " (Custom Duration To Be Discussed)" : ""
          }${additionalReqs ? ` — ${additionalReqs}` : ""}`,
          talentPreferenceId: preferredTalentId || undefined,
          consentAgreed: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Unable to submit quotation inquiry.");
      }

      setSubmittedResult({
        ...data,
        venueLocation,
        eventDate,
        calc: livePackageCalc,
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to submit inquiry.");
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div className="bg-[#FFF8F0] text-[#211619] font-body overflow-x-hidden">
      {/* =====================================================================
          1. HERO SECTION — DEEP VELVET RED (#780D22) + SUBTLE SNOWFALL
         ===================================================================== */}
      <section className="relative bg-gradient-to-br from-[#780D22] via-[#660A1C] to-[#211619] text-[#FFF8F0] pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden border-b border-[#D6B36A]/35">
        <SnowfallCanvas />
        {/* Warm Champagne Gold Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#B82038]/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-[#D6B36A]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#211619]/60 border border-[#D6B36A]/50">
                <Sparkles className="w-3.5 h-3.5 text-[#D6B36A]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D6B36A]">
                  Premier Christmas Entertainment &amp; Experiences
                </span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-[68px] text-[#FFF8F0] leading-[1.04] tracking-tight">
                MORE THAN SANTA.{" "}
                <span className="text-[#D6B36A] italic font-semibold">
                  WE CREATE THE MOMENTS
                </span>{" "}
                THAT MAKE CHRISTMAS UNFORGETTABLE.
              </h1>

              <p className="text-lg sm:text-xl font-medium text-[#EAD39C] leading-snug">
                Authentic Santa Experiences for Malls, Hotels, Corporate Events &amp; Private Celebrations.
              </p>

              <p className="text-base sm:text-[17px] text-[#FFF8F0]/85 leading-relaxed max-w-2xl">
                Bring the magic of Christmas to life with professionally managed Santa Claus experiences, authentic real-beard performers, and memorable holiday entertainment. From spectacular Christmas launches to intimate family gatherings, Brillo Events makes every Santa appearance an experience worth remembering.
              </p>

              {/* Trust Highlights */}
              <div className="flex flex-wrap gap-3 pt-1">
                {[
                  "Real-Beard Santa Experiences",
                  "Professional Event Coordination",
                  "Metro Manila & Nationwide Inquiries",
                ].map((pill) => (
                  <div
                    key={pill}
                    className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/5 border border-[#D6B36A]/35 text-[12px] font-medium text-[#FFF8F0]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D6B36A] shrink-0" />
                    <span>{pill}</span>
                  </div>
                ))}
              </div>

              {/* Dual Hero CTAs */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="#inquiry-form"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#A61932] to-[#B82038] hover:from-[#B82038] hover:to-[#A61932] text-[#FFF8F0] border border-[#D6B36A] font-semibold text-[14px] uppercase tracking-[0.08em] shadow-gold-glow transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span>Book Your Santa Experience</span>
                  <ArrowRight className="w-4 h-4 text-[#D6B36A]" />
                </a>

                <a
                  href="#packages"
                  className="px-7 py-4 rounded-xl bg-[#211619]/65 hover:bg-[#211619] text-[#D6B36A] border border-[#D6B36A]/50 font-semibold text-[14px] uppercase tracking-[0.08em] text-center transition"
                >
                  View Our Santa Packages
                </a>
              </div>

              <p className="text-[12px] text-[#EAD39C]/80 tracking-wide">
                ✦ Limited holiday dates. Availability is confirmed upon booking.
              </p>
            </motion.div>

            {/* Hero Portrait Showcase (5 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-3xl p-2 bg-gradient-to-b from-[#D6B36A] via-[#D6B36A]/40 to-[#780D22] shadow-2xl">
                <div className="relative rounded-[20px] overflow-hidden bg-[#211619] aspect-[4/5]">
                  <img
                    src="/talents/Bob/bob_photo_1.png"
                    alt="Authentic Real-Beard Santa Claus Experience by Brillo Events"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#211619] via-transparent to-transparent" />

                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#211619]/85 backdrop-blur-md border border-[#D6B36A]/60 text-[11px] font-semibold text-[#D6B36A] tracking-wider uppercase">
                    ✦ Authentic Real-Beard Performers
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#211619]/90 backdrop-blur-md border border-[#D6B36A]/40">
                    <p className="font-display text-xl sm:text-2xl font-semibold text-[#FFF8F0] leading-tight">
                      “Give your guests more than a photo with Santa. Give them a Christmas memory.”
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-[#D6B36A] uppercase tracking-widest font-semibold">
                      <span>Malls • Hotels • Corporate • Private</span>
                      <span>Philippines</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. THE EMOTIONAL STORY — WHY BRILLO EVENTS EXISTS (#FFF8F0 WARM IVORY)
         ===================================================================== */}
      <section className="py-20 lg:py-28 bg-[#FFF8F0] border-b border-[#E6D7C3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story Portrait Column (5 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="lg:col-span-5 space-y-4"
            >
              <div className="rounded-3xl overflow-hidden border-2 border-[#D6B36A] shadow-luxury-card bg-[#211619]">
                <img
                  src="/talents/Bob/santa_throne_story.jpg"
                  alt="Santa Bob sharing a heartfelt Christmas moment with children"
                  className="w-full h-[420px] object-cover object-center"
                />
              </div>
              <div className="p-4 rounded-2xl bg-[#F9EFE4] border border-[#D6B36A]/50 flex items-center space-x-3">
                <Heart className="w-5 h-5 text-[#A61932] shrink-0 fill-current" />
                <p className="text-xs font-medium text-[#211619]/80 leading-relaxed">
                  Every Brillo Events appearance is guided by warmth, empathy, and genuine human connection.
                </p>
              </div>
            </motion.div>

            {/* Emotional Narrative (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="lg:col-span-7 space-y-5"
            >
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#A61932]">
                Why Brillo Events Exists
              </span>

              <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#211619] leading-[1.12]">
                Sometimes, Santa Is More Than a Christmas Character.{" "}
                <span className="text-[#780D22] italic">
                  Sometimes, He&apos;s Exactly What Someone Needs.
                </span>
              </h2>

              <div className="space-y-4 text-[16px] sm:text-[17px] text-[#211619]/85 leading-relaxed">
                <p className="font-semibold text-[#211619]">
                  Christmas without Santa is not quite Christmas.
                </p>
                <p>
                  Not because of the red suit, the white beard, or the presents beneath the tree — but because of what Santa represents: <strong>hope, kindness, joy, and the belief that even the smallest moments can make a difference.</strong>
                </p>
                <p>
                  During one of our recent appearances, our real-beard Santa, <strong>Santa Bob</strong>, experienced a moment that reminded our team why we love what we do.
                </p>
                <p>
                  A mother approached Santa Bob with her nephew. As they spoke, she suddenly became emotional. Santa gently asked what was wrong. She shared that her five-year-old son had recently been diagnosed with cancer and was unable to attend the event.
                </p>
                <p>
                  Santa Bob listened, held her hand, and offered words of comfort. He then asked her to take out her phone and recorded a personal Christmas greeting for her little boy, wishing him a Merry Christmas and expressing his hopes for his recovery.
                </p>
                <p>
                  She walked away smiling, carrying something much more meaningful than a photograph — <em>a message of love, a little moment of happiness, and a memory she could bring home to her son.</em>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#780D22] text-[#FFF8F0] border border-[#D6B36A]/60 shadow-lg">
                <p className="font-display text-2xl sm:text-3xl font-semibold text-[#D6B36A]">
                  “For Santa Bob, it became the highlight of his day. And for us at Brillo Events, it was a reminder that what we do goes far beyond appearances. We create moments that matter.”
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. WHAT MAKES BRILLO EVENTS DIFFERENT? (#211619 MIDNIGHT VELVET)
         ===================================================================== */}
      <section className="py-20 lg:py-28 bg-[#211619] text-[#FFF8F0] border-b border-[#D6B36A]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D6B36A]">
              The Brillo Standard
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#FFF8F0] leading-tight">
              Not All Santas Create the Same Experience.
            </h2>
            <p className="text-[16px] sm:text-[17px] text-[#FFF8F0]/80 leading-relaxed">
              Anyone can wear a red suit. But creating the feeling of meeting the real Santa Claus takes something more. At Brillo Events, we believe the difference is in the details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map((item) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="p-7 rounded-2xl bg-gradient-to-b from-[#36252A]/80 to-[#211619] border border-[#D6B36A]/35 hover:border-[#D6B36A] transition space-y-3"
              >
                <span className="font-display text-4xl font-bold text-[#D6B36A]">
                  {item.num}.
                </span>
                <h3 className="font-display text-2xl sm:text-[28px] font-bold text-[#FFF8F0] leading-snug">
                  {item.title}
                </h3>
                <p className="text-[15px] text-[#FFF8F0]/75 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}

            {/* 6th Visual Showcase Card */}
            <div className="rounded-2xl overflow-hidden border border-[#D6B36A]/50 relative min-h-[250px] group">
              <img
                src="/brand/showcase_santa_muntinlupa.jpg"
                alt="Authentic Brillo Events Christmas Appearance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211619] via-[#211619]/30 to-transparent flex flex-col justify-end p-6">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D6B36A]">
                  Ready to Plan Your Event?
                </span>
                <a
                  href="#inquiry-form"
                  className="mt-2 inline-flex items-center text-sm font-bold text-[#FFF8F0] hover:text-[#D6B36A] transition"
                >
                  Request Availability &amp; Quotation{" "}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. OUR SANTA EXPERIENCES (#FFF8F0 WARM IVORY)
         ===================================================================== */}
      <section
        id="experiences"
        className="py-20 lg:py-28 bg-[#FFF8F0] border-b border-[#E6D7C3]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A61932]">
              Curated Character Categories
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#211619] leading-tight">
              Find the Perfect Santa Experience for Your Christmas Event.
            </h2>
            <p className="text-[16px] sm:text-[17px] text-[#211619]/80 leading-relaxed">
              From premium real-beard performers to complete Santa and Elf packages, Brillo Events offers experiences designed around your event, audience, and budget.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Experience 1: Real-Beard Santa */}
            <div className="rounded-3xl bg-white border-2 border-[#D6B36A] shadow-luxury-card overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition duration-300 relative">
              <div>
                <div className="h-72 overflow-hidden relative bg-[#211619]">
                  <img
                    src={packageTiles[0]?.image || "/brand/package_real_beard_santa.jpg"}
                    alt={packageTiles[0]?.title || "Real-Beard Santa Claus Experience"}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#780D22] text-[#D6B36A] border border-[#D6B36A]/60 text-[11px] font-bold uppercase tracking-wider">
                    {packageTiles[0]?.badge || "Premium Experience"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTileEditor("PACKAGE", 0);
                    }}
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[#780D22] hover:text-[#590919] text-xs font-bold shadow-md border border-[#D6B36A] flex items-center space-x-1.5 transition z-20 backdrop-blur-sm hover:scale-105"
                    title="Edit this tile"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#780D22]" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="p-7 space-y-4">
                  <h3 className="font-display font-bold text-3xl text-[#211619]">
                    {packageTiles[0]?.title || "REAL-BEARD SANTA CLAUS"}
                  </h3>
                  <p className="text-[15px] text-[#211619]/80 leading-relaxed">
                    {packageTiles[0]?.desc || "For clients who want the authentic Santa Claus experience. Ideal for luxury malls, hotels, corporate launches, brand activations, and exclusive private celebrations."}
                  </p>
                  <ul className="space-y-2.5 pt-2 border-t border-[#E6D7C3] text-[14px] text-[#211619]/90">
                    {[
                      "Natural real beard",
                      "Authentic Santa appearance",
                      "Meet-and-greet experiences",
                      "Photo opportunities",
                      "Dedicated event assistant, where included in the confirmed package",
                    ].map((pt) => (
                      <li key={pt} className="flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#A61932] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="px-7 pb-7">
                <button
                  type="button"
                  onClick={() => scrollToInquiryWithPackage("REAL_BEARD")}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#780D22] to-[#A61932] hover:from-[#A61932] hover:to-[#B82038] text-[#FFF8F0] font-semibold text-[13px] uppercase tracking-wider border border-[#D6B36A]/50 transition"
                >
                  Select Real-Beard Santa →
                </button>
              </div>
            </div>

            {/* Experience 2: Classic Santa */}
            <div className="rounded-3xl bg-white border-2 border-[#E6D7C3] hover:border-[#D6B36A] shadow-luxury-card overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition duration-300 relative">
              <div>
                <div className="h-72 overflow-hidden relative bg-[#211619]">
                  <img
                    src={packageTiles[1]?.image || "/brand/package_classic_santa.jpg"}
                    alt={packageTiles[1]?.title || "Classic Santa Claus Experience"}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#211619]/85 text-[#FFF8F0] border border-[#D6B36A]/50 text-[11px] font-bold uppercase tracking-wider">
                    {packageTiles[1]?.badge || "Festive Favorite"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTileEditor("PACKAGE", 1);
                    }}
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[#780D22] hover:text-[#590919] text-xs font-bold shadow-md border border-[#D6B36A] flex items-center space-x-1.5 transition z-20 backdrop-blur-sm hover:scale-105"
                    title="Edit this tile"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#780D22]" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="p-7 space-y-4">
                  <h3 className="font-display font-bold text-3xl text-[#211619]">
                    {packageTiles[1]?.title || "CLASSIC SANTA CLAUS"}
                  </h3>
                  <p className="text-[15px] text-[#211619]/80 leading-relaxed">
                    {packageTiles[1]?.desc || "A festive Santa experience for mall activities, Christmas photo shoots, holiday celebrations, and private parties."}
                  </p>
                  <ul className="space-y-2.5 pt-2 border-t border-[#E6D7C3] text-[14px] text-[#211619]/90">
                    {[
                      "Traditional Santa costume",
                      "Family photo opportunities",
                      "Warm guest interaction",
                      "Festive Christmas entertainment",
                    ].map((pt) => (
                      <li key={pt} className="flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#A61932] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="px-7 pb-7">
                <button
                  type="button"
                  onClick={() => scrollToInquiryWithPackage("FAKE_BEARD")}
                  className="w-full py-3.5 rounded-xl bg-[#211619] hover:bg-[#780D22] text-[#FFF8F0] font-semibold text-[13px] uppercase tracking-wider border border-[#D6B36A]/40 transition"
                >
                  Select Classic Santa →
                </button>
              </div>
            </div>

            {/* Experience 3: Santa & Two Elves */}
            <div className="rounded-3xl bg-white border-2 border-[#D6B36A] shadow-luxury-card overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition duration-300 relative">
              <div>
                <div className="h-72 overflow-hidden relative bg-[#211619]">
                  <img
                    src={packageTiles[2]?.image || "/brand/package_santa_and_two_elves.jpg"}
                    alt={packageTiles[2]?.title || "Santa and Two Elves Complete Character Package"}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-[#A61932] text-[#FFF8F0] border border-[#D6B36A]/60 text-[11px] font-bold uppercase tracking-wider">
                    {packageTiles[2]?.badge || "Complete Character Package"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTileEditor("PACKAGE", 2);
                    }}
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[#780D22] hover:text-[#590919] text-xs font-bold shadow-md border border-[#D6B36A] flex items-center space-x-1.5 transition z-20 backdrop-blur-sm hover:scale-105"
                    title="Edit this tile"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#780D22]" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="p-7 space-y-4">
                  <h3 className="font-display font-bold text-3xl text-[#211619]">
                    {packageTiles[2]?.title || "SANTA & TWO ELVES"}
                  </h3>
                  <p className="text-[15px] text-[#211619]/80 leading-relaxed">
                    {packageTiles[2]?.desc || "Bring more energy, color, and Christmas excitement to your celebration."}
                  </p>
                  <ul className="space-y-2.5 pt-2 border-t border-[#E6D7C3] text-[14px] text-[#211619]/90">
                    {[
                      "One Santa performer",
                      "Two Christmas elves",
                      "Group photo opportunities",
                      "Interactive Christmas entertainment",
                      "Great for mall activations and family events",
                    ].map((pt) => (
                      <li key={pt} className="flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#A61932] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="px-7 pb-7">
                <button
                  type="button"
                  onClick={() => scrollToInquiryWithPackage("SANTA_AND_ELVES")}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#780D22] to-[#A61932] hover:from-[#A61932] hover:to-[#B82038] text-[#FFF8F0] font-semibold text-[13px] uppercase tracking-wider border border-[#D6B36A]/50 transition"
                >
                  Select Santa &amp; 2 Elves →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. PRICING & PACKAGES (#780D22 DEEP VELVET RED + #D6B36A GOLD BORDERS)
         ===================================================================== */}
      <section
        id="packages"
        className="py-20 lg:py-28 bg-gradient-to-b from-[#780D22] via-[#5E0A1B] to-[#211619] text-[#FFF8F0] border-b border-[#D6B36A]/35"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D6B36A]">
              Pricing &amp; Packages
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#FFF8F0] leading-tight">
              Choose Your Christmas Experience
            </h2>
            <p className="text-[16px] sm:text-[17px] text-[#FFF8F0]/85 leading-relaxed">
              Transparent starting rates help you plan your event before requesting a formal quotation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Package 1: Real-Beard Santa */}
            <div className="rounded-3xl bg-[#211619]/90 border-2 border-[#D6B36A] p-7 sm:p-8 shadow-gold-glow flex flex-col justify-between space-y-6 relative">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#D6B36A]">
                    Premium Santa Experience
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#A61932] text-[#FFF8F0] text-[10px] font-bold uppercase">
                    Limited Talents
                  </span>
                </div>

                <h3 className="font-display font-bold text-3xl sm:text-4xl text-[#FFF8F0]">
                  Real-Beard Santa
                </h3>

                {/* Reconciled 3-Rate Breakdown */}
                <div className="p-4 rounded-2xl bg-white/5 border border-[#D6B36A]/40 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#FFF8F0]/80">Metro Manila Rate</span>
                    <strong className="font-display text-3xl font-bold text-[#D6B36A]">
                      ₱24,000
                    </strong>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
                    <span className="text-xs text-[#FFF8F0]/80">Holiday Rate</span>
                    <strong className="font-display text-2xl font-bold text-[#FFF8F0]">
                      ₱26,000
                    </strong>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
                    <span className="text-xs text-[#FFF8F0]/80">Out-of-Town Rate</span>
                    <strong className="font-display text-2xl font-bold text-[#FFF8F0]">
                      ₱26,000
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D6B36A]">
                    Ideal for:
                  </div>
                  <ul className="space-y-2 text-[14px] text-[#FFF8F0]/85">
                    {[
                      "Christmas launches",
                      "Mall and hotel meet-and-greets",
                      "Corporate events",
                      "Professional photo shoots",
                      "Private celebrations",
                    ].map((it) => (
                      <li key={it} className="flex items-center space-x-2">
                        <Star className="w-3.5 h-3.5 text-[#D6B36A] fill-current shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#780D22]/40 border border-[#D6B36A]/30 text-[12px] text-[#FFF8F0]/85 space-y-1">
                  <div>
                    <strong>Meet-and-greet minimum:</strong> 3 hours (+₱3,000 per additional hour).
                  </div>
                  <div className="text-[11px] text-[#FFF8F0]/70">
                    Travel and accommodation arrangements, if applicable, will be specified in the final quotation.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollToInquiryWithPackage("REAL_BEARD")}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#A61932] to-[#B82038] hover:from-[#B82038] hover:to-[#A61932] text-[#FFF8F0] border border-[#D6B36A] font-bold text-[13px] uppercase tracking-[0.08em] shadow-crimson-glow transition"
              >
                Inquire About Real-Beard Santa
              </button>
            </div>

            {/* Package 2: Classic Santa (Costume / Fake Beard) */}
            <div className="rounded-3xl bg-[#FFF8F0] text-[#211619] border-2 border-[#D6B36A] p-7 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#A61932]">
                    Festive Santa Experience
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F9EFE4] text-[#780D22] border border-[#D6B36A] text-[10px] font-bold uppercase">
                    Popular Choice
                  </span>
                </div>

                <h3 className="font-display font-bold text-3xl sm:text-4xl text-[#211619]">
                  Classic Santa{" "}
                  <span className="block text-xl font-medium text-[#780D22]">
                    (Costume / Fake Beard)
                  </span>
                </h3>

                <div className="p-4 rounded-2xl bg-[#F9EFE4] border border-[#D6B36A]/60 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-[#211619]/80">
                      Metro Manila Rate
                    </span>
                    <strong className="font-display text-3xl font-bold text-[#780D22]">
                      ₱15,000
                    </strong>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-[#E6D7C3] pt-2">
                    <span className="text-xs font-medium text-[#211619]/80">
                      Holiday Rate
                    </span>
                    <strong className="font-display text-2xl font-bold text-[#211619]">
                      ₱18,000
                    </strong>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-[#E6D7C3] pt-2">
                    <span className="text-xs font-medium text-[#211619]/80">
                      Out-of-Town Rate
                    </span>
                    <strong className="font-display text-2xl font-bold text-[#211619]">
                      ₱18,000
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#A61932]">
                    Suitable for:
                  </div>
                  <ul className="space-y-2 text-[14px] text-[#211619]/85">
                    {[
                      "Mall appearances",
                      "Christmas photo shoots",
                      "Christmas launches",
                      "Private parties",
                      "Meet-and-greet activities",
                    ].map((it) => (
                      <li key={it} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#A61932] shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F9EFE4] border border-[#E6D7C3] text-[12px] text-[#211619]/80">
                  <strong>Meet-and-greet minimum:</strong> 3 hours (+₱3,000 per additional hour).
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollToInquiryWithPackage("FAKE_BEARD")}
                className="w-full py-4 rounded-xl bg-[#211619] hover:bg-[#780D22] text-[#FFF8F0] border border-[#D6B36A]/60 font-bold text-[13px] uppercase tracking-[0.08em] transition"
              >
                Book Classic Santa
              </button>
            </div>

            {/* Package 3: Santa + 2 Elves */}
            <div className="rounded-3xl bg-[#211619]/90 border-2 border-[#D6B36A] p-7 sm:p-8 shadow-gold-glow flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#D6B36A]">
                    Group Package
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D6B36A]/20 text-[#D6B36A] border border-[#D6B36A]/50 text-[10px] font-bold uppercase">
                    3 Performers
                  </span>
                </div>

                <h3 className="font-display font-bold text-3xl sm:text-4xl text-[#FFF8F0]">
                  Santa + 2 Elves
                </h3>

                <div className="p-4 rounded-2xl bg-white/5 border border-[#D6B36A]/40 space-y-1">
                  <span className="text-xs text-[#FFF8F0]/75 block">
                    Complete Group Package Rate
                  </span>
                  <strong className="font-display text-4xl font-bold text-[#D6B36A] block">
                    ₱32,000
                  </strong>
                  <span className="text-[11px] text-[#FFF8F0]/65 block">
                    Minimum 3 hours • +₱3,000 per additional hour
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D6B36A]">
                    Package includes:
                  </div>
                  <ul className="space-y-2 text-[14px] text-[#FFF8F0]/85">
                    {[
                      "One Santa Claus performer",
                      "Two Christmas elf performers",
                      "Group Christmas entertainment",
                      "Interactive guest engagement",
                      "Photo opportunities",
                    ].map((it) => (
                      <li key={it} className="flex items-center space-x-2">
                        <Star className="w-3.5 h-3.5 text-[#D6B36A] fill-current shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#780D22]/40 border border-[#D6B36A]/30 text-[12px] text-[#FFF8F0]/80">
                  Ideal for high-energy mall activations, tree-lighting spectacles, and family holiday festivals.
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollToInquiryWithPackage("SANTA_AND_ELVES")}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#A61932] to-[#B82038] hover:from-[#B82038] hover:to-[#A61932] text-[#FFF8F0] border border-[#D6B36A] font-bold text-[13px] uppercase tracking-[0.08em] shadow-crimson-glow transition"
              >
                Inquire About the Santa &amp; Elves Package
              </button>
            </div>
          </div>

          <p className="max-w-4xl mx-auto text-center text-[12px] text-[#FFF8F0]/70 leading-relaxed pt-2">
            All prices are indicative booking rates. Final quotations depend on date, venue, duration, performer availability, event requirements, and travel arrangements. Confirm inclusions and applicable additional charges in your written quotation.
          </p>
        </div>
      </section>

      {/* =====================================================================
          6. EVENTS WE SPECIALIZE IN (#FFF8F0 WARM IVORY)
         ===================================================================== */}
      <section
        id="events"
        className="py-20 lg:py-28 bg-[#FFF8F0] border-b border-[#E6D7C3]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A61932]">
              Events We Specialize In
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#211619] leading-tight">
              Whatever You&apos;re Celebrating, We Bring the Christmas Magic.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {eventTiles.map((ev, idx) => (
              <div
                key={ev.title + idx}
                className="rounded-3xl bg-white border border-[#E6D7C3] hover:border-[#D6B36A] shadow-luxury-card overflow-hidden group transition duration-300 flex flex-col justify-between relative"
              >
                <div>
                  <div className="h-56 overflow-hidden bg-[#211619] relative">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Interactive Edit Button for Easy Customization */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTileEditor("EVENT", idx);
                      }}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[#780D22] hover:text-[#590919] text-xs font-bold shadow-md border border-[#D6B36A] flex items-center space-x-1.5 transition z-20 backdrop-blur-sm hover:scale-105"
                      title="Edit this tile"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#780D22]" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="p-6 space-y-2.5">
                    <h3 className="font-display font-bold text-2xl sm:text-[28px] text-[#211619] leading-snug">
                      {ev.title}
                    </h3>
                    <p className="text-[15px] text-[#211619]/75 leading-relaxed">
                      {ev.desc}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 flex items-center justify-between">
                  <Link
                    href={ev.link}
                    className="text-xs font-bold uppercase tracking-wider text-[#A61932] hover:text-[#780D22] inline-flex items-center"
                  >
                    Explore Experience <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                  <a
                    href="#inquiry-form"
                    onClick={() => setEventTypeLabel(ev.title)}
                    className="text-xs font-semibold text-[#211619]/70 hover:text-[#A61932]"
                  >
                    Inquire →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. LIVE PUBLIC-APPROVED SANTA PORTFOLIO (SYNCED WITH /ADMIN/ROSTER)
         ===================================================================== */}
      <section
        id="roster"
        className="py-20 lg:py-28 bg-[#F9EFE4] border-b border-[#E6D7C3]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A61932]">
                  Our Santa Performers
                </span>
                {publicTalents.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#780D22] text-[#D6B36A] text-[10px] font-bold">
                    {publicTalents.length} Vetted Performers
                  </span>
                )}
              </div>
              <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#211619]">
                Meet Our Authentic Santa Roster
              </h2>
              <p className="text-[15px] text-[#211619]/75 max-w-2xl">
                Request a specific Santa performer subject to date availability and confirmation, or allow our coordination desk to match the ideal Santa to your celebration.
              </p>
            </div>

            <a
              href="#inquiry-form"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-[#780D22] hover:bg-[#A61932] text-[#FFF8F0] border border-[#D6B36A]/50 text-xs font-bold uppercase tracking-wider transition self-start md:self-auto"
            >
              Check Specific Performer Availability →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {publicTalents.map((t: any) => {
              const primaryImg =
                (t.images?.find((i: any) => i.isPrimary) || t.images?.[0])
                  ?.publicUrl || null;
              const subtitle =
                t.bio ||
                `${t.nationality || "International"} Real-Beard Santa Performer`;

              return (
                <div
                  key={t.id}
                  className="rounded-2xl bg-white border border-[#D6B36A]/60 hover:border-[#A61932] overflow-hidden shadow-luxury-card group flex flex-col justify-between transition"
                >
                  <div className="h-64 overflow-hidden bg-[#211619] relative">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={`Santa ${t.displayName}`}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#D6B36A] p-4 text-center">
                        <Sparkles className="w-8 h-8 mb-2" />
                        <span className="font-display text-xl font-bold text-[#FFF8F0]">
                          Santa {t.displayName}
                        </span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#211619]/85 text-[#D6B36A] border border-[#D6B36A]/50 text-[10px] font-semibold">
                      {t.talentType === "REGULAR_SANTA"
                        ? "Classic Santa"
                        : "Real-Beard Santa"}
                    </span>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-2xl text-[#211619]">
                          Santa {t.displayName}
                        </h3>
                        {t.height && (
                          <span className="text-[11px] font-semibold text-[#780D22] bg-[#F9EFE4] px-2 py-0.5 rounded-md border border-[#E6D7C3]">
                            {t.height}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#A61932]">
                        {t.nationality || "Authentic Holiday Performer"}
                      </p>
                      <p className="text-[13px] text-[#211619]/75 line-clamp-2 leading-relaxed pt-1">
                        {subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollToInquiryWithPackage("REAL_BEARD", t)}
                      className="w-full py-2.5 rounded-xl bg-[#FFF8F0] hover:bg-[#780D22] text-[#780D22] hover:text-[#FFF8F0] border border-[#780D22]/40 text-xs font-bold uppercase tracking-wider transition"
                    >
                      Inquire Santa {t.displayName}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. THE BRILLO BOOKING EXPERIENCE (#211619 MIDNIGHT VELVET)
         ===================================================================== */}
      <section className="py-20 lg:py-28 bg-[#211619] text-[#FFF8F0] border-b border-[#D6B36A]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D6B36A]">
              The Brillo Booking Experience
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#FFF8F0]">
              From First Inquiry to Christmas Magic.
            </h2>
            <p className="text-[16px] text-[#FFF8F0]/80">
              We make booking your Santa simple and organized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {BOOKING_STEPS.map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-2xl bg-[#36252A]/60 border border-[#D6B36A]/35 space-y-3 relative"
              >
                <div className="w-11 h-11 rounded-xl bg-[#780D22] border border-[#D6B36A] flex items-center justify-center font-display text-2xl font-bold text-[#D6B36A]">
                  {st.step}
                </div>
                <h3 className="font-display font-bold text-2xl text-[#FFF8F0] leading-snug">
                  {st.title}
                </h3>
                <p className="text-[14px] text-[#FFF8F0]/75 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          9. OUR EXPERIENCE & TRUST (#FFF8F0 WARM IVORY)
         ===================================================================== */}
      <section className="py-20 lg:py-28 bg-[#FFF8F0] border-b border-[#E6D7C3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A61932]">
                Our Experience &amp; Trust
              </span>
              <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#211619] leading-tight">
                Trusted for Memorable Christmas Experiences.
              </h2>
              <p className="text-[16px] sm:text-[17px] text-[#211619]/80 leading-relaxed">
                Brillo Events Management Services works with event organizers, production teams, shopping centers, and private clients to deliver professionally coordinated Christmas entertainment.
              </p>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#780D22]">
                  Our experience includes:
                </div>
                <ul className="space-y-2.5 text-[15px] text-[#211619]/90">
                  {[
                    "Shopping mall Christmas activations",
                    "Corporate and institutional events",
                    "Holiday launches and tree-lighting ceremonies",
                    "Private and luxury celebrations",
                    "Santa performer coordination and talent management",
                  ].map((item) => (
                    <li key={item} className="flex items-center space-x-3">
                      <ShieldCheck className="w-5 h-5 text-[#A61932] shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9EFE4] border-l-4 border-l-[#780D22] border border-[#D6B36A]/50">
                <p className="font-display text-2xl font-bold text-[#211619]">
                  Our promise is simple: Professional coordination. Memorable performances. Christmas experiences worth remembering.
                </p>
              </div>
            </div>

            {/* Authentic Photo Mosaic */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="/talents/Perry/perry_photo_3.jpg"
                  alt="Mall Christmas Appearance"
                  className="w-full h-56 object-cover rounded-2xl border-2 border-[#D6B36A]/60 shadow-md"
                />
                <img
                  src="/talents/Randy/randy_photo_1.jpg"
                  alt="Corporate Holiday Event"
                  className="w-full h-64 object-cover rounded-2xl border-2 border-[#D6B36A]/60 shadow-md"
                />
              </div>
              <div className="space-y-4 pt-6">
                <img
                  src="/talents/Terry/terry_photo_2.jpg"
                  alt="Holiday Tree Lighting"
                  className="w-full h-64 object-cover rounded-2xl border-2 border-[#D6B36A]/60 shadow-md"
                />
                <img
                  src="/talents/Richard/richard_photo_1.jpg"
                  alt="Family Santa Celebration"
                  className="w-full h-56 object-cover rounded-2xl border-2 border-[#D6B36A]/60 shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          10. FREQUENTLY ASKED QUESTIONS (#F9EFE4 SOFT IVORY)
         ===================================================================== */}
      <section
        id="faq"
        className="py-20 lg:py-28 bg-[#F9EFE4] border-b border-[#E6D7C3]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A61932]">
              Frequently Asked Questions
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#211619]">
              Everything You Need to Know Before Booking Santa.
            </h2>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl bg-white border border-[#E6D7C3] overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FFF8F0] transition"
                  >
                    <span className="font-display font-bold text-xl sm:text-2xl text-[#211619]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#A61932] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-[15px] text-[#211619]/80 leading-relaxed border-t border-[#F9EFE4]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          11. EMBEDDED HIGH-CONVERSION QUOTATION INQUIRY FORM (LIVE CRM SYNC)
         ===================================================================== */}
      <section
        id="inquiry-form"
        className="py-20 lg:py-28 bg-[#FFF8F0] border-b border-[#E6D7C3]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A61932]">
              Request Your Santa Quotation
            </span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[#211619]">
              Request Your Santa Quotation
            </h2>
            <p className="text-[16px] text-[#211619]/80 leading-relaxed">
              Tell us about your event. Our team will review your requirements and respond with availability and pricing.
            </p>
          </div>

          {submittedResult ? (
            <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-[#D6B36A] shadow-luxury-card space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#780D22] text-[#D6B36A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#A61932]">
                  Inquiry Logged • Reference {submittedResult.bookingNumber}
                </span>
                <h3 className="font-display font-bold text-3xl sm:text-4xl text-[#211619]">
                  Thank You! Your Santa Inquiry Has Been Received.
                </h3>
                <p className="text-[15px] text-[#211619]/75 max-w-xl mx-auto">
                  Your request for <strong>{submittedResult.venueLocation}</strong> on{" "}
                  <strong>{submittedResult.eventDate}</strong> has been logged directly into our coordination desk, calendar, and CRM pipeline.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E6D7C3] max-w-lg mx-auto text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#211619]/70">Selected Experience:</span>
                  <strong className="text-[#211619]">
                    {submittedResult.calc.santaTierLabel}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#211619]/70">Indicative Rate:</span>
                  <strong className="text-[#780D22] text-base">
                    ₱{submittedResult.calc.totalQuotedRate.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={submittedResult.statusUrl}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#780D22] to-[#A61932] text-[#FFF8F0] font-bold text-xs uppercase tracking-wider border border-[#D6B36A]"
                >
                  Open Booking Status &amp; Payment Portal →
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmittedResult(null)}
                  className="px-6 py-3.5 rounded-xl bg-[#F9EFE4] text-[#211619] font-semibold text-xs uppercase tracking-wider border border-[#E6D7C3]"
                >
                  Submit Another Event Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleInquirySubmit}
              className="p-7 sm:p-10 rounded-3xl bg-white border-2 border-[#D6B36A] shadow-luxury-card space-y-8"
            >
              {formError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Part 1: Your Event */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6D7C3]">
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#211619]">
                    1. Your Event Details
                  </h3>
                  <div className="px-3.5 py-1.5 rounded-full bg-[#FFF8F0] border border-[#D6B36A] text-xs font-semibold text-[#780D22]">
                    Indicative Package Rate:{" "}
                    <strong>
                      ₱{livePackageCalc.totalQuotedRate.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Preferred Package Cards */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#211619]/80 mb-2">
                    Preferred Package *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "REAL_BEARD" as SantaBeardTier,
                        title: "Real-Beard Santa",
                        sub: "₱24k Metro Manila • ₱26k Holiday/OOT",
                      },
                      {
                        id: "FAKE_BEARD" as SantaBeardTier,
                        title: "Classic Santa",
                        sub: "₱15k Metro Manila • ₱18k Holiday/OOT",
                      },
                      {
                        id: "SANTA_AND_ELVES" as SantaBeardTier,
                        title: "Santa + 2 Elves",
                        sub: "₱32,000 Group Package Rate",
                      },
                    ].map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setPreferredPackage(pkg.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition ${
                          preferredPackage === pkg.id
                            ? "bg-[#780D22] border-[#D6B36A] text-[#FFF8F0] shadow-md"
                            : "bg-[#FFF8F0] border-[#E6D7C3] text-[#211619] hover:border-[#D6B36A]"
                        }`}
                      >
                        <div className="font-display font-bold text-xl">
                          {pkg.title}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 ${
                            preferredPackage === pkg.id
                              ? "text-[#D6B36A]"
                              : "text-[#211619]/70"
                          }`}
                        >
                          {pkg.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Event Type *
                    </label>
                    <select
                      value={eventTypeLabel}
                      onChange={(e) => setEventTypeLabel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619] font-medium"
                    >
                      <option>Shopping Mall / Corporate Event</option>
                      <option>Shopping Mall Christmas Launch</option>
                      <option>Hotel &amp; Luxury Resort</option>
                      <option>Brand Activation &amp; Campaign</option>
                      <option>Private &amp; Family Celebration</option>
                      <option>Christmas Photo Shoot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Location Territory *
                    </label>
                    <select
                      value={rateTerritory}
                      onChange={(e) =>
                        setRateTerritory(e.target.value as SantaRateTerritory)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619] font-medium"
                    >
                      <option value="METRO_MANILA">Metro Manila</option>
                      <option value="HOLIDAY">Peak Holiday Date</option>
                      <option value="OUT_OF_TOWN">Out-of-Town / Provincial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => handleEventDateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Required Duration *
                    </label>
                    <select
                      value={durationChoice}
                      onChange={(e) => setDurationChoice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619] font-medium"
                    >
                      <option value="3">3 hours (Minimum Base)</option>
                      <option value="4">4 hours (+₱3,000)</option>
                      <option value="5">5 hours or more (+₱6,000+)</option>
                      <option value="discuss">To be discussed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Event Location / Venue *
                    </label>
                    <input
                      type="text"
                      required
                      value={venueLocation}
                      onChange={(e) => setVenueLocation(e.target.value)}
                      placeholder="e.g. SM Mall of Asia / Shangri-La / Private Residence"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Preferred Santa Performer (Optional)
                    </label>
                    <select
                      value={preferredTalentId}
                      onChange={(e) => setPreferredTalentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619]"
                    >
                      <option value="">
                        No specific preference — Recommend best available Santa
                      </option>
                      {publicTalents.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          Santa {t.displayName} ({t.nationality || "Real Beard"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Part 2: Contact Information */}
              <div className="space-y-4 pt-2 border-t border-[#E6D7C3]">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#211619]">
                  2. Your Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={companyOrg}
                      onChange={(e) => setCompanyOrg(e.target.value)}
                      placeholder="Shopping Mall / Hotel / Brand / Family Host"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619]"
                    />
                    {email.toLowerCase().includes("@gmial.com") && (
                      <div className="mt-1.5 text-[11px] text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg flex items-center justify-between">
                        <span>Typo detected: Did you mean <strong>@gmail.com</strong>?</span>
                        <button
                          type="button"
                          onClick={() => setEmail(email.replace(/@gmial\.com/i, "@gmail.com"))}
                          className="font-bold underline text-[#780D22] ml-2"
                        >
                          Fix Email
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-[#211619] mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="0917 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619]"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-bold text-[#211619] mb-1.5">
                    Additional Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={additionalReqs}
                    onChange={(e) => setAdditionalReqs(e.target.value)}
                    placeholder="Share call time preferences, program flow, gift-giving details, or provincial travel notes..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F0] border border-[#D6B36A]/60 text-[#211619]"
                  />
                </div>
              </div>

              {/* Submit + Copy Inquiry Actions */}
              <div className="pt-4 border-t border-[#E6D7C3] flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleCopyInquiryText}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F9EFE4] hover:bg-[#E6D7C3]/60 text-[#211619] border border-[#D6B36A]/60 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center space-x-2 transition"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Copied Inquiry Details!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#780D22]" />
                      <span>Copy Booking Inquiry</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={submittingForm}
                  className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-[#A61932] to-[#B82038] hover:from-[#780D22] hover:to-[#A61932] text-[#FFF8F0] border border-[#D6B36A] font-bold text-[14px] uppercase tracking-[0.08em] shadow-crimson-glow transition disabled:opacity-50"
                >
                  {submittingForm
                    ? "Submitting to Brillo CRM..."
                    : "Submit Quotation Request →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* =====================================================================
          12. FINAL HIGH-CONVERSION BOOKING CTA (#780D22 DEEP VELVET RED)
         ===================================================================== */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#780D22] via-[#5E0A1B] to-[#211619] text-[#FFF8F0] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#211619]/60 border border-[#D6B36A]/50 text-[11px] font-bold uppercase tracking-[0.18em] text-[#D6B36A]">
            Reserve Your Holiday Date
          </span>

          <h2 className="font-display font-bold text-4xl sm:text-6xl text-[#FFF8F0] leading-tight">
            YOUR CHRISTMAS EVENT DESERVES A SANTA WORTH REMEMBERING.
          </h2>

          <p className="text-[16px] sm:text-lg text-[#FFF8F0]/85 max-w-2xl mx-auto leading-relaxed">
            Don&apos;t wait until your preferred Christmas dates are fully booked. Whether you&apos;re organizing a major shopping mall activation, a luxury hotel celebration, or an intimate family gathering, Brillo Events is ready to help you create something special.
          </p>

          <p className="font-display italic text-2xl sm:text-3xl text-[#D6B36A]">
            Let&apos;s make this Christmas unforgettable.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#inquiry-form"
              className="px-9 py-4 rounded-xl bg-gradient-to-r from-[#A61932] to-[#B82038] hover:from-[#B82038] hover:to-[#A61932] text-[#FFF8F0] border border-[#D6B36A] font-bold text-[14px] uppercase tracking-[0.08em] shadow-gold-glow transition"
            >
              Book Your Santa Experience Today
            </a>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-7 py-4 rounded-xl bg-[#211619]/75 hover:bg-[#211619] text-[#D6B36A] border border-[#D6B36A]/50 font-bold text-[13px] uppercase tracking-[0.08em] transition"
            >
              Instant Online Reservation &amp; GCash →
            </button>
          </div>

          {/* Direct Contact Details */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-[#FFF8F0]/90 font-medium">
            <a
              href="tel:09278872343"
              className="inline-flex items-center space-x-2 hover:text-[#D6B36A]"
            >
              <Phone className="w-4 h-4 text-[#D6B36A]" />
              <span>0927 887 2343</span>
            </a>
            <a
              href="mailto:brilloevents@gmail.com"
              className="inline-flex items-center space-x-2 hover:text-[#D6B36A]"
            >
              <Mail className="w-4 h-4 text-[#D6B36A]" />
              <span>brilloevents@gmail.com</span>
            </a>
            <span className="inline-flex items-center space-x-2 text-[#D6B36A]">
              <Globe className="w-4 h-4" />
              <span>brilloevent.com</span>
            </span>
          </div>
        </div>
      </section>

      {/* Instant Online Booking & Xendit Modal */}
      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultLocation="METRO_MANILA"
        selectedTalent={selectedTalent}
        publicTalents={publicTalents}
      />

      {/* Interactive Tile Customization Modal */}
      {tileEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-[#D6B36A] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-body">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E6D7C3]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#780D22] text-[#D6B36A] flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#211619]">
                    Customize Tile
                  </h3>
                  <p className="text-[11px] text-[#7A666B]">
                    Update image, title, and description for this section
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTileEditorOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF3EB] text-[#7A666B] hover:text-[#211619] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview Box */}
            <div className="p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#E6D7C3] flex items-center space-x-4">
              <div className="w-24 h-20 rounded-xl overflow-hidden bg-[#211619] shrink-0 border border-[#D6B36A]/50">
                <img
                  src={tileFormImage || "/brand/package_real_beard_santa.jpg"}
                  alt="Preview"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#A61932] tracking-wider block">
                  Live Preview
                </span>
                <h4 className="font-display font-bold text-sm text-[#211619] truncate">
                  {tileFormTitle || "Tile Title"}
                </h4>
                <p className="text-[11px] text-[#7A666B] line-clamp-2">
                  {tileFormDesc || "Description goes here..."}
                </p>
              </div>
            </div>

            {/* Upload or Choose Image */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#211619]">
                Tile Photo / Image
              </label>

              {/* Direct File Upload */}
              <label className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#D6B36A] hover:border-[#780D22] bg-[#FFF8F0] hover:bg-[#FAF3EB] cursor-pointer flex items-center justify-center space-x-2 text-xs font-bold text-[#780D22] transition shadow-sm">
                <Upload className="w-4 h-4 text-[#780D22]" />
                <span>Upload New Photo from Computer</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleTileImageFileUpload}
                />
              </label>

              {/* URL or Local Path */}
              <div>
                <span className="text-[11px] text-[#7A666B] block mb-1">
                  Or enter Image URL / Path:
                </span>
                <input
                  type="text"
                  value={tileFormImage}
                  onChange={(e) => setTileFormImage(e.target.value)}
                  placeholder="/brand/package_real_beard_santa.jpg"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6C7C9] rounded-lg focus:outline-none focus:border-[#780D22]"
                />
              </div>

              {/* Gallery Presets */}
              <div>
                <span className="text-[11px] font-semibold text-[#5C494E] block mb-1.5">
                  Or Select from Santa &amp; Event Gallery:
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_PHOTOS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setTileFormImage(p.url)}
                      className={`group relative rounded-lg overflow-hidden h-14 border transition ${
                        tileFormImage === p.url
                          ? "border-[#780D22] ring-2 ring-[#780D22]"
                          : "border-[#E6D7C3] hover:border-[#D6B36A]"
                      }`}
                      title={p.name}
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#211619]">
                Tile Title
              </label>
              <input
                type="text"
                value={tileFormTitle}
                onChange={(e) => setTileFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D6C7C9] rounded-xl focus:outline-none focus:border-[#780D22] font-semibold text-[#1E1416]"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#211619]">
                Tile Description
              </label>
              <textarea
                rows={3}
                value={tileFormDesc}
                onChange={(e) => setTileFormDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D6C7C9] rounded-xl focus:outline-none focus:border-[#780D22] text-[#1E1416] resize-none leading-relaxed"
              />
            </div>

            {/* If Event Tile, Target Link */}
            {tileEditorType === "EVENT" && (
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#211619]">
                  Target Link (Explore URL)
                </label>
                <input
                  type="text"
                  value={tileFormLink}
                  onChange={(e) => setTileFormLink(e.target.value)}
                  placeholder="/santa-for-malls"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#D6C7C9] rounded-xl focus:outline-none focus:border-[#780D22] text-[#1E1416]"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#E6D7C3] flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetTile}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#7A666B] hover:text-[#A61932] hover:bg-[#FAF3EB] flex items-center space-x-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setTileEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C494E] hover:bg-[#FAF3EB] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTile}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#780D22] hover:bg-[#590919] text-[#FFF8F0] shadow-md transition flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save &amp; Apply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {tileSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#780D22] text-[#FFF8F0] px-4 py-2.5 rounded-xl shadow-2xl border border-[#D6B36A] flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#D6B36A]" />
          <span>Tile successfully updated &amp; saved!</span>
        </div>
      )}
    </div>
  );
}
