export type SantaBeardTier = "REAL_BEARD" | "FAKE_BEARD";
export type SantaRateTerritory = "METRO_MANILA" | "HOLIDAY" | "OUT_OF_TOWN";
export type SantaEventActivityTag =
  | "MEET_AND_GREET"
  | "CHRISTMAS_LAUNCH"
  | "PHOTO_SHOOT"
  | "PRIVATE_PARTY";

export interface SantaRateTierConfig {
  tier: SantaBeardTier;
  label: string;
  badgeText: string;
  metroManilaRate: number;
  holidayRate: number;
  outOfTownRate: number;
  minHours: number;
  extraHourRate: number;
  defaultInternalTalentFee: number;
}

export const SANTA_RATE_CARD: Record<SantaBeardTier, SantaRateTierConfig> = {
  REAL_BEARD: {
    tier: "REAL_BEARD",
    label: "Real Beard Santa Claus",
    badgeText: "Limited Talents",
    metroManilaRate: 24000,
    holidayRate: 26000,
    outOfTownRate: 26000,
    minHours: 3,
    extraHourRate: 3000,
    defaultInternalTalentFee: 12000,
  },
  FAKE_BEARD: {
    tier: "FAKE_BEARD",
    label: "Fake Beard Santa Claus",
    badgeText: "Standard Roster",
    metroManilaRate: 15000,
    holidayRate: 18000,
    outOfTownRate: 18000,
    minHours: 3,
    extraHourRate: 3000,
    defaultInternalTalentFee: 7000,
  },
};

export const SANTA_EVENT_ACTIVITIES: {
  id: SantaEventActivityTag;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: "MEET_AND_GREET",
    label: "Meet and Greet",
    shortLabel: "Meet & Greet",
    description: "Interactive holiday throne appearance, storytelling & family greetings (Min 3 Hrs)",
  },
  {
    id: "CHRISTMAS_LAUNCH",
    label: "Christmas Launch",
    shortLabel: "Christmas Launch",
    description: "Grand tree lighting ceremony, mall holiday launch & stage reveal (Min 3 Hrs)",
  },
  {
    id: "PHOTO_SHOOT",
    label: "Photo Shoot",
    shortLabel: "Photo Shoot",
    description: "Commercial studio shoot, PR campaign or family portrait session (Min 3 Hrs)",
  },
  {
    id: "PRIVATE_PARTY",
    label: "Private Party",
    shortLabel: "Private Party",
    description: "Exclusive residence gathering, corporate gala or VIP gift-giving (Min 3 Hrs)",
  },
];

export interface SantaPackageQuoteInput {
  santaTier?: SantaBeardTier;
  rateTerritory?: SantaRateTerritory;
  isProvincial?: boolean;
  isHoliday?: boolean;
  durationHours?: number;
  eventActivityTag?: SantaEventActivityTag;
}

export interface SantaPackageQuoteResult {
  santaTier: SantaBeardTier;
  santaTierLabel: string;
  rateTerritory: SantaRateTerritory;
  rateTerritoryLabel: string;
  eventActivityTag: SantaEventActivityTag;
  eventActivityLabel: string;
  minHours: number;
  durationHours: number;
  extraHours: number;
  baseRate: number;
  extraHourRate: number;
  extraHourCharge: number;
  totalQuotedRate: number;
  depositRequired: number;
  balanceAmount: number;
  defaultInternalTalentFee: number;
  tags: string[];
}

