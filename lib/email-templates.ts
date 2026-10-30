export interface EmailTemplateDef {
  id: string;
  triggerKey: string;
  name: string;
  category: "INTAKE" | "PROPOSAL" | "CONTRACT" | "PAYMENT" | "BOOKING" | "ACCOUNT" | "REMINDER" | "FEEDBACK";
  subject: string;
  description: string;
  enabled: boolean;
  variables: string[];
  htmlContent: string;
}

export const EMAIL_TEMPLATES: EmailTemplateDef[] = [
  {
    id: "EMAIL_01_INQUIRY_ACK",
    triggerKey: "INQUIRY_SUBMITTED",
    name: "01. Thank You for Your Inquiry",
    category: "INTAKE",
    subject: "We've Received Your Santa Booking Inquiry! | Brillo Events",
    description: "Automatic · Immediately after customer submits the booking inquiry form.",
    enabled: true,
    variables: [
      "{{client_name}}",
      "{{inquiry_number}}",
      "{{event_type}}",
      "{{preferred_santa}}",
      "{{event_date}}",
      "{{venue}}",
      "{{duration}}",
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Montserrat', Arial, sans-serif; background-color: #FAF7F5; margin: 0; padding: 0; color: #211619; }
    .container { max-width: 600px; margin: 20px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E8DFE0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #780D22 0%, #4A0512 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #D6B36A; }
    .brand-title { color: #FFF8F0; font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; margin: 0; }
    .brand-sub { color: #D6B36A; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 6px; font-weight: 600; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; color: #780D22; margin-bottom: 12px; }
    .details-box { background: #FCF9F8; border: 1px solid #F0E6E8; border-left: 4px solid #780D22; border-radius: 8px; padding: 18px 20px; margin: 24px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #E8DFE0; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #756568; font-weight: 600; }
    .details-value { color: #211619; font-weight: 700; }
    .steps-box { background: #FFFDF9; border: 1px solid #F3E5C8; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
    .steps-title { font-size: 13px; font-weight: 700; color: #9A6F1A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .footer { background: #211619; color: #C4B5B8; padding: 24px; text-align: center; font-size: 12px; line-height: 1.5; }
    .footer-link { color: #D6B36A; text-decoration: none; font-weight: 600; }
    .badge { display: inline-block; background: #FAF0D7; color: #8F620E; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid #E6CA85; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">BRILLO EVENTS</h1>
      <div class="brand-sub">Christmas Experiences</div>
    </div>
    <div class="body">
      <div class="greeting">Dear {{client_name}},</div>
      <p>Thank you for considering Brillo Events Management Services for your upcoming Christmas celebration! We are delighted that you are interested in bringing the magic of an authentic Santa Claus experience to your event.</p>
      <p>We have successfully received your inquiry. Our operations desk is currently reviewing your event requirements and checking live calendar availability for your preferred talent.</p>
      
      <div class="details-box">
        <div style="font-weight:700; color:#780D22; margin-bottom:10px; font-size:14px;">YOUR EVENT DETAILS</div>
        <div class="details-row"><span class="details-label">Inquiry Reference:</span><span class="details-value">{{inquiry_number}}</span></div>
        <div class="details-row"><span class="details-label">Event Type:</span><span class="details-value">{{event_type}}</span></div>
        <div class="details-row"><span class="details-label">Preferred Santa:</span><span class="details-value">{{preferred_santa}}</span></div>
        <div class="details-row"><span class="details-label">Target Date:</span><span class="details-value">{{event_date}}</span></div>
        <div class="details-row"><span class="details-label">Venue / City:</span><span class="details-value">{{venue}}</span></div>
        <div class="details-row"><span class="details-label">Duration:</span><span class="details-value">{{duration}}</span></div>
      </div>

      <div class="steps-box">
        <div class="steps-title">What Happens Next?</div>
        <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #5C494E;">
          <li style="margin-bottom: 4px;">Our team reviews your event scope and timing.</li>
          <li style="margin-bottom: 4px;">We check verified talent availability on the Master Calendar.</li>
          <li style="margin-bottom: 4px;">We prepare a tailored Christmas event proposal and quotation.</li>
          <li>We deliver your official proposal directly to this email address.</li>
        </ol>
      </div>

      <p style="font-size: 12px; color: #756568; font-style: italic;">
        Please note: Submitting an inquiry places an initial 24-hour soft hold and does not constitute a finalized booking until formal agreement and deposit requirements are fulfilled.
      </p>
    </div>
    <div class="footer">
      <div><strong>BRILLO EVENTS MANAGEMENT SERVICES</strong></div>
      <div style="color: #D6B36A; margin: 4px 0;">Where Christmas Magic Comes to Life.</div>
      <div>Metro Manila &amp; Nationwide Inquiries • Phone: 0927 887 2343</div>
      <div style="margin-top: 8px;"><a href="https://brilloevent.com" class="footer-link">brilloevent.com</a></div>
    </div>
  </div>
</body>
</html>
`,
  },
  {
    id: "EMAIL_03_PROPOSAL_SENT",
    triggerKey: "PROPOSAL_DISPATCHED",
    name: "03. Event Proposal & Quotation",
    category: "PROPOSAL",
    subject: "Your Christmas Event Proposal is Ready! | Brillo Events",
    description: "Automatic · Dispatched when staff issues or emails a formal quotation to the client.",
    enabled: true,
    variables: [
      "{{client_name}}",
      "{{proposal_number}}",
      "{{event_date}}",
      "{{venue}}",
      "{{package_name}}",
      "{{proposal_total}}",
      "{{deposit_amount}}",
      "{{portal_url}}",
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Montserrat', Arial, sans-serif; background-color: #FAF7F5; margin: 0; padding: 0; color: #211619; }
    .container { max-width: 600px; margin: 20px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E8DFE0; }
    .header { background: linear-gradient(135deg, #780D22 0%, #4A0512 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #D6B36A; }
    .brand-title { color: #FFF8F0; font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; margin: 0; }
    .brand-sub { color: #D6B36A; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 6px; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; color: #780D22; margin-bottom: 12px; }
    .price-card { background: #FAF3EB; border: 2px solid #D6B36A; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
    .price-val { font-size: 32px; font-weight: 800; color: #780D22; margin: 6px 0; font-family: 'Cinzel', serif; }
    .btn { display: inline-block; background: linear-gradient(135deg, #A61932 0%, #780D22 100%); color: #FFF8F0 !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; border: 1px solid #D6B36A; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(120,13,34,0.3); }
    .footer { background: #211619; color: #C4B5B8; padding: 24px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">BRILLO EVENTS</h1>
      <div class="brand-sub">Christmas Experiences</div>
    </div>
    <div class="body">
      <div class="greeting">Dear {{client_name}},</div>
      <p>Greetings from Brillo Events Management Services! Thank you for giving us the opportunity to be part of your upcoming Christmas celebration.</p>
      <p>We are pleased to share your customized Christmas Event Proposal &amp; Quotation (Ref: <strong>{{proposal_number}}</strong>) for your event on <strong>{{event_date}}</strong> at <strong>{{venue}}</strong>.</p>
      
      <div class="price-card">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8F620E;">Selected Package: {{package_name}}</div>
        <div class="price-val">₱{{proposal_total}}</div>
        <div style="font-size: 12px; color: #5C494E;">Initial 50% Deposit to Lock Slot: <strong>₱{{deposit_amount}}</strong></div>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="{{portal_url}}" class="btn">VIEW &amp; ACCEPT PROPOSAL ONLINE →</a>
      </div>

      <p style="font-size: 13px; color: #5C494E;">
        Inside the proposal portal, you can inspect the full performer profile, inclusions, call times, and payment terms. You can also accept the proposal or request revisions with a single click.
      </p>
    </div>
    <div class="footer">
      <div><strong>BRILLO EVENTS MANAGEMENT SERVICES</strong></div>
      <div style="color: #D6B36A; margin: 4px 0;">Where Christmas Magic Comes to Life.</div>
      <div>Website: <a href="https://brilloevent.com" style="color:#D6B36A;">brilloevent.com</a> • Inquiries: 0927 887 2343</div>
    </div>
  </div>
</body>
</html>
`,
  },
  {
    id: "EMAIL_07_PAYMENT_RECEIPT",
    triggerKey: "PAYMENT_VERIFIED",
    name: "07. Verified Payment Confirmation & Receipt",
    category: "PAYMENT",
    subject: "Payment Successfully Received! | Brillo Events",
    description: "Automatic · Dispatched ONLY when staff or Xendit officially verifies payment.",
    enabled: true,
    variables: [
      "{{client_name}}",
      "{{payment_reference}}",
      "{{booking_number}}",
      "{{payment_date}}",
      "{{payment_method}}",
      "{{payment_amount}}",
      "{{remaining_balance}}",
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Montserrat', Arial, sans-serif; background-color: #FAF7F5; margin: 0; padding: 0; color: #211619; }
    .container { max-width: 600px; margin: 20px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E8DFE0; }
    .header { background: linear-gradient(135deg, #134E2B 0%, #0A2E19 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #D6B36A; }
    .brand-title { color: #FFF8F0; font-family: 'Cinzel', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; margin: 0; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .stamp { display: inline-block; background: #DEF7EC; color: #03543F; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 30px; border: 1px solid #31C48D; text-transform: uppercase; letter-spacing: 1px; }
    .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .receipt-table td { padding: 8px 12px; border-bottom: 1px solid #E8DFE0; }
    .receipt-table td:first-child { color: #756568; font-weight: 600; width: 45%; }
    .receipt-table td:last-child { color: #1E1416; font-weight: 700; text-align: right; }
    .footer { background: #211619; color: #C4B5B8; padding: 24px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">BRILLO EVENTS</h1>
      <div style="color: #6EE7B7; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 6px; font-weight: 700;">Official Payment Acknowledgment</div>
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 16px;">
        <span class="stamp">✓ Payment Verified &amp; Cleared</span>
      </div>
      <div style="font-size: 16px; font-weight: 700; color: #134E2B;">Dear {{client_name}},</div>
      <p>Thank you! We have successfully received and verified your payment. Your booking ledger has been officially credited in our system.</p>
      
      <table class="receipt-table">
        <tr><td>Payment Reference:</td><td>{{payment_reference}}</td></tr>
        <tr><td>Booking Number:</td><td>{{booking_number}}</td></tr>
        <tr><td>Date Settled:</td><td>{{payment_date}}</td></tr>
        <tr><td>Payment Channel:</td><td>{{payment_method}}</td></tr>
        <tr style="background:#F9FAFB;"><td>Amount Received:</td><td style="color:#03543F; font-size:16px;">₱{{payment_amount}}</td></tr>
        <tr><td>Remaining Collectible:</td><td style="color:#780D22;">₱{{remaining_balance}}</td></tr>
      </table>

      <p style="font-size: 12px; color: #756568;">
        This document serves as your electronic proof of payment issued by Brillo Events Management Services.
      </p>
    </div>
    <div class="footer">
      <div><strong>BRILLO EVENTS MANAGEMENT SERVICES</strong></div>
      <div style="color: #D6B36A; margin: 4px 0;">Official Accounting &amp; Settlement Desk</div>
      <div>GCash: 0906 439 0028 • <a href="https://brilloevent.com" style="color:#D6B36A;">brilloevent.com</a></div>
    </div>
  </div>
</body>
</html>
`,
  },
  {
    id: "EMAIL_08_BOOKING_CONFIRMED",
    triggerKey: "BOOKING_CONFIRMED",
    name: "08. Official Booking Confirmation 🎅",
    category: "BOOKING",
    subject: "YOUR BOOKING IS CONFIRMED! | Brillo Events 🎅",
    description: "Automatic · Dispatched when agreement is signed and deposit requirements are satisfied.",
    enabled: true,
    variables: [
      "{{client_name}}",
      "{{booking_number}}",
      "{{event_date}}",
      "{{venue}}",
      "{{assigned_santa}}",
      "{{package_name}}",
      "{{call_time}}",
      "{{duration}}",
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Montserrat', Arial, sans-serif; background-color: #FAF7F5; margin: 0; padding: 0; color: #211619; }
    .container { max-width: 600px; margin: 20px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 2px solid #D6B36A; }
    .header { background: linear-gradient(135deg, #780D22 0%, #4A0512 100%); padding: 36px 24px; text-align: center; }
    .brand-title { color: #FFF8F0; font-family: 'Cinzel', Georgia, serif; font-size: 24px; font-weight: 800; letter-spacing: 2px; margin: 0; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .badge-confirmed { display: inline-block; background: #D6B36A; color: #211619; font-weight: 800; font-size: 13px; padding: 8px 18px; border-radius: 30px; letter-spacing: 1px; }
    .details-box { background: #FCF9F8; border: 1px solid #F0E6E8; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #E8DFE0; }
    .footer { background: #211619; color: #C4B5B8; padding: 24px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 32px; margin-bottom: 8px;">🎅</div>
      <h1 class="brand-title">YOUR BOOKING IS CONFIRMED!</h1>
      <div style="color: #D6B36A; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-top: 6px; font-weight: 700;">Brillo Events Christmas Experience</div>
    </div>
    <div class="body">
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge-confirmed">OFFICIAL CHRISTMAS RESERVATION LOCKED</span>
      </div>
      <div style="font-size: 16px; font-weight: 700; color: #780D22;">Dear {{client_name}},</div>
      <p>We are delighted to officially confirm your Christmas event with Brillo Events Management Services! Your date and Santa performer slot have been locked on our Master Deployment Schedule.</p>
      
      <div class="details-box">
        <div class="row"><span style="color:#756568;">Booking Reference:</span><span style="font-weight:700;">{{booking_number}}</span></div>
        <div class="row"><span style="color:#756568;">Confirmed Date:</span><span style="font-weight:700;">{{event_date}}</span></div>
        <div class="row"><span style="color:#756568;">Venue / Mall:</span><span style="font-weight:700;">{{venue}}</span></div>
        <div class="row"><span style="color:#756568;">Performer Assigned:</span><span style="font-weight:700; color:#780D22;">{{assigned_santa}}</span></div>
        <div class="row"><span style="color:#756568;">Package:</span><span style="font-weight:700;">{{package_name}}</span></div>
        <div class="row"><span style="color:#756568;">Call Time:</span><span style="font-weight:700;">{{call_time}}</span></div>
        <div class="row"><span style="color:#756568;">Performance Window:</span><span style="font-weight:700;">{{duration}}</span></div>
      </div>

      <p style="font-size: 13px; color: #5C494E;">
        Our production coordinator will contact your event team 7 days prior to coordinate holding room access, sound integration, security protocols, and arrival logistics.
      </p>
    </div>
    <div class="footer">
      <div><strong>BRILLO EVENTS MANAGEMENT SERVICES</strong></div>
      <div style="color: #D6B36A; margin: 4px 0;">Where Christmas Magic Comes to Life.</div>
      <div>Website: <a href="https://brilloevent.com" style="color:#D6B36A;">brilloevent.com</a></div>
    </div>
  </div>
</body>
</html>
`,
  },
  {
    id: "EMAIL_09_ACCOUNT_ACTIVATION",
    triggerKey: "ACCOUNT_INVITED",
    name: "09. Client Portal Account Activation",
    category: "ACCOUNT",
    subject: "Welcome to the Brillo Events Client Portal!",
    description: "Automatic · Dispatched when a client account is invited or created.",
    enabled: true,
    variables: [
      "{{client_name}}",
      "{{client_email}}",
      "{{activation_url}}",
      "{{expiry_time}}",
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Montserrat', Arial, sans-serif; background-color: #FAF7F5; margin: 0; padding: 0; color: #211619; }
    .container { max-width: 600px; margin: 20px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E8DFE0; }
    .header { background: linear-gradient(135deg, #780D22 0%, #4A0512 100%); padding: 32px 24px; text-align: center; }
    .brand-title { color: #FFF8F0; font-family: 'Cinzel', Georgia, serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .btn { display: inline-block; background: #D6B36A; color: #211619 !important; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 10px; }
    .footer { background: #211619; color: #C4B5B8; padding: 24px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">WELCOME TO THE CLIENT PORTAL</h1>
      <div style="color: #D6B36A; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Brillo Events Management Services</div>
    </div>
    <div class="body">
      <div style="font-size: 16px; font-weight: 700; color: #780D22;">Dear {{client_name}},</div>
      <p>Your client portal account has been prepared. Through our secure portal, you can conveniently view your proposals, track agreements, inspect live performer schedules, and submit payment records.</p>
      
      <div style="background: #FAF3EB; padding: 14px; border-radius: 8px; margin: 20px 0; font-size: 13px;">
        <div><strong>Registered Email:</strong> {{client_email}}</div>
        <div><strong>Status:</strong> Pending Password Setup</div>
      </div>

      <div style="text-align: center; margin: 26px 0;">
        <a href="{{activation_url}}" class="btn">ACTIVATE ACCOUNT &amp; SET PASSWORD →</a>
      </div>

      <p style="font-size: 12px; color: #756568;">
        For your security, this activation link is valid for {{expiry_time}} and can only be used once. Never share this email.
      </p>
    </div>
    <div class="footer">
      <div><strong>BRILLO EVENTS MANAGEMENT SERVICES</strong></div>
      <div style="color: #D6B36A; margin: 4px 0;">Security &amp; Client Access Desk</div>
    </div>
  </div>
</body>
</html>
`,
  },
  {
    id: "EMAIL_10_PASSWORD_RESET",
    triggerKey: "PASSWORD_RESET_REQUESTED",
    name: "10. Secure Password Reset",
    category: "ACCOUNT",
    subject: "Reset Your Brillo Events Account Password",
    description: "Automatic · Dispatched when user requests a password reset link (15m expiry).",
    enabled: true,
    variables: [
      "{{client_name}}",
      "{{reset_url}}",
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Montserrat', Arial, sans-serif; background-color: #FAF7F5; margin: 0; padding: 0; color: #211619; }
    .container { max-width: 600px; margin: 20px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E8DFE0; }
    .header { background: #211619; padding: 28px 24px; text-align: center; border-bottom: 2px solid #780D22; }
    .brand-title { color: #FFF8F0; font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; letter-spacing: 2px; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .btn { display: inline-block; background: #780D22; color: #FFF8F0 !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; }
    .footer { background: #FAF7F5; color: #756568; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #E8DFE0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">PASSWORD RESET REQUEST</h1>
    </div>
    <div class="body">
      <div style="font-size: 16px; font-weight: 700; color: #211619;">Dear {{client_name}},</div>
      <p>We received a request to reset the password associated with your Brillo Events account.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="{{reset_url}}" class="btn">RESET MY PASSWORD</a>
      </div>

      <p style="font-size: 12px; color: #756568;">
        This link will expire in <strong>15 minutes</strong> and can only be used once. If you did not make this request, please disregard this email. Your existing password remains secure.
      </p>
    </div>
    <div class="footer">
      <div>Brillo Events Management Services • Automated Security System</div>
    </div>
  </div>
</body>
</html>
`,
  },
  {
    id: "EMAIL_11_EVENT_REMINDER",
    triggerKey: "EVENT_REMINDER",
    name: "11. Event Preparation & Reminder",
    category: "REMINDER",
    subject: "Your Christmas Event is Approaching! | Brillo Events",
    description: "Automatic · Scheduled 7 days, 48 hours, and 24 hours prior to confirmed event date.",
    enabled: true,
    variables: [
      "{{client_name}}",
      "{{event_name}}",
      "{{event_date}}",
      "{{venue}}",
      "{{assigned_santa}}",
      "{{call_time}}",
      "{{duration}}",
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Montserrat', Arial, sans-serif; background-color: #FAF7F5; margin: 0; padding: 0; color: #211619; }
    .container { max-width: 600px; margin: 20px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E8DFE0; }
    .header { background: linear-gradient(135deg, #780D22 0%, #4A0512 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #D6B36A; }
    .brand-title { color: #FFF8F0; font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .box { background: #FAF3EB; border-left: 4px solid #D6B36A; padding: 18px; border-radius: 8px; margin: 20px 0; font-size: 13px; }
    .footer { background: #211619; color: #C4B5B8; padding: 24px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 28px; margin-bottom: 6px;">🎄</div>
      <h1 class="brand-title">YOUR EVENT IS APPROACHING</h1>
      <div style="color: #D6B36A; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Final Production Preparation</div>
    </div>
    <div class="body">
      <div style="font-size: 16px; font-weight: 700; color: #780D22;">Dear {{client_name}},</div>
      <p>We are getting ready for your upcoming Christmas celebration! Here is a summary of your confirmed event arrangements:</p>
      
      <div class="box">
        <div><strong>Event:</strong> {{event_name}}</div>
        <div><strong>Date:</strong> {{event_date}}</div>
        <div><strong>Venue:</strong> {{venue}}</div>
        <div><strong>Santa Performer:</strong> {{assigned_santa}}</div>
        <div><strong>Call Time:</strong> {{call_time}}</div>
        <div><strong>Duration:</strong> {{duration}}</div>
      </div>

      <div style="font-size: 13px; color: #5C494E;">
        <strong>Quick Checklist for Event Day:</strong>
        <ul style="padding-left: 20px; margin-top: 6px;">
          <li>Air-conditioned holding room ready for Santa and Production Assistant (PA).</li>
          <li>Bottled drinking water and mirror in dressing room.</li>
          <li>Designated point of contact on-site for Santa entrance.</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <div><strong>BRILLO EVENTS MANAGEMENT SERVICES</strong></div>
      <div style="color: #D6B36A; margin: 4px 0;">Production &amp; Dispatch Desk</div>
      <div>On-site Urgent Dispatch: 0927 887 2343</div>
    </div>
  </div>
</body>
</html>
`,
  },
];

export function renderEmailTemplate(
  templateId: string,
  data: Record<string, string | number | undefined>
): { subject: string; html: string } {
  const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId) || EMAIL_TEMPLATES[0];
  let html = tpl.htmlContent;
  let subject = tpl.subject;

  for (const [key, value] of Object.entries(data)) {
    const rawVal = value !== undefined && value !== null ? String(value) : "";
    html = html.split(key).join(rawVal);
    subject = subject.split(key).join(rawVal);
  }

  return { subject, html };
}
