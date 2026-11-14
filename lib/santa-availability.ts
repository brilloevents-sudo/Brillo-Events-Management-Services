export interface SanitizedBookingSlot {
  eventDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  durationHours: number;
  timeRangeLabel: string;
  status: string;
  areaHint?: string | null;
}

export interface SantaLocationMatch {
  isNearClient: boolean;
  matchScore: number;
  matchedAreaLabel: string | null;
  badgeText: string | null;
  tier: "EXACT_CITY" | "NEARBY_ZONE" | "NATIONWIDE";
}

export interface NextAvailableDateOption {
  date: string; // YYYY-MM-DD
  shortLabel: string; // e.g. "Mon, Nov 16"
}

export interface EvaluatedSantaAvailability {
  id: string;
  canonicalId: string;
  displayName: string;
  talentType: string;
  status: string;
  age: number | null;
  height: string | null;
  nationality: string | null;
  bio: string | null;
  address: string | null;
  approvedForPublicDisplay: boolean;
  primaryImageUrl: string;
  images: Array<{
    id: string;
    publicUrl: string;
    caption?: string | null;
    isPrimary?: boolean;
    approvedForClient?: boolean;
  }>;
  baseCity: string;
  coverageArea: string;
  coverageKeywords: string[];
  isAvailableOnDate: boolean;
  statusLabel: "AVAILABLE" | "ALREADY_BOOKED";
  bookedSlots: SanitizedBookingSlot[];
  openWindowsLabel: string;
  nextAvailableDates: NextAvailableDateOption[];
  upcomingBookedDates: Array<{
    date: string;
    shortLabel: string;
    timeRangeLabel: string;
  }>;
  locationMatch: SantaLocationMatch;
}

export interface AvailabilityEvaluationSummary {
  date: string;
  formattedDate: string;
  locationQuery: string;
  totalPublicSantas: number;
  availableCount: number;
  bookedCount: number;
  nearbyAvailableCount: number;
}

export const QUICK_LOCATION_PILLS = [
  "Makati / BGC",
  "Ortigas / Mandaluyong",
  "Quezon City / North EDSA",
  "Manila / Pasay (MOA)",
  "Parañaque / Alabang",
  "Pasig / Rizal",
  "Clark / Pampanga",
  "Tagaytay / Cavite",
  "Baguio / North Luzon",
  "Davao / Mindanao",
];

interface ZoneDefinition {
  id: string;
  label: string;
  regionGroup: string;
  keywords: string[];
}

