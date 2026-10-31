import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  calculateSantaPackageQuote,
  SantaBeardTier,
  SantaRateTerritory,
  SantaEventActivityTag,
} from "@/lib/costing";
import { sendEmail } from "@/lib/email-service";
import { sendTransactionalEmail } from "@/lib/mailer";
import { templateProposalInquiry } from "@/lib/email-templates-branded";

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

    // Prepare Branded Responsive Proposal & Inquiry Acknowledgment Email
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://brilloevent.com";
    const fullProposalUrl = `${appOrigin}${statusPortalPath}`;

    const { subject: brandedSubject, html: brandedHtml } = templateProposalInquiry({
      clientName: effectiveContact,
      eventType: eventName || `${effectiveVenue} — ${pkg.eventActivityLabel}`,
      proposalNumber: bookingNumber,
      proposalLink: fullProposalUrl,
      eventDate: parsedDate.toDateString(),
      venue: effectiveVenue,
      packageName: `${pkg.santaTierLabel} (${pkg.eventActivityLabel} • ${pkg.durationHours} Hours)`,
      totalAmount: finalContractAmount.toLocaleString(),
      depositAmount: finalDepositRequired.toLocaleString(),
    });

    // 1. Send Branded Confirmation to Customer's Email Address
    await sendTransactionalEmail({
      to: email,
      subject: brandedSubject,
      html: brandedHtml,
      text: `Dear ${effectiveContact},\n\nThank you for requesting a Santa Claus quotation from Brillo Events Management Services for ${effectiveVenue} on ${parsedDate.toDateString()}.\n\nReference Number: ${bookingNumber}\nTotal Amount: PHP ${finalContractAmount.toLocaleString()}\n50% Downpayment Required: PHP ${finalDepositRequired.toLocaleString()}\n\nView details: ${fullProposalUrl}`,
    }).catch((err) => console.warn("[Quote Mailer Client Warning]:", err));

    // 2. Send Inbound Booking Alert Copy to Operations Inbox (bookings@brilloevent.com)
    await sendTransactionalEmail({
      to: "bookings@brilloevent.com",
      subject: `🎄 NEW INQUIRY ALERT: ${effectiveVenue} (${bookingNumber}) — PHP ${finalContractAmount.toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #FAF7F5; border: 2px solid #780D22; border-radius: 12px;">
          <h2 style="color: #780D22; margin-top: 0;">New Inbound Customer Inquiry</h2>
          <p>A customer has submitted a new Santa booking inquiry through the public website.</p>
          <div style="background: #FFF; padding: 16px; border: 1px solid #E8DFE0; border-radius: 8px; font-size: 13px; line-height: 1.6;">
            <strong>Booking Ref:</strong> ${bookingNumber}<br>
            <strong>Client Contact:</strong> ${effectiveContact}<br>
            <strong>Company / Organization:</strong> ${effectiveCompany}<br>
            <strong>Client Email:</strong> <a href="mailto:${email}">${email}</a><br>
            <strong>Client Phone:</strong> ${phone}<br>
            <strong>Venue / Mall:</strong> ${effectiveVenue}<br>
            <strong>Event Date:</strong> ${parsedDate.toDateString()} (${startTime} - ${endTime})<br>
            <strong>Package:</strong> ${pkg.santaTierLabel} • ${pkg.eventActivityLabel} (${pkg.durationHours} hrs)<br>
            <strong>Quoted Total:</strong> PHP ${finalContractAmount.toLocaleString()} (50% DP: PHP ${finalDepositRequired.toLocaleString()})<br>
            <strong>Special Requests:</strong> ${combinedRequests || "None specified"}<br>
          </div>
          <div style="margin-top: 20px;">
            <a href="${appOrigin}/admin/bookings" style="display: inline-block; background: #780D22; color: #FFF; font-weight: bold; font-size: 13px; padding: 10px 20px; text-decoration: none; border-radius: 8px;">OPEN IN ADMIN COMMAND CENTER →</a>
          </div>
        </div>
      `,
    }).catch((err) => console.warn("[Quote Mailer Admin Alert Warning]:", err));

    // 3. Log to SQLite Email Service for unified auditing
    await sendEmail({
      to: email,
      subject: brandedSubject,
      bodyText: `Inquiry confirmation dispatched to ${email} (Booking: ${bookingNumber})`,
      bookingId: booking.id,
      clientId: client.id,
    }).catch(() => {});

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
