import { EMAIL_TEMPLATES, renderEmailTemplate } from "./email-templates";

export interface EmailLogEntry {
  id: string;
  recipient: string;
  sender: string;
  subject: string;
  templateId: string;
  templateName: string;
  triggerEvent: string;
  bookingRef?: string;
  inquiryRef?: string;
  status: "SENT" | "DELIVERED" | "PENDING" | "FAILED";
  timestamp: string;
  error?: string;
}

export interface AutomationSequenceItem {
  id: string;
  triggerName: string;
  label: string;
  templateId: string;
  timing: string;
  recipientType: "CUSTOMER" | "STAFF";
  enabled: boolean;
}

export const DEFAULT_AUTOMATIONS: AutomationSequenceItem[] = [
  { id: "auto_1", triggerName: "INQUIRY_SUBMITTED", label: "New Inquiry Thank-You", templateId: "EMAIL_01_INQUIRY_ACK", timing: "Immediate", recipientType: "CUSTOMER", enabled: true },
  { id: "auto_2", triggerName: "PROPOSAL_DISPATCHED", label: "Event Proposal & Quotation", templateId: "EMAIL_03_PROPOSAL_SENT", timing: "On Staff Send", recipientType: "CUSTOMER", enabled: true },
  { id: "auto_3", triggerName: "PAYMENT_VERIFIED", label: "Verified Payment Receipt", templateId: "EMAIL_07_PAYMENT_RECEIPT", timing: "On Verification", recipientType: "CUSTOMER", enabled: true },
  { id: "auto_4", triggerName: "BOOKING_CONFIRMED", label: "Official Booking Confirmation", templateId: "EMAIL_08_BOOKING_CONFIRMED", timing: "On Full Requirements", recipientType: "CUSTOMER", enabled: true },
  { id: "auto_5", triggerName: "ACCOUNT_INVITED", label: "Client Portal Activation", templateId: "EMAIL_09_ACCOUNT_ACTIVATION", timing: "On Account Creation", recipientType: "CUSTOMER", enabled: true },
  { id: "auto_6", triggerName: "PASSWORD_RESET_REQUESTED", label: "15-Minute Password Reset", templateId: "EMAIL_10_PASSWORD_RESET", timing: "Immediate", recipientType: "CUSTOMER", enabled: true },
  { id: "auto_7", triggerName: "EVENT_REMINDER_7D", label: "7-Day Event Prep Reminder", templateId: "EMAIL_11_EVENT_REMINDER", timing: "7 Days Before", recipientType: "CUSTOMER", enabled: true },
  { id: "auto_8", triggerName: "EVENT_REMINDER_24H", label: "Final 24h Call-Time Reminder", templateId: "EMAIL_11_EVENT_REMINDER", timing: "24h Before", recipientType: "CUSTOMER", enabled: true },
];

export async function dispatchAutomatedEmail(options: {
  triggerKey: string;
  recipientEmail: string;
  data: Record<string, any>;
  bookingRef?: string;
  inquiryRef?: string;
}): Promise<{ success: boolean; logId: string; error?: string }> {
  const { triggerKey, recipientEmail, data, bookingRef, inquiryRef } = options;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    return { success: false, logId: "", error: "Invalid recipient email address" };
  }

  // Find corresponding template
  const tpl = EMAIL_TEMPLATES.find((t) => t.triggerKey === triggerKey) || EMAIL_TEMPLATES[0];
  const { subject, html } = renderEmailTemplate(tpl.id, data);

  const logId = `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const logEntry: EmailLogEntry = {
    id: logId,
    recipient: recipientEmail,
    sender: "Brillo Events <bookings@brilloevent.com>",
    subject,
    templateId: tpl.id,
    templateName: tpl.name,
    triggerEvent: triggerKey,
    bookingRef,
    inquiryRef,
    status: "DELIVERED",
    timestamp: new Date().toISOString(),
  };

  // If in browser/static fallback, save to localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("brillo_email_logs_v3");
      const list: EmailLogEntry[] = raw ? JSON.parse(raw) : [];
      list.unshift(logEntry);
      localStorage.setItem("brillo_email_logs_v3", JSON.stringify(list.slice(0, 100)));
    } catch {}
  }

  return { success: true, logId };
}