const LOCATION_ZONES: ZoneDefinition[] = [
  {
    id: "MAKATI_BGC_PASAY",
    label: "Makati, BGC & Pasay",
    regionGroup: "NCR_SOUTH_CENTRAL",
    keywords: [
      "makati",
      "bgc",
      "bonifacio global city",
      "taguig",
      "one ayala",
      "ayala",
      "glorietta",
      "greenbelt",
      "rockwell",
      "sm aura",
      "aura",
      "market market",
      "forbes",
      "dasmariñas village",
      "pasay",
      "moa",
      "smok",
      "smoa",
      "mall of asia",
      "newport",
      "okada",
      "solaire",
      "jazz",
      "air",
    ],
  },
  {
    id: "ORTIGAS_MANDALUYONG_PASIG",
    label: "Ortigas, Mandaluyong & Pasig",
    regionGroup: "NCR_CENTRAL_EAST",
    keywords: [
      "ortigas",
      "mandaluyong",
      "megamall",
      "sm mega",
      "sm megamall",
      "podium",
      "shangri-la",
      "shangrila",
      "shaw",
      "sm shaw",
      "sm center shaw",
      "light",
      "smdc light",
      "fame",
      "pasig",
      "sm pasig",
      "estancia",
      "capitol commons",
      "tiendesitas",
      "greenhills",
      "san juan",
    ],
  },
  {
    id: "QUEZON_CITY_NORTH_MMR",
    label: "Quezon City & North Metro Manila",
    regionGroup: "NCR_NORTH",
    keywords: [
      "quezon city",
      "qc",
      "north edsa",
      "sm north",
      "trinoma",
      "vertis",
      "fairview",
      "sm fairview",
      "novaliches",
      "sm novaliches",
      "commonwealth",
      "ever gotesco",
      "eastwood",
      "cubao",
      "araneta",
      "katipunan",
      "up town",
      "timog",
      "morato",
      "mplace",
      "caloocan",
      "sm caloocan",
      "valenzuela",
      "malabon",
      "navotas",
      "san mateo",
      "rizal",
      "antipolo",
    ],
  },
  {
    id: "MANILA_CENTRAL",
    label: "Manila & Sta. Mesa",
    regionGroup: "NCR_CENTRAL_EAST",
    keywords: [
      "manila",
      "san lazaro",
      "sm san lazaro",
      "sta. mesa",
      "sta mesa",
      "sm sta. mesa",
      "ermita",
      "malate",
      "binondo",
      "intramuros",
      "sampaloc",
      "españa",
      "ust",
      "robinsons manila",
    ],
  },
  {
    id: "SOUTH_METRO_PARANAQUE_ALABANG",
    label: "Parañaque, Alabang & Las Piñas",
    regionGroup: "NCR_SOUTH_CENTRAL",
    keywords: [
      "paranaque",
      "parañaque",
      "bf paranaque",
      "sm bf",
      "sucat",
      "sm sucat",
      "bicutan",
      "sm city bicutan",
      "sm bicutan",
      "alabang",
      "muntinlupa",
      "sm muntinlupa",
      "ayala alabang",
      "filinvest",
      "festival mall",
      "las pinas",
      "las piñas",
      "southmall",
      "sm southmall",
    ],
  },
  {
    id: "SOUTH_LUZON_TAGAYTAY_CAVITE",
    label: "Tagaytay, Cavite, Laguna & Batangas",
    regionGroup: "SOUTH_LUZON",
    keywords: [
      "tagaytay",
      "wind tagaytay",
      "cavite",
      "bacoor",
      "imus",
      "dasmarinas",
      "dasmariñas",
      "general trias",
      "silang",
      "nuvali",
      "sta. rosa",
      "santa rosa",
      "laguna",
      "calamba",
      "biñan",
      "san pedro",
      "batangas",
      "lipa",
      "nasugbu",
    ],
  },
  {
    id: "CENTRAL_LUZON_CLARK_PAMPANGA",
    label: "Clark, Pampanga, Bulacan, Tarlac & Bataan",
    regionGroup: "CENTRAL_LUZON",
    keywords: [
      "pampanga",
      "clark",
      "sm clark",
      "clark cityfront",
      "angeles",
      "marquee",
      "marquee mall",
      "san fernando",
      "sm city pampanga",
      "sm pampanga",
      "bulacan",
      "marilao",
      "sm marilao",
      "san jose del monte",
      "sm san jose",
      "malolos",
      "bocaue",
      "tarlac",
      "sm tarlac",
      "olongapo",
      "subic",
      "bataan",
      "sm bataan",
      "cabanatuan",
      "nueva ecija",
    ],
  },
  {
    id: "NORTH_LUZON_BAGUIO_PANGASINAN",
    label: "Baguio, Pangasinan & North Luzon",
    regionGroup: "NORTH_LUZON",
    keywords: [
      "baguio",
      "sm baguio",
      "sm city baguio",
      "pangasinan",
      "urdaneta",
      "sm urdaneta",
      "rosales",
      "sm rosales",
      "dagupan",
      "la union",
      "ilocos",
      "tuguegarao",
      "cagayan",
      "isabela",
    ],
  },
  {
    id: "VISAYAS_MINDANAO_ISLANDS",
    label: "Davao, CDO, Cebu & Island Resorts",
    regionGroup: "VISMIN",
    keywords: [
      "davao",
      "sm city davao",
      "lanang",
      "sm lanang",
      "cdo",
      "cagayan de oro",
      "cebu",
      "iloilo",
      "bacolod",
      "boracay",
      "palawan",
      "amanpulo",
      "siargao",
      "mindanao",
      "visayas",
    ],
  },
];

interface DefaultSantaCoverage {
  baseCity: string;
  coverageArea: string;
  zoneIds: string[];
  extraKeywords: string[];
}

