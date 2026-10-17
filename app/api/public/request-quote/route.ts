import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTargetGuidance } from "@/lib/costing";
import { sendEmail } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientName,
      companyName,
      email,
      phone,
      bookingType = "CORPORATE",
      eventName,
      eventDate,
      startTime = "14:00",
      endTime = "18:00",
      durationHours = 4,
      venueName,
      venueAddress,
      city,
      province,
      isProvincial = false,
      audienceSize,
      specialRequests,
      talentPreferenceId,
      consentAgreed,
    } = body;

    if (!clientName || !email || !phone || !venueName || !eventDate) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required contact and event fields." },
        { status: 400 }
      );
    }

    if (!consentAgreed) {
      return NextResponse.json(
        { success: false, error: "Please acknowledge the privacy terms to proceed." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);
    const isHoliday =
      parsedDate.getMonth() === 11 &&
      (parsedDate.getDate() === 24 || parsedDate.getDate() === 25);

    const guidance = getTargetGuidance(Boolean(isProvincial), isHoliday);

    // 1. Client record
    let client = await prisma.client.findFirst({
      where: { email },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          companyName: companyName || clientName,
          primaryContact: clientName,
          email,
          phone,
          city,
          province,
          clientType: bookingType === "CORPORATE" ? "CORPORATE" : "PRIVATE",
        },
      });
    }

    // 2. Booking request
    const count = await prisma.booking.count();
    const bookingNumber = `BR-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    const secureToken = `req_${Math.random().toString(36).substring(2, 14)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        secureToken,
        clientId: client.id,
        bookingType,
        eventName: eventName || `${venueName} Santa Appearance`,
        eventDate: parsedDate,
        startTime,
        endTime,
        durationHours: Number(durationHours),
        mallOrVenue: venueName,
        venueAddress,
        city,
        province,
        isProvincial: Boolean(isProvincial),
        isHoliday,
        expectedAudience: audienceSize,
        specialRequests,
        status: "INQUIRY_RECEIVED",
        pipelineStage: 1,
        totalContractAmount: guidance.targetEstimate,
        depositRequired: guidance.depositRequired,
        balanceDue: guidance.targetEstimate,
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
            agreedTalentFee: talent.baseTalentFee || 12000,
            status: "PENDING",
            notes: "Client requested talent preference during intake.",
          },
        });
      }
    }

    // 3. Send automated acknowledgement
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const statusUrl = `${appUrl}/request-status/${secureToken}`;

    await sendEmail({
      to: email,
      subject: `We Received Your Santa Inquiry — ${eventName || venueName}`,
      bodyText: `Dear ${clientName},\n\nThank you for choosing Brillo Events Management Service for your upcoming holiday appearance at ${venueName} on ${parsedDate.toDateString()}.\n\nYour request has been received (Ref: ${bookingNumber}). Our operations team is currently reviewing talent schedules.\n\nYou can track your inquiry status here:\n${statusUrl}\n\nPlease note: Inquiries are non-binding until an official agreement is executed and verified downpayment is received.\n\nWarm regards,\nBrillo Events Management Service`,
      bookingId: booking.id,
      clientId: client.id,
    });

    return NextResponse.json({
      success: true,
      bookingNumber,
      secureToken,
      statusUrl: `/request-status/${secureToken}`,
      startingGuidance: guidance,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
