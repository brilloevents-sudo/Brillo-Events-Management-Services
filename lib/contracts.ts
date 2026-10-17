export interface ContractTemplateData {
  companyName: string;
  clientName: string;
  venueName: string;
  eventDate: string;
  callTime: string;
  startTime: string;
  endTime: string;
  talentName: string;
  talentType: string;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  inclusions: string;
  withDP: boolean;
}

export function generateContractHtml(data: ContractTemplateData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #111; line-height: 1.6;">
      <div style="text-align: center; border-bottom: 2px solid #881337; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #881337; margin: 0; font-size: 24px; text-transform: uppercase;">BRILLO EVENTS MANAGEMENT SERVICE</h1>
        <p style="margin: 4px 0 0; font-size: 14px; color: #555;">Professional Talent Operations &amp; Entertainment Management</p>
        <p style="margin: 2px 0 0; font-size: 13px; color: #777;">Contact: 0927 887 2343 | brilloevents@gmail.com</p>
      </div>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
        <h2 style="font-size: 16px; margin-top: 0; color: #881337; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
          BOOKING AGREEMENT &amp; SERVICE ENGAGEMENT (${data.withDP ? "STANDARD WITH DOWNPAYMENT" : "SPECIAL NO-DOWNPAYMENT CLAUSE"})
        </h2>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; width: 30%; font-weight: bold; color: #4b5563;">Client / Organization:</td>
            <td style="padding: 6px 0;">${data.clientName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Mall / Venue Location:</td>
            <td style="padding: 6px 0;">${data.venueName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Date of Event:</td>
            <td style="padding: 6px 0;">${data.eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Call Time &amp; Schedule:</td>
            <td style="padding: 6px 0;">Call Time: ${data.callTime} | Appearance: ${data.startTime} – ${data.endTime}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Designated Talent:</td>
            <td style="padding: 6px 0;">Santa ${data.talentName} (${data.talentType})</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; color: #111; margin-bottom: 8px;">1. FINANCIAL TERMS &amp; COMPENSATION</h3>
        <p style="font-size: 14px;">The agreed total contract investment for this professional holiday appearance is <strong>₱${data.totalAmount.toLocaleString()}</strong>.</p>
        ${
          data.withDP
            ? `<p style="font-size: 14px;"><strong>Standard 50% Downpayment:</strong> A non-refundable reservation deposit of <strong>₱${data.depositAmount.toLocaleString()}</strong> is required to lock and secure the date on the master calendar. The remaining balance of <strong>₱${data.balanceAmount.toLocaleString()}</strong> shall be settled on or before the event date or per agreed schedule.</p>`
            : `<p style="font-size: 14px;"><strong>Special Terms (No Downpayment):</strong> Per approved institutional arrangement, full compensation of <strong>₱${data.totalAmount.toLocaleString()}</strong> shall be settled via official check / bank transfer upon completion of event services.</p>`
        }
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; color: #111; margin-bottom: 8px;">2. OPERATIONAL INCLUSIONS &amp; LOGISTICS</h3>
        <ul style="font-size: 14px; padding-left: 20px; color: #374151;">
          <li>Professional, authenticated real-beard Santa Claus dressed in bespoke high-grade seasonal wardrobe.</li>
          <li>Accompanied by dedicated Production Assistant (PA) for queue coordination and talent care.</li>
          <li>Holding / dressing room with private access, mirrors, and water must be provided by Client.</li>
          <li>Run of show and photo opportunity flow coordinated with client point person.</li>
        </ul>
      </div>

      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 15px; color: #111; margin-bottom: 8px;">3. EXECUTION &amp; LEGAL DISCLAIMER</h3>
        <p style="font-size: 12px; color: #6b7280; font-style: italic;">
          This booking agreement represents the binding operational parameters between Brillo Events Management Service and the Client. Signed documents are archived in the Brillo Operations Hub and may not be altered without written mutual consent.
        </p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 40px; border-top: 1px dashed #d1d5db; padding-top: 24px;">
        <div style="width: 45%;">
          <p style="font-size: 13px; font-weight: bold; margin-bottom: 40px;">FOR BRILLO EVENTS MANAGEMENT SERVICE:</p>
          <div style="border-bottom: 1px solid #111; width: 100%; margin-bottom: 4px;"></div>
          <p style="font-size: 12px; margin: 0; color: #555;">Authorized Operations Director</p>
        </div>
        <div style="width: 45%;">
          <p style="font-size: 13px; font-weight: bold; margin-bottom: 40px;">FOR CLIENT / VENUE:</p>
          <div style="border-bottom: 1px solid #111; width: 100%; margin-bottom: 4px;"></div>
          <p style="font-size: 12px; margin: 0; color: #555;">Authorized Representative Signer</p>
        </div>
      </div>
    </div>
  `;
}