const DEFAULT_SANTA_COVERAGE_BY_CANONICAL: Record<string, DefaultSantaCoverage> = {
  "TAL-BENITO": {
    baseCity: "Parañaque & Manila",
    coverageArea: "Parañaque (BF / Sucat), Manila (Sta. Mesa), Makati & Pasay",
    zoneIds: ["SOUTH_METRO_PARANAQUE_ALABANG", "MANILA_CENTRAL", "MAKATI_BGC_PASAY"],
    extraKeywords: ["paranaque", "bf paranaque", "sta. mesa", "manila", "alabang", "pasay", "makati"],
  },
  "TAL-BOB": {
    baseCity: "Ortigas, Makati & Central Luzon",
    coverageArea: "Ortigas (Megamall / Podium), Makati (One Ayala), Manila, Bulacan, Tarlac & Olongapo",
    zoneIds: [
      "ORTIGAS_MANDALUYONG_PASIG",
      "MAKATI_BGC_PASAY",
      "MANILA_CENTRAL",
      "CENTRAL_LUZON_CLARK_PAMPANGA",
    ],
    extraKeywords: [
      "megamall",
      "podium",
      "ortigas",
      "mandaluyong",
      "makati",
      "one ayala",
      "san lazaro",
      "marilao",
      "bulacan",
      "tarlac",
      "olongapo",
      "subic",
    ],
  },
  "TAL-CEDRIC": {
    baseCity: "Makati, Parañaque & Pampanga",
    coverageArea: "Makati (One Ayala), Parañaque (Sucat), Pampanga (Marquee), Bataan & Baguio",
    zoneIds: [
      "MAKATI_BGC_PASAY",
      "SOUTH_METRO_PARANAQUE_ALABANG",
      "CENTRAL_LUZON_CLARK_PAMPANGA",
      "NORTH_LUZON_BAGUIO_PANGASINAN",
    ],
    extraKeywords: ["makati", "one ayala", "sucat", "paranaque", "marquee", "pampanga", "bataan", "baguio"],
  },
  "TAL-EDWIN": {
    baseCity: "Quezon City, Makati & South Metro",
    coverageArea: "Quezon City (North EDSA), Pasay (MOA), Makati (One Ayala), Ortigas (Podium), Bicutan & Alabang",
    zoneIds: [
      "QUEZON_CITY_NORTH_MMR",
      "MAKATI_BGC_PASAY",
      "ORTIGAS_MANDALUYONG_PASIG",
      "SOUTH_METRO_PARANAQUE_ALABANG",
    ],
    extraKeywords: [
      "north edsa",
      "quezon city",
      "bicutan",
      "muntinlupa",
      "alabang",
      "moa",
      "pasay",
      "podium",
      "ortigas",
      "makati",
      "one ayala",
    ],
  },
  "TAL-GIULIO": {
    baseCity: "Pasig / Metro Manila & Mindanao Tour",
    coverageArea: "Pasig, Ortigas, Makati & Mindanao Tour (Davao / Lanang / Cagayan de Oro)",
    zoneIds: ["ORTIGAS_MANDALUYONG_PASIG", "MAKATI_BGC_PASAY", "VISAYAS_MINDANAO_ISLANDS"],
    extraKeywords: ["pasig", "ortigas", "davao", "lanang", "cdo", "cagayan de oro", "mindanao"],
  },
  "TAL-LIAM": {
    baseCity: "Quezon City & Clark / Pampanga",
    coverageArea: "Quezon City (Commonwealth / North EDSA) & Pampanga (Clark / Angeles / Marquee)",
    zoneIds: ["QUEZON_CITY_NORTH_MMR", "CENTRAL_LUZON_CLARK_PAMPANGA"],
    extraKeywords: ["quezon city", "commonwealth", "ever gotesco", "clark", "pampanga", "marquee", "angeles"],
  },
  "TAL-MICKEYVER": {
    baseCity: "Mandaluyong, Ortigas & San Juan",
    coverageArea: "Mandaluyong (Shaw / Ortigas), Pasig, San Juan & Makati",
    zoneIds: ["ORTIGAS_MANDALUYONG_PASIG", "MAKATI_BGC_PASAY"],
    extraKeywords: ["shaw", "mandaluyong", "ortigas", "megamall", "pasig", "san juan", "greenhills", "makati"],
  },
  "TAL-PERRY": {
    baseCity: "Makati, Tagaytay & North Luzon",
    coverageArea: "Makati (One Ayala), Tagaytay / Cavite, Baguio, Urdaneta, Tuguegarao & VIP Island Resorts",
    zoneIds: [
      "MAKATI_BGC_PASAY",
      "SOUTH_LUZON_TAGAYTAY_CAVITE",
      "NORTH_LUZON_BAGUIO_PANGASINAN",
      "VISAYAS_MINDANAO_ISLANDS",
    ],
    extraKeywords: [
      "makati",
      "one ayala",
      "tagaytay",
      "cavite",
      "baguio",
      "urdaneta",
      "pangasinan",
      "tuguegarao",
      "amanpulo",
    ],
  },
  "TAL-RANDY": {
    baseCity: "Ortigas / Mandaluyong & Pampanga",
    coverageArea: "Ortigas (SM Megamall / Mandaluyong), Pasig & Pampanga (Angeles / Marquee)",
    zoneIds: ["ORTIGAS_MANDALUYONG_PASIG", "CENTRAL_LUZON_CLARK_PAMPANGA"],
    extraKeywords: ["megamall", "ortigas", "mandaluyong", "pasig", "marquee", "pampanga", "clark"],
  },
  "TAL-RICHARD": {
    baseCity: "Mandaluyong & Manila",
    coverageArea: "Mandaluyong (Boni / Light / Ortigas), Manila (San Lazaro) & Quezon City",
    zoneIds: ["ORTIGAS_MANDALUYONG_PASIG", "MANILA_CENTRAL", "QUEZON_CITY_NORTH_MMR"],
    extraKeywords: ["mandaluyong", "light", "ortigas", "san lazaro", "manila", "quezon city"],
  },
  "TAL-ROY": {
    baseCity: "Makati, BGC, Mandaluyong & QC",
    coverageArea: "Makati (One Ayala), BGC (SM Aura), Mandaluyong (Fame / Ortigas) & Quezon City (Novaliches)",
    zoneIds: ["MAKATI_BGC_PASAY", "ORTIGAS_MANDALUYONG_PASIG", "QUEZON_CITY_NORTH_MMR"],
    extraKeywords: ["makati", "one ayala", "bgc", "aura", "taguig", "fame", "mandaluyong", "novaliches", "quezon city"],
  },
  "TAL-TERRY": {
    baseCity: "Clark / Pampanga & South Metro Manila",
    coverageArea: "Pampanga (Clark / San Fernando / Marquee), Pangasinan (Rosales) & Las Piñas / Alabang (Southmall)",
    zoneIds: [
      "CENTRAL_LUZON_CLARK_PAMPANGA",
      "SOUTH_METRO_PARANAQUE_ALABANG",
      "NORTH_LUZON_BAGUIO_PANGASINAN",
    ],
    extraKeywords: [
      "clark",
      "pampanga",
      "san fernando",
      "marquee",
      "rosales",
      "pangasinan",
      "southmall",
      "las pinas",
      "alabang",
    ],
  },
  "TAL-VIC": {
    baseCity: "Quezon City, Caloocan, Rizal & Manila",
    coverageArea: "Quezon City (Fairview / Novaliches), Caloocan, San Mateo Rizal, Bulacan (SJDM) & Manila",
    zoneIds: ["QUEZON_CITY_NORTH_MMR", "MANILA_CENTRAL", "CENTRAL_LUZON_CLARK_PAMPANGA"],
    extraKeywords: [
      "fairview",
      "novaliches",
      "quezon city",
      "caloocan",
      "san mateo",
      "rizal",
      "san jose",
      "bulacan",
      "san lazaro",
      "manila",
    ],
  },
  "TAL-FRED": {
    baseCity: "Nueva Ecija & Central Luzon",
    coverageArea: "Cabanatuan, Nueva Ecija & Central Luzon",
    zoneIds: ["CENTRAL_LUZON_CLARK_PAMPANGA"],
    extraKeywords: ["cabanatuan", "nueva ecija", "central luzon"],
  },
  "TAL-PATRICK": {
    baseCity: "Angeles / Pampanga",
    coverageArea: "Angeles City, Marquee Mall & Clark, Pampanga",
    zoneIds: ["CENTRAL_LUZON_CLARK_PAMPANGA"],
    extraKeywords: ["marquee", "angeles", "clark", "pampanga"],
  },
  "TAL-PETER": {
    baseCity: "Pasay, Makati, BGC & Parañaque",
    coverageArea: "Pasay (MOA), Parañaque (Sucat), Makati (One Ayala), BGC (SM Aura) & Mandaluyong",
    zoneIds: ["MAKATI_BGC_PASAY", "SOUTH_METRO_PARANAQUE_ALABANG", "ORTIGAS_MANDALUYONG_PASIG"],
    extraKeywords: ["moa", "pasay", "sucat", "paranaque", "one ayala", "makati", "aura", "bgc", "light"],
  },
  "TAL-REY": {
    baseCity: "Quezon City",
    coverageArea: "Quezon City (Timog / South Triangle / Mplace) & Metro Manila",
    zoneIds: ["QUEZON_CITY_NORTH_MMR"],
    extraKeywords: ["quezon city", "mplace", "timog"],
  },
};

