/**
 * Brillo Events — Responsive Red Velvet & Champagne Gold Email Templates
 * Mobile-First, Inline CSS for cross-client compatibility (Gmail, Outlook, Apple Mail)
 */

interface TemplateWrapperProps {
  preheader: string;
  headerTitle: string;
  headerSubtitle: string;
  bodyContent: string;
  footerNote?: string;
}

export function wrapEmailBody({
  preheader,
  headerTitle,
  headerSubtitle,
  bodyContent,
  footerNote,
}: TemplateWrapperProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
  <style>
    body { margin:0; padding:0; background-color:#FAF7F5; font-family:'Montserrat', Arial, sans-serif; color:#211619; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    td { padding:0; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    .btn { display:inline-block; padding:14px 28px; background:linear-gradient(135deg, #A61932 0%, #780D22 100%); color:#FFF8F0 !important; font-weight:700; font-size:13px; text-decoration:none; border-radius:10px; border:1px solid #D6B36A; letter-spacing:0.5px; }
    .box { background:#FCF9F8; border:1px solid #F0E6E8; border-radius:12px; padding:20px; margin:20px 0; }
    @media only screen and (max-width: 600px) {
      .container { width:100% !important; border-radius:0 !important; }
      .body-cell { padding:24px 18px !important; }
      .header-cell { padding:28px 18px !important; }
    }
  </style>
</head>
<body style="background-color:#FAF7F5; margin:0; padding:20px 0;">
  <span style="display:none;font-size:1px;color:#FAF7F5;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF; border:1px solid #E8DFE0; border-radius:16px; overflow:hidden; box-shadow:0 6px 24px rgba(0,0,0,0.06);">
          <!-- Red Velvet Header -->
          <tr>
            <td class="header-cell" style="background:linear-gradient(135deg, #780D22 0%, #4A0512 100%); padding:32px 28px; text-align:center; border-bottom:3px solid #D6B36A;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="font-family:'Cinzel', Georgia, serif; font-size:24px; font-weight:800; color:#FFF8F0; letter-spacing:2px; margin:0;">
                      BRILLO EVENTS
                    </div>
                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:3px; color:#D6B36A; font-weight:700; margin-top:6px;">
                      ${headerSubtitle}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td class="body-cell" style="padding:32px 32px 24px 32px; font-size:14px; line-height:1.65; color:#211619;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#211619; padding:28px 24px; text-align:center; font-size:11px; line-height:1.6; color:#C4B5B8; border-top:1px solid #362227;">
              <div style="font-weight:700; color:#FFF8F0; font-size:12px; letter-spacing:1px;">BRILLO EVENTS MANAGEMENT SERVICES</div>
              <div style="color:#D6B36A; margin:4px 0 8px 0; font-style:italic;">Where Christmas Magic Comes to Life.</div>
              <div>Official Inquiries: <a href="mailto:info@brilloevent.com" style="color:#D6B36A; text-decoration:none;">info@brilloevent.com</a> • Dispatch Hotline: 0927 887 2343</div>
              <div style="margin-top:6px;">Namecheap Private Email &amp; Xendit PH Secured Gateway • <a href="https://brilloevent.com" style="color:#D6B36A; text-decoration:none;">brilloevent.com</a></div>
              ${footerNote ? `<div style="margin-top:10px; font-size:10px; color:#8C7B7E;">${footerNote}</div>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 1. Event Proposal & Inquiry Acknowledgment Template
 */
export function templateProposalInquiry(data: {
  clientName: string;
  eventType: string;
  proposalNumber: string;
  proposalLink: string;
  eventDate: string;
  venue: string;
  packageName: string;
  totalAmount: string;
  depositAmount: string;
}): { subject: string; html: string } {
  const subject = `Your Christmas Event Proposal is Ready! (Ref: ${data.proposalNumber}) | Brillo Events`;
  const bodyContent = `
    <div style="font-size:18px; font-weight:700; color:#780D22; margin-bottom:12px;">Dear ${data.clientName},</div>
    <p>Thank you for giving Brillo Events Management Services the opportunity to be part of your upcoming Christmas celebration!</p>
    <p>We are delighted to share your tailored event proposal and quotation for your <strong>${data.eventType}</strong> on <strong>${data.eventDate}</strong> at <strong>${data.venue}</strong>.</p>
    
    <div class="box" style="background:#FAF3EB; border:2px solid #D6B36A; text-align:center;">
      <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#8F620E;">Selected Package: ${data.packageName}</div>
      <div style="font-size:32px; font-weight:800; color:#780D22; margin:8px 0; font-family:'Cinzel', serif;">₱${data.totalAmount}</div>
      <div style="font-size:12px; color:#5C494E;">50% Downpayment to Lock Slot: <strong>₱${data.depositAmount}</strong></div>
    </div>

    <div style="text-align:center; margin:30px 0;">
      <a href="${data.proposalLink}" class="btn">VIEW &amp; SIGN PROPOSAL ONLINE →</a>
    </div>

    <p style="font-size:13px; color:#5C494E;">
      Inside your proposal portal, you can inspect the assigned performer credentials, event timeline, sound/holding area requirements, and review the standard Google Docs / Documenso booking agreement.
    </p>
  `;

  return {
    subject,
    html: wrapEmailBody({
      preheader: `Your Christmas Event Proposal #${data.proposalNumber} has been prepared.`,
      headerTitle: subject,
      headerSubtitle: "Christmas Event Proposal & Quotation",
      bodyContent,
    }),
  };
}

