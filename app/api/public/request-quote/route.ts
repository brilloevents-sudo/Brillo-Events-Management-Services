import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  calculateSantaPackageQuote,
  SantaBeardTier,
  SantaRateTerritory,
  SantaEventActivityTag,
} from "@/lib/costing";
import { sendEmail } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientName,
      contactPerson,
      companyName,
      email,
      phone,
      bookingType = "CORPORATE",
      eventName,
      eventDate,
      startTime = "14:00",
      endTime = "17:00",
      durationHours = 3,
      venueName,
      mallOrVenue,
      venueAddress,
      city,
      locationCity,
      province,
      isProvincial = false,
      santaTier = "REAL_BEARD",
      rateTerritory,
      eventActivityTag = "MEET_AND_GREET",
      clientQuotedAmount,
      audienceSize,
      specialRequests,
      notes,
      talentPreferenceId,
      consentAgreed = true,
    } = body;

    const effectiveContact = clientName || contactPerson || "Client Contact";
    const effectiveVenue = venueName || mallOrVenue || companyName || "Corporate Venue";
    const effectiveCompany = companyName || mallOrVenue || venueName || effectiveContact;
    const effectiveCity = city || locationCity || (isProvincial ? "Out of Town / Provincial" : "Metro Manila");

    if (!effectiveContact || !email || !phone || !effectiveVenue || !eventDate) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required contact and event fields." },
        { status: 400 }
      );
    }

    if (consentAgreed === false) {
      return NextResponse.json(
        { success: false, error: "Please acknowledge the privacy terms to proceed." },
        { status: 400 }
      );
    }

    const rawDate = new Date(eventDate);
    const parsedDate = new Date(
      Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate(), 12, 0, 0)
    );
    const isHolidayDate =
      (parsedDate.getUTCMonth() === 11 &&
        (parsedDate.getUTCDate() === 24 ||
          parsedDate.getUTCDate() === 25 ||
          parsedDate.getUTCDate() === 30 ||
          parsedDate.getUTCDate() === 31)) ||
      rateTerritory === "HOLIDAY";

    const pkg = calculateSantaPackageQuote({
      santaTier: santaTier as SantaBeardTier,
      rateTerritory: rateTerritory as SantaRateTerritory | undefined,
      isProvincial: Boolean(isProvincial || rateTerritory === "OUT_OF_TOWN"),
      isHoliday: isHolidayDate,
      durationHours: Number(durationHours || 3),
      eventActivityTag: eventActivityTag as SantaEventActivityTag,
    });

    const finalContractAmount =
      clientQuotedAmount !== undefined && Number(clientQuotedAmount) > 0
        ? Number(clientQuotedAmount)
        : pkg.totalQuotedRate;
    const finalDepositRequired = Math.round(finalContractAmount * 0.5);

    // 1. Client record
    let client = await prisma.client.findFirst({
      where: { email },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          companyName: effectiveCompany,
          primaryContact: effectiveContact,
          email,
          phone,
          city: effectiveCity,
          province,
          clientType: bookingType === "PRIVATE" ? "PRIVATE" : "CORPORATE",
        },
      });
    }

    // 2. Booking request
    const count = await prisma.booking.count();
    const bookingNumber = `BR-${new Date().getFullYear()}-Q${String(count + 1).padStart(3, "0")}`;
    const secureToken = `req_${Math.random().toString(36).substring(2, 14)}`;

    const ledgerMeta = {
      santaTier: pkg.santaTier,
      santaTierLabel: pkg.santaTierLabel,
      rateTerritory: pkg.rateTerritory,
      rateTerritoryLabel: pkg.rateTerritoryLabel,
      eventActivityTag: pkg.eventActivityTag,
      eventActivityLabel: pkg.eventActivityLabel,
      durationHours: pkg.durationHours,
      extraHours: pkg.extraHours,
      extraHourCharge: pkg.extraHourCharge,
      baseRate: pkg.baseRate,
      tags: pkg.tags,
      dpStatus: "Pending",
      collectiblesStatus: "Pending",
      contractStatus: "Quotation Requested",
    };

    const combinedRequests = [
      `[${pkg.santaTierLabel} • ${pkg.eventActivityLabel} • ${pkg.rateTerritoryLabel} • ${pkg.durationHours} Hrs]`,
      specialRequests || notes || "",
    ]
      .filter(Boolean)
      .join(" — ");

    const internalNotesWithMeta = `${
      notes || `Quotation Request from ${effectiveContact} (${effectiveCompany})`
    } ||LEDGER_META:${JSON.stringify(ledgerMeta)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        secureToken,
        clientId: client.id,
        bookingType: bookingType === "PRIVATE" ? "PRIVATE" : "CORPORATE",
        eventName: eventName || `${effectiveVenue} — ${pkg.eventActivityLabel}`,
        eventDate: parsedDate,
        startTime,
        endTime,
        callTime: "13:00",
        durationHours: pkg.durationHours,
        mallOrVenue: effectiveVenue,
        venueAddress,
        city: effectiveCity,
        province,
        isProvincial: pkg.rateTerritory === "OUT_OF_TOWN",
        isHoliday: pkg.rateTerritory === "HOLIDAY",
        expectedAudience: audienceSize,
        specialRequests: combinedRequests,
        internalNotes: internalNotesWithMeta,
        status: "INQUIRY_RECEIVED",
        pipelineStage: 1,
        totalContractAmount: finalContractAmount,
        depositRequired: finalDepositRequired,
        depositPaid: 0,
        balanceDue: finalContractAmount,
        totalDirectCost: pkg.defaultInternalTalentFee,
        projectedGrossProfit: Math.max(0, finalContractAmount - pkg.defaultInternalTalentFee),
      },
      include: {
        client: true,
      },
    });

    // If client requested a specific talent
    if (talentPreferenceId) {
      const talent = await prisma.talent.findUnique({
        where: { id: talentPreferenceId },
      });
      if (talent) {
        await prisma.talentAssignment.create({
          data: {
            bookingId: booking.id,
            talentId: talent.id,
            agreedTalentFee: talent.baseTalentFee || pkg.defaultInternalTalentFee,
            status: "PENDING",
            notes: "Client requested talent preference during quotation intake.",
          },
        });
      }
    }

    // Also create initial Quote record for /admin/quotes
    const quoteCount = await prisma.quote.count();
    await prisma.quote.create({
      data: {
        quoteNumber: `QT-${new Date().getFullYear()}-${String(quoteCount + 1).padStart(3, "0")}`,
        bookingId: booking.id,
        clientId: client.id,
        version: 1,
        status: "DRAFT",
        clientQuotedAmount: finalContractAmount,
        internalTalentFee: pkg.defaultInternalTalentFee,
        internalPaFee: 1500,
        transportAllowance: pkg.rateTerritory === "OUT_OF_TOWN" ? 2500 : 0,
        wardrobeAllowance: 0,
        discountAmount: 0,
        totalDirectCost: pkg.defaultInternalTalentFee + 1500,
        grossProfit: Math.max(0, finalContractAmount - (pkg.defaultInternalTalentFee + 1500)),
        grossMarginPercent:
          finalContractAmount > 0
            ? Math.round(
                ((finalContractAmount - (pkg.defaultInternalTalentFee + 1500)) /
                  finalContractAmount) *
                  10000
              ) / 100
            : 0,
        depositPercentage: 50,
        depositAmount: finalDepositRequired,
        balanceAmount: finalContractAmount - finalDepositRequired,
      },
    });

    const statusPortalPath = `/request-status?token=${encodeURIComponent(
      secureToken
    )}&booking=${encodeURIComponent(bookingNumber)}&amount=${finalContractAmount}&venue=${encodeURIComponent(
      effectiveVenue
    )}`;

    await sendEmail({
      to: email,
      subject: `We Received Your Santa Quotation Request — ${effectiveVenue} (${bookingNumber})`,
      bodyText: `Dear ${effectiveContact},\n\nThank you for requesting a Santa Claus quotation from Brillo Events Management Services for ${effectiveVenue} on ${parsedDate.toDateString()}.\n\nPackage Selected: ${pkg.santaTierLabel} (${pkg.eventActivityLabel} • ${pkg.rateTerritoryLabel} • ${pkg.durationHours} Hours)\nEstimated Package Rate: PHP ${finalContractAmount.toLocaleString()} (50% Downpayment: PHP ${finalDepositRequired.toLocaleString()})\nReference Number: ${bookingNumber}\n\nWarm regards,\nBrillo Events Management Services`,
      bookingId: booking.id,
      clientId: client.id,
    });

    return NextResponse.json({
      success: true,
      booking,
      bookingId: booking.id,
      bookingNumber,
      secureToken,
      lookupToken: secureToken,
      statusUrl: statusPortalPath,
      packageQuote: pkg,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