export function toDateKey(input: string | Date | null | undefined): string {
  if (!input) return "";
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatShortHolidayDate(dateKey: string): string {
  if (!dateKey) return "";
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return dateKey;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatFullHolidayDate(dateKey: string): string {
  if (!dateKey) return "";
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return dateKey;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime12h(time24?: string | null): string {
  if (!time24) return "";
  const parts = String(time24).trim().split(":");
  const h = parseInt(parts[0] || "14", 10);
  const m = parts[1] || "00";
  if (isNaN(h)) return String(time24);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

function detectClientZones(locationQuery: string): {
  matchedZones: ZoneDefinition[];
  normalizedQuery: string;
  tokens: string[];
} {
  const normalizedQuery = (locationQuery || "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedQuery) {
    return { matchedZones: [], normalizedQuery: "", tokens: [] };
  }

  const tokens = normalizedQuery
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !["sm", "city", "mall", "the", "and", "in", "at", "near"].includes(t));

  const matchedZones = LOCATION_ZONES.filter((zone) =>
    zone.keywords.some(
      (kw) =>
        normalizedQuery.includes(kw) ||
        tokens.some((tok) => tok.length >= 3 && kw.includes(tok))
    )
  );

  return { matchedZones, normalizedQuery, tokens };
}

function resolveSantaCoverageProfile(talent: any) {
  const canonical = String(talent?.canonicalId || "").toUpperCase();
  const def = DEFAULT_SANTA_COVERAGE_BY_CANONICAL[canonical];
  const customAddress = typeof talent?.address === "string" ? talent.address.trim() : "";

  const baseCity = customAddress || def?.baseCity || "Metro Manila & Nationwide";
  const coverageArea = customAddress
    ? def?.coverageArea && !def.coverageArea.toLowerCase().includes(customAddress.toLowerCase())
      ? `${customAddress} • ${def.coverageArea}`
      : customAddress
    : def?.coverageArea || "Metro Manila (NCR) & Nationwide Holiday Appearances";

  const zoneIds = new Set<string>(def?.zoneIds || []);
  const keywords = new Set<string>(def?.extraKeywords || []);

  if (customAddress) {
    const customDetected = detectClientZones(customAddress);
    customDetected.matchedZones.forEach((z) => zoneIds.add(z.id));
    customDetected.tokens.forEach((t) => keywords.add(t));
  }

  // Also harvest venue keywords from historical assignments if present
  const rawAssignments = Array.isArray(talent?.assignments) ? talent.assignments : [];
  rawAssignments.forEach((a: any) => {
    const venue = a?.booking?.mallOrVenue || a?.mallOrVenue || "";
    const city = a?.booking?.city || a?.city || "";
    const combined = `${venue} ${city}`.trim();
    if (combined) {
      const detected = detectClientZones(combined);
      detected.matchedZones.forEach((z) => zoneIds.add(z.id));
      detected.tokens.forEach((t) => keywords.add(t));
    }
  });

  // Expand zone keywords
  zoneIds.forEach((zId) => {
    const z = LOCATION_ZONES.find((item) => item.id === zId);
    if (z) {
      z.keywords.forEach((kw) => keywords.add(kw));
    }
  });

  return {
    baseCity,
    coverageArea,
    zoneIds: Array.from(zoneIds),
    coverageKeywords: Array.from(keywords),
  };
}

export function scoreSantaLocationMatch(
  talent: any,
  locationQuery: string
): SantaLocationMatch {
  const cleanLocation = (locationQuery || "").trim();
  if (!cleanLocation) {
    return {
      isNearClient: false,
      matchScore: 0,
      matchedAreaLabel: null,
      badgeText: null,
      tier: "NATIONWIDE",
    };
  }

  const profile = resolveSantaCoverageProfile(talent);
  const { matchedZones, normalizedQuery, tokens } = detectClientZones(cleanLocation);

  let score = 0;
  let matchedLabel: string | null = null;

  // 1. Direct keyword / city token match against Santa's custom address, baseCity, coverageArea, or extraKeywords
  const searchableProfileText = `${profile.baseCity} ${profile.coverageArea} ${profile.coverageKeywords.join(" ")}`.toLowerCase();

  for (const tok of tokens) {
    if (tok.length >= 3 && searchableProfileText.includes(tok)) {
      score += 45;
      if (!matchedLabel) {
        matchedLabel = cleanLocation;
      }
    }
  }

  // 2. Zone-level match
  for (const clientZone of matchedZones) {
    if (profile.zoneIds.includes(clientZone.id)) {
      score += 60;
      matchedLabel = clientZone.label;
    } else {
      // Check if same broad region group (e.g. both inside NCR)
      const sharesRegionGroup = profile.zoneIds.some((zId) => {
        const z = LOCATION_ZONES.find((item) => item.id === zId);
        return z && z.regionGroup === clientZone.regionGroup;
      });
      if (sharesRegionGroup) {
        score += 25;
        if (!matchedLabel) matchedLabel = clientZone.label;
      }
    }
  }

  // 3. Broad "metro manila" or "ncr" query matches all NCR Santas
  if (
    score === 0 &&
    (normalizedQuery.includes("metro manila") || normalizedQuery.includes("ncr"))
  ) {
    const hasNcr = profile.zoneIds.some((id) =>
      [
        "MAKATI_BGC_PASAY",
        "ORTIGAS_MANDALUYONG_PASIG",
        "QUEZON_CITY_NORTH_MMR",
        "MANILA_CENTRAL",
        "SOUTH_METRO_PARANAQUE_ALABANG",
      ].includes(id)
    );
    if (hasNcr) {
      score = 40;
      matchedLabel = "Metro Manila (NCR)";
    }
  }

  if (score >= 45) {
    return {
      isNearClient: true,
      matchScore: score,
      matchedAreaLabel: matchedLabel || profile.baseCity,
      badgeText: `Recommended Near ${cleanLocation}`,
      tier: "EXACT_CITY",
    };
  }

  if (score >= 25) {
    return {
      isNearClient: true,
      matchScore: score,
      matchedAreaLabel: matchedLabel || profile.baseCity,
      badgeText: `Nearby Metro / Regional Match`,
      tier: "NEARBY_ZONE",
    };
  }

  return {
    isNearClient: false,
    matchScore: 10,
    matchedAreaLabel: profile.baseCity,
    badgeText: null,
    tier: "NATIONWIDE",
  };
}

function collectSanitizedSlotsForTalent(
  talent: any,
  allBookings?: any[]
): SanitizedBookingSlot[] {
  const slotMap = new Map<string, SanitizedBookingSlot>();

  const addSlot = (rawBooking: any, assignmentStatus?: string) => {
    if (!rawBooking) return;
    const bStatus = String(rawBooking.status || assignmentStatus || "CONFIRMED").toUpperCase();
    const aStatus = String(assignmentStatus || "CONFIRMED").toUpperCase();
    if (
      bStatus === "CANCELLED" ||
      bStatus === "DECLINED" ||
      aStatus === "CANCELLED" ||
      aStatus === "DECLINED" ||
      aStatus === "REASSIGNED"
    ) {
      return;
    }

    const dateKey = toDateKey(rawBooking.eventDate);
    if (!dateKey) return;

    const startTime = rawBooking.startTime || "14:00";
    const endTime = rawBooking.endTime || "18:00";
    const durationHours = Number(rawBooking.durationHours || 4);
    const timeRangeLabel = `${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
    const dedupeKey = `${dateKey}_${startTime}_${endTime}`;

    if (!slotMap.has(dedupeKey)) {
      slotMap.set(dedupeKey, {
        eventDate: dateKey,
        startTime,
        endTime,
        durationHours,
        timeRangeLabel,
        status: bStatus,
      });
    }
  };

  // 1. From talent.assignments
  if (Array.isArray(talent?.assignments)) {
    talent.assignments.forEach((a: any) => {
      addSlot(a?.booking || a, a?.status);
    });
  }

  // 2. From talent.publicSchedule (sanitized public API payload)
  if (Array.isArray(talent?.publicSchedule)) {
    talent.publicSchedule.forEach((s: any) => {
      addSlot(s, s?.status);
    });
  }

  // 3. From allBookings (if provided by caller / StaticApiFallback)
  if (Array.isArray(allBookings)) {
    allBookings.forEach((b: any) => {
      const tAssignments = Array.isArray(b?.talentAssignments) ? b.talentAssignments : [];
      const matchesTalent = tAssignments.some(
        (ta: any) =>
          ta?.talentId === talent?.id ||
          ta?.talent?.id === talent?.id ||
          (ta?.talent?.canonicalId && ta.talent.canonicalId === talent?.canonicalId) ||
          (ta?.talent?.displayName &&
            talent?.displayName &&
            String(ta.talent.displayName).toLowerCase() ===
              String(talent.displayName).toLowerCase())
      );
      if (matchesTalent) {
        addSlot(b, "CONFIRMED");
      }
    });
  }

  return Array.from(slotMap.values()).sort((a, b) =>
    a.eventDate.localeCompare(b.eventDate)
  );
}

function computeNextAvailableDates(
  targetDateKey: string,
  bookedDateSet: Set<string>,
  count = 4
): NextAvailableDateOption[] {
  const results: NextAvailableDateOption[] = [];
  if (!targetDateKey) return results;

  const [y, m, d] = targetDateKey.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return results;

  const baseDate = new Date(y, m - 1, d);
  // Check nearby dates (+1, -1, +2, -2, +3, +4, +5, +6, +7...)
  const offsets = [1, -1, 2, -2, 3, -3, 4, 5, 6, 7, 8, 9, 10, 14];
  const seen = new Set<string>();

  for (const offset of offsets) {
    if (results.length >= count) break;
    const candidate = new Date(baseDate);
    candidate.setDate(candidate.getDate() + offset);
    const key = toDateKey(candidate);
    if (!key || key === targetDateKey || seen.has(key)) continue;
    seen.add(key);

    if (!bookedDateSet.has(key)) {
      results.push({
        date: key,
        shortLabel: formatShortHolidayDate(key),
      });
    }
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

export function evaluateSantaAvailabilityForDate(
  rawTalents: any[],
  dateInput: string,
  locationQuery = "",
  allBookings?: any[],
  options?: { includeUnapproved?: boolean }
): {
  summary: AvailabilityEvaluationSummary;
  santas: EvaluatedSantaAvailability[];
} {
  const targetDateKey = toDateKey(dateInput);
  const cleanLocation = (locationQuery || "").trim();

  const filteredTalents = (Array.isArray(rawTalents) ? rawTalents : []).filter((t) => {
    if (!t) return false;
    if (String(t.status || "ACTIVE").toUpperCase() === "INACTIVE") return false;
    if (options?.includeUnapproved) return true;
    return Boolean(t.approvedForPublicDisplay);
  });

  const evaluated: EvaluatedSantaAvailability[] = filteredTalents.map((talent) => {
    const profile = resolveSantaCoverageProfile(talent);
    const allSlots = collectSanitizedSlotsForTalent(talent, allBookings);
    const bookedDateSet = new Set(allSlots.map((s) => s.eventDate));

    const bookedSlotsOnTarget = targetDateKey
      ? allSlots.filter((s) => s.eventDate === targetDateKey)
      : [];

    const isAvailableOnDate = bookedSlotsOnTarget.length === 0;
    const locationMatch = scoreSantaLocationMatch(talent, cleanLocation);

    const images = Array.isArray(talent.images)
      ? talent.images.filter((img: any) => img && img.approvedForClient !== false)
      : [];
    const primaryImg =
      images.find(
        (img: any) =>
          img.isPrimary &&
          !String(img.publicUrl || "").match(/\.(mp4|webm|mov|m4v)(\?|$)/i) &&
          !String(img.publicUrl || "").startsWith("data:video/")
      ) ||
      images.find(
        (img: any) =>
          !String(img.publicUrl || "").match(/\.(mp4|webm|mov|m4v)(\?|$)/i) &&
          !String(img.publicUrl || "").startsWith("data:video/")
      );

    const primaryImageUrl =
      primaryImg?.publicUrl || "/talents/Bob_Hamilton/bob_photo_1.jpg";

    const referenceDateKey = targetDateKey || "2026-10-01";
    const upcomingBookedDates = allSlots
      .filter((s) => s.eventDate >= referenceDateKey)
      .slice(0, 6)
      .map((s) => ({
        date: s.eventDate,
        shortLabel: formatShortHolidayDate(s.eventDate),
        timeRangeLabel: s.timeRangeLabel,
      }));

    const nextAvailableDates = computeNextAvailableDates(
      targetDateKey || "2026-12-15",
      bookedDateSet,
      4
    );

    return {
      id: talent.id,
      canonicalId: talent.canonicalId,
      displayName: talent.displayName,
      talentType: talent.talentType || "REAL_BEARD",
      status: talent.status || "ACTIVE",
      age: talent.age ?? null,
      height: talent.height ?? null,
      nationality: talent.nationality ?? null,
      bio: talent.bio ?? null,
      address: talent.address ?? null,
      approvedForPublicDisplay: Boolean(talent.approvedForPublicDisplay),
      primaryImageUrl,
      images,
      baseCity: profile.baseCity,
      coverageArea: profile.coverageArea,
      coverageKeywords: profile.coverageKeywords,
      isAvailableOnDate,
      statusLabel: isAvailableOnDate ? "AVAILABLE" : "ALREADY_BOOKED",
      bookedSlots: bookedSlotsOnTarget,
      openWindowsLabel: isAvailableOnDate
        ? "Morning (9AM–12PM) • Afternoon (2PM–6PM) • Evening (6PM–10PM) Open"
        : `Booked Slot: ${bookedSlotsOnTarget.map((s) => s.timeRangeLabel).join(", ")}`,
      nextAvailableDates,
      upcomingBookedDates,
      locationMatch,
    };
  });

  // Sort:
  // 1. Available & Near Client Location first
  // 2. Available (other locations)
  // 3. Already Booked (Near Client Location first, then others)
  evaluated.sort((a, b) => {
    if (a.isAvailableOnDate !== b.isAvailableOnDate) {
      return a.isAvailableOnDate ? -1 : 1;
    }
    if (a.locationMatch.isNearClient !== b.locationMatch.isNearClient) {
      return a.locationMatch.isNearClient ? -1 : 1;
    }
    if (b.locationMatch.matchScore !== a.locationMatch.matchScore) {
      return b.locationMatch.matchScore - a.locationMatch.matchScore;
    }
    return a.displayName.localeCompare(b.displayName);
  });

  const availableCount = evaluated.filter((s) => s.isAvailableOnDate).length;
  const bookedCount = evaluated.length - availableCount;
  const nearbyAvailableCount = evaluated.filter(
    (s) => s.isAvailableOnDate && s.locationMatch.isNearClient
  ).length;

  return {
    summary: {
      date: targetDateKey,
      formattedDate: targetDateKey
        ? formatFullHolidayDate(targetDateKey)
        : "All Holiday Season Dates",
      locationQuery: cleanLocation,
      totalPublicSantas: evaluated.length,
      availableCount,
      bookedCount,
      nearbyAvailableCount,
    },
    santas: evaluated,
  };
}