/**
 * 2. Welcome & Login Information Template
 */
export function templateWelcomeLogin(data: {
  userName: string;
  userEmail: string;
  portalUrl: string;
  setupLink: string;
  roleTitle: string;
}): { subject: string; html: string } {
  const subject = `Welcome to the Brillo Hub Portal | Brillo Events`;
  const bodyContent = `
    <div style="font-size:18px; font-weight:700; color:#780D22; margin-bottom:12px;">Hello ${data.userName},</div>
    <p>Welcome to <strong>Brillo Hub</strong> (Santa Operations Platform)! Your ${data.roleTitle} account has been activated.</p>
    <p>Through our dedicated portal, you can access your personalized booking calendar, review contracts, check live dispatch statuses, and monitor settlements.</p>

    <div class="box">
      <div style="font-weight:700; color:#780D22; margin-bottom:8px;">YOUR ACCESS CREDENTIALS</div>
      <div style="font-size:13px; margin-bottom:4px;"><strong>Registered Email:</strong> ${data.userEmail}</div>
      <div style="font-size:13px;"><strong>Dashboard URL:</strong> <a href="${data.portalUrl}" style="color:#780D22; font-weight:600;">${data.portalUrl}</a></div>
    </div>

    <div style="text-align:center; margin:28px 0;">
      <a href="${data.setupLink}" class="btn" style="background:#211619; color:#FFF8F0 !important;">ACTIVATE ACCOUNT &amp; SET PASSWORD →</a>
    </div>

    <p style="font-size:12px; color:#756568; font-style:italic;">
      Security Notice: Never share your login credentials with anyone. This activation link expires in 24 hours.
    </p>
  `;

  return {
    subject,
    html: wrapEmailBody({
      preheader: `Welcome to Brillo Hub. Please activate your account.`,
      headerTitle: subject,
      headerSubtitle: "Secure Account Activation",
      bodyContent,
    }),
  };
}

/**
 * 3. Password Reset Template
 */
