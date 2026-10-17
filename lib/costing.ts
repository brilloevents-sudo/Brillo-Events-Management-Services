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
  const depositAmount = Math.round((netClientAmount * (depositPct / 100)) * 100) / 100;
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
  isHoliday: boolean
): {
  targetEstimate: number;
  targetRangeText: string;
  depositRequired: number;
  notes: string;
} {
  if (isHoliday) {
    return {
      targetEstimate: 23000,
      targetRangeText: "₱23,000 – ₱30,000",
      depositRequired: 11500,
      notes: "Christmas Eve / Day prime holiday block. Final rate depends on selected talent availability.",
    };
  }

  if (isProvincial) {
    const provincialEstimate = Math.round(18000 * 1.3); // ₱23,400
    return {
      targetEstimate: provincialEstimate,
      targetRangeText: "₱23,400 (Base + 30% provincial factor)",
      depositRequired: Math.round(provincialEstimate * 0.5),
      notes: "Starting estimate for provincial mall/hotel appearances. Travel route and lodging confirmed separately.",
    };
  }

  return {
    targetEstimate: 18000,
    targetRangeText: "₱18,000",
    depositRequired: 9000,
    notes: "Target 4-hour Metro Manila corporate package.",
  };
}