export function calculateSantaPackageQuote(
  input: SantaPackageQuoteInput
): SantaPackageQuoteResult {
  const tier: SantaBeardTier =
    input.santaTier === "FAKE_BEARD" ? "FAKE_BEARD" : "REAL_BEARD";
  const cfg = SANTA_RATE_CARD[tier];

  let territory: SantaRateTerritory = input.rateTerritory || "METRO_MANILA";
  if (!input.rateTerritory) {
    if (input.isHoliday) territory = "HOLIDAY";
    else if (input.isProvincial) territory = "OUT_OF_TOWN";
  }

  let baseRate = cfg.metroManilaRate;
  let rateTerritoryLabel = "Metro Manila Rate";
  if (territory === "HOLIDAY") {
    baseRate = cfg.holidayRate;
    rateTerritoryLabel = "Holiday Rate";
  } else if (territory === "OUT_OF_TOWN") {
    baseRate = cfg.outOfTownRate;
    rateTerritoryLabel = "Out of Town Rate";
  }

  const rawHours = Number(input.durationHours || 3);
  const durationHours = Math.max(cfg.minHours, rawHours);
  const extraHours = Math.max(0, durationHours - cfg.minHours);
  const extraHourCharge = extraHours * cfg.extraHourRate;
  const totalQuotedRate = baseRate + extraHourCharge;
  const depositRequired = Math.round(totalQuotedRate * 0.5);
  const balanceAmount = totalQuotedRate - depositRequired;

  const activityObj =
    SANTA_EVENT_ACTIVITIES.find((a) => a.id === input.eventActivityTag) ||
    SANTA_EVENT_ACTIVITIES[0];

  const tags: string[] = [
    tier === "REAL_BEARD" ? "Real Beard • Limited" : "Fake Beard",
    rateTerritoryLabel,
    activityObj.shortLabel,
    extraHours > 0
      ? `${durationHours} Hrs (+₱${extraHourCharge.toLocaleString()})`
      : `Min 3 Hrs`,
  ];

  return {
    santaTier: tier,
    santaTierLabel: cfg.label,
    rateTerritory: territory,
    rateTerritoryLabel,
    eventActivityTag: activityObj.id,
    eventActivityLabel: activityObj.label,
    minHours: cfg.minHours,
    durationHours,
    extraHours,
    baseRate,
    extraHourRate: cfg.extraHourRate,
    extraHourCharge,
    totalQuotedRate,
    depositRequired,
    balanceAmount,
    defaultInternalTalentFee: cfg.defaultInternalTalentFee,
    tags,
  };
}

export interface CostEstimateInput {
  clientQuotedAmount: number; // in PHP
  internalTalentFee?: number;
  internalPaFee?: number;
  transportAllowance?: number;
  wardrobeAllowance?: number;
  otherDirectCosts?: number;
  discountAmount?: number;
  depositPercentage?: number; // default 50
}

export interface CostEstimateResult {
  clientQuotedAmount: number;
  internalTalentFee: number;
  internalPaFee: number;
  transportAllowance: number;
  wardrobeAllowance: number;
  otherDirectCosts: number;
  discountAmount: number;
  netClientAmount: number;
  totalDirectCost: number;
  grossProfit: number;
  grossMarginPercent: number;
  depositAmount: number;
  balanceAmount: number;
}

export function calculateCosting(input: CostEstimateInput): CostEstimateResult {
  const quote = Math.round((input.clientQuotedAmount || 0) * 100) / 100;
  const tf = Math.round((input.internalTalentFee || 0) * 100) / 100;
  const pa = Math.round((input.internalPaFee || 0) * 100) / 100;
  const transpo = Math.round((input.transportAllowance || 0) * 100) / 100;
  const wardrobe = Math.round((input.wardrobeAllowance || 0) * 100) / 100;
  const other = Math.round((input.otherDirectCosts || 0) * 100) / 100;
  const discount = Math.round((input.discountAmount || 0) * 100) / 100;

  const netClientAmount = Math.max(0, quote - discount);
  const totalDirectCost = tf + pa + transpo + wardrobe + other;
  const grossProfit = netClientAmount - totalDirectCost;

  let grossMarginPercent = 0;
  if (netClientAmount > 0) {
    grossMarginPercent = Math.round((grossProfit / netClientAmount) * 10000) / 100;
  }

  const depositPct = input.depositPercentage ?? 50.0;
  // Centavo-safe deposit calculation
  const depositAmount = Math.round(netClientAmount * (depositPct / 100) * 100) / 100;
  const balanceAmount = Math.round((netClientAmount - depositAmount) * 100) / 100;

  return {
    clientQuotedAmount: quote,
    internalTalentFee: tf,
    internalPaFee: pa,
    transportAllowance: transpo,
    wardrobeAllowance: wardrobe,
    otherDirectCosts: other,
    discountAmount: discount,
    netClientAmount,
    totalDirectCost,
    grossProfit,
    grossMarginPercent,
    depositAmount,
    balanceAmount,
  };
}

export function getTargetGuidance(
  isProvincial: boolean,
  isHoliday: boolean,
  santaTier: SantaBeardTier = "REAL_BEARD",
  durationHours: number = 3
): {
  targetEstimate: number;
  targetRangeText: string;
  depositRequired: number;
  notes: string;
} {
  const pkg = calculateSantaPackageQuote({
    santaTier,
    isProvincial,
    isHoliday,
    durationHours,
  });

  return {
    targetEstimate: pkg.totalQuotedRate,
    targetRangeText: `₱${pkg.totalQuotedRate.toLocaleString()} (${pkg.santaTierLabel} • ${pkg.rateTerritoryLabel} • ${pkg.durationHours} hrs)`,
    depositRequired: pkg.depositRequired,
    notes: `${pkg.santaTierLabel} (${pkg.rateTerritoryLabel}, Min 3 hrs + ₱3,000/extra hr). Activity: ${pkg.eventActivityLabel}.`,
  };
}