export function templatePasswordReset(data: {
  userName: string;
  resetUrl: string;
  expiryMinutes: number;
}): { subject: string; html: string } {
  const subject = `Reset Your Brillo Events Account Password`;
  const bodyContent = `
    <div style="font-size:18px; font-weight:700; color:#211619; margin-bottom:12px;">Dear ${data.userName},</div>
    <p>We received a request to reset your password for the Brillo Events Management Services portal.</p>
    <p>To choose a new password, click the button below:</p>

    <div style="text-align:center; margin:30px 0;">
      <a href="${data.resetUrl}" class="btn" style="background:#780D22;">RESET MY PASSWORD</a>
    </div>

    <div class="box" style="font-size:12px; color:#756568;">
      • This link will expire in <strong>${data.expiryMinutes} minutes</strong> and can only be used once.<br>
      • If you did not request a password reset, please ignore this email. Your existing password remains completely secure.
    </div>
  `;

  return {
    subject,
    html: wrapEmailBody({
      preheader: `Reset your Brillo Events portal password.`,
      headerTitle: subject,
      headerSubtitle: "Security & Access Control",
      bodyContent,
    }),
  };
}

/**
 * 4. Official Receipt (Xendit Trigger) Template
 */
export function templateOfficialReceipt(data: {
  payerName: string;
  amountPaid: string;
  paymentMethod: string;
  paymentDate: string;
  transactionId: string;
  bookingNumber: string;
  remainingBalance: string;
}): { subject: string; html: string } {
  const subject = `Payment Verified & Official Receipt #${data.transactionId} | Brillo Events`;
  const bodyContent = `
    <div style="text-align:center; margin-bottom:18px;">
      <span style="display:inline-block; background:#DEF7EC; color:#03543F; font-size:12px; font-weight:800; padding:6px 16px; border-radius:30px; border:1px solid #31C48D; text-transform:uppercase; letter-spacing:1px;">
        ✓ Payment Verified via Xendit PH
      </span>
    </div>
    <div style="font-size:18px; font-weight:700; color:#134E2B; margin-bottom:8px;">Dear ${data.payerName},</div>
    <p>Thank you! Your payment has been successfully cleared and credited to your Brillo Events booking ledger.</p>

    <table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:13px;">
      <tr style="border-bottom:1px solid #E8DFE0;">
        <td style="padding:10px 0; color:#756568; font-weight:600;">Official Reference ID:</td>
        <td style="padding:10px 0; text-align:right; font-weight:700; font-family:monospace;">${data.transactionId}</td>
      </tr>
      <tr style="border-bottom:1px solid #E8DFE0;">
        <td style="padding:10px 0; color:#756568; font-weight:600;">Booking Reference:</td>
        <td style="padding:10px 0; text-align:right; font-weight:700;">${data.bookingNumber}</td>
      </tr>
      <tr style="border-bottom:1px solid #E8DFE0;">
        <td style="padding:10px 0; color:#756568; font-weight:600;">Settlement Date:</td>
        <td style="padding:10px 0; text-align:right;">${data.paymentDate}</td>
      </tr>
      <tr style="border-bottom:1px solid #E8DFE0;">
        <td style="padding:10px 0; color:#756568; font-weight:600;">Payment Rail / Method:</td>
        <td style="padding:10px 0; text-align:right; font-weight:700; color:#0A58CA;">${data.paymentMethod}</td>
      </tr>
      <tr style="background:#F9FAFB; border-bottom:2px solid #31C48D;">
        <td style="padding:12px 8px; font-weight:700; color:#134E2B; font-size:14px;">Amount Received:</td>
        <td style="padding:12px 8px; text-align:right; font-weight:800; font-size:18px; color:#03543F;">₱${data.amountPaid}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; color:#756568; font-weight:600;">Remaining Balance:</td>
        <td style="padding:10px 0; text-align:right; font-weight:700; color:#780D22;">₱${data.remainingBalance}</td>
      </tr>
    </table>

    <div style="font-size:12px; color:#756568; line-height:1.6;">
      This electronic receipt acknowledges receipt of funds via Xendit PH (settled to Brillo Events Management Services GCash 0906 439 0028 / Bank Account). Your calendar slot is officially locked.
    </div>
  `;

  return {
    subject,
    html: wrapEmailBody({
      preheader: `Payment verified for booking ${data.bookingNumber}. Official receipt attached.`,
      headerTitle: subject,
      headerSubtitle: "Official Payment Acknowledgment & Receipt",
      bodyContent,
      footerNote: "Xendit Payment Gateway Ref: " + data.transactionId,
    }),
  };
}
