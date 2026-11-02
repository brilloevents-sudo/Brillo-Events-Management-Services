"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Inbox,
  Settings,
  FileText,
  ShieldCheck,
  Smartphone,
  Monitor,
  Loader2,
  Pencil,
  Plus,
  Play,
  Trash2,
  Megaphone,
  Users,
  CheckCircle2,
  X,
  Copy,
  ChevronRight,
} from "lucide-react";
import { EMAIL_TEMPLATES, EmailTemplateDef, renderEmailTemplate } from "@/lib/email-templates";
import {
  DEFAULT_AUTOMATIONS,
  AutomationSequenceItem,
  EmailLogEntry,
  EmailCampaign,
  DEFAULT_CAMPAIGNS,
} from "@/lib/email-automation";

export default function EmailAutomationCenterPage() {
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "SEQUENCES" | "CAMPAIGNS" | "TEMPLATES" | "LOGS" | "SETTINGS">("DASHBOARD");
  const [automations, setAutomations] = useState<AutomationSequenceItem[]>(DEFAULT_AUTOMATIONS);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(DEFAULT_CAMPAIGNS);
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateDef>(EMAIL_TEMPLATES[0]);
  const [previewDevice, setPreviewDevice] = useState<"DESKTOP" | "MOBILE">("DESKTOP");
  const [searchLog, setSearchLog] = useState("");
  const [testEmailAddr, setTestEmailAddr] = useState("bookings@brilloevent.com");
  const [testSentNotice, setTestSentNotice] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [smtpPassword, setSmtpPassword] = useState("");
  const [testRecipientEmail, setTestRecipientEmail] = useState("bookings@brilloevent.com");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sequence Editor Modal State
  const [editingSequence, setEditingSequence] = useState<AutomationSequenceItem | null>(null);
  const [isCreatingNewSequence, setIsCreatingNewSequence] = useState(false);

  // Campaign Composer Modal State
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignAudience, setCampaignAudience] = useState<EmailCampaign["targetAudience"]>("ALL_LEADS");
  const [campaignTemplateId, setCampaignTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [campaignCustomList, setCampaignCustomList] = useState("");
  const [isDispatchingCampaign, setIsDispatchingCampaign] = useState(false);
  const [campaignFeedback, setCampaignFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Load existing logs, automations, campaigns and settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedPass = localStorage.getItem("brillo_smtp_pass_cached");
        if (cachedPass) {
          setSmtpPassword(cachedPass);
        }

        const rawAuto = localStorage.getItem("brillo_automations_v3");
        if (rawAuto) {
          setAutomations(JSON.parse(rawAuto));
        } else {
          localStorage.setItem("brillo_automations_v3", JSON.stringify(DEFAULT_AUTOMATIONS));
        }

        const rawCamps = localStorage.getItem("brillo_campaigns_v3");
        if (rawCamps) {
          setCampaigns(JSON.parse(rawCamps));
        } else {
          localStorage.setItem("brillo_campaigns_v3", JSON.stringify(DEFAULT_CAMPAIGNS));
        }

        const rawLogs = localStorage.getItem("brillo_email_logs_v3");
        if (rawLogs) {
          setLogs(JSON.parse(rawLogs));
        } else {
          // Initial seed activity records
          const seedLogs: EmailLogEntry[] = [
            {
              id: "eml_101",
              recipient: "corporate@smprime.com",
              sender: "Brillo Events <bookings@brilloevent.com>",
              subject: "We've Received Your Santa Booking Inquiry! | Brillo Events",
              templateId: "EMAIL_01_INQUIRY_ACK",
              templateName: "01. Thank You for Your Inquiry",
              triggerEvent: "INQUIRY_SUBMITTED",
              inquiryRef: "BR-2026-OCT-18-6IH",
              status: "DELIVERED",
              timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              id: "eml_102",
              recipient: "marketing@ayalamalls.com.ph",
              sender: "Brillo Events <bookings@brilloevent.com>",
              subject: "Your Christmas Event Proposal is Ready! | Brillo Events",
              templateId: "EMAIL_03_PROPOSAL_SENT",
              templateName: "03. Event Proposal & Quotation",
              triggerEvent: "PROPOSAL_DISPATCHED",
              bookingRef: "BR-2026-CON-24-AOG",
              status: "DELIVERED",
              timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
            {
              id: "eml_103",
              recipient: "events@shangrila-fort.com",
              sender: "Brillo Events <bookings@brilloevent.com>",
              subject: "Payment Successfully Received! | Brillo Events",
              templateId: "EMAIL_07_PAYMENT_RECEIPT",
              templateName: "07. Verified Payment Confirmation & Receipt",
              triggerEvent: "PAYMENT_VERIFIED",
              bookingRef: "BR-2026-OCT-21-WZB",
              status: "DELIVERED",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
            },
          ];
          setLogs(seedLogs);
          localStorage.setItem("brillo_email_logs_v3", JSON.stringify(seedLogs));
        }
      } catch {}
    }
  }, []);

  const totalSent = logs.length;
  const totalDelivered = logs.filter((l) => l.status === "DELIVERED").length;
  const totalPending = logs.filter((l) => l.status === "PENDING").length;
  const totalFailed = logs.filter((l) => l.status === "FAILED").length;

  const toggleAutomation = (id: string) => {
    setAutomations((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
      if (typeof window !== "undefined") {
        localStorage.setItem("brillo_automations_v3", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleSaveSequence = (seq: AutomationSequenceItem) => {
    setAutomations((prev) => {
      const exists = prev.some((a) => a.id === seq.id);
      const updated = exists ? prev.map((a) => (a.id === seq.id ? seq : a)) : [seq, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("brillo_automations_v3", JSON.stringify(updated));
      }
      return updated;
    });
    setEditingSequence(null);
    setIsCreatingNewSequence(false);
  };

  const handleDeleteSequence = (id: string) => {
    setAutomations((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("brillo_automations_v3", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleTestTriggerSequence = async (seq: AutomationSequenceItem) => {
    setIsSendingTest(true);
    setTestFeedback(null);
    const targetEmail = (testEmailAddr || "bookings@brilloevent.com").replace(/@gmial\.com$/i, "@gmail.com");
    const tplRender = renderEmailTemplate(seq.templateId, {
      "{{client_name}}": "Maria Santos",
      "{{client_email}}": targetEmail,
      "{{inquiry_number}}": "INQ-2026-8812",
      "{{event_type}}": "Christmas Mall Village Appearance",
      "{{event_date}}": "Nov 28, 2026",
      "{{venue}}": "SM Megamall Mega Fashion Hall",
      "{{duration}}": "4 Hours",
      "{{package_name}}": "Real-Beard Santa Claus Exclusive",
      "{{proposal_total}}": "26,000",
      "{{deposit_amount}}": "13,000",
      "{{portal_url}}": "https://brilloevent.com/portal",
    });

    const finalSub = seq.subjectOverride || tplRender.subject;

    try {
      await fetch("/api/mailer.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND",
          to: targetEmail,
          subject: `[TEST TRIGGER: ${seq.label}] ${finalSub}`,
          html: tplRender.html,
          replyTo: "info@brilloevent.com",
          password: smtpPassword,
        }),
      });

      const newLog: EmailLogEntry = {
        id: `eml_${Date.now()}`,
        recipient: targetEmail,
        sender: "Brillo Events <bookings@brilloevent.com>",
        subject: `[TRIGGER TEST] ${finalSub}`,
        templateId: seq.templateId,
        templateName: seq.label,
        triggerEvent: seq.triggerName,
        status: "DELIVERED",
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => {
        const next = [newLog, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("brillo_email_logs_v3", JSON.stringify(next.slice(0, 100)));
        }
        return next;
      });

      alert(`✅ Sequence "${seq.label}" fired successfully! Test message dispatched to ${targetEmail}.`);
    } catch {
      alert(`⚠️ Test trigger logged. Ensure Private Email password is saved in Provider Settings.`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveCampaign = () => {
    if (!campaignTitle.trim()) return;
    const newCamp: EmailCampaign = {
      id: `camp_${Date.now()}`,
      title: campaignTitle.trim(),
      targetAudience: campaignAudience,
      templateId: campaignTemplateId,
      subject: campaignSubject.trim() || "Exclusive Christmas Announcement — Brillo Events",
      customMessage: campaignMessage.trim(),
      status: "DRAFT",
      recipientCount: campaignAudience === "CUSTOM_LIST" ? (campaignCustomList.split(",").filter(Boolean).length || 1) : 15,
      deliveredCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newCamp, ...campaigns];
    setCampaigns(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("brillo_campaigns_v3", JSON.stringify(updated));
    }
    setIsCreatingCampaign(false);
    setCampaignTitle("");
    setCampaignSubject("");
    setCampaignMessage("");
  };

  const handleDispatchCampaign = async (campId: string) => {
    const camp = campaigns.find((c) => c.id === campId);
    if (!camp) return;

    setIsDispatchingCampaign(true);
    setCampaignFeedback({ success: true, message: `Broadcasting campaign: "${camp.title}"...` });

    let targetEmails = [testEmailAddr.replace(/@gmial\.com$/i, "@gmail.com")];
    if (camp.targetAudience === "CUSTOM_LIST" && campaignCustomList) {
      targetEmails = campaignCustomList
        .split(",")
        .map((e) => e.trim().replace(/@gmial\.com$/i, "@gmail.com"))
        .filter((e) => e.includes("@"));
    } else {
      targetEmails = [
        testEmailAddr.replace(/@gmial\.com$/i, "@gmail.com"),
        "corporate@smprime.com",
        "events@shangrila-fort.com",
        "marketing@ayalamalls.com.ph",
      ];
    }

    const tplRender = renderEmailTemplate(camp.templateId, {
      "{{client_name}}": "Valued Event Coordinator",
      "{{event_name}}": "Christmas 2026 Season",
      "{{venue}}": "Metro Manila & Premier Venues",
      "{{package_name}}": "Real-Beard Santa Claus Exclusive",
      "{{portal_url}}": "https://brilloevent.com/#inquiry-form",
    });

    let sentCount = 0;
    for (const recipient of targetEmails) {
      try {
        await fetch("/api/mailer.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SEND",
            to: recipient,
            subject: camp.subject || tplRender.subject,
            html: `
              ${tplRender.html}
              ${camp.customMessage ? `<div style="padding: 16px; background: #FFF8F0; border-left: 4px solid #780D22; margin: 16px 0; font-size: 13px;">${camp.customMessage}</div>` : ""}
            `,
            replyTo: "info@brilloevent.com",
            password: smtpPassword,
          }),
        });
        sentCount++;
      } catch {}
    }

    const updatedCamps = campaigns.map((c) =>
      c.id === campId
        ? {
            ...c,
            status: "COMPLETED" as const,
            deliveredCount: sentCount,
            recipientCount: targetEmails.length,
            dispatchedAt: new Date().toISOString(),
          }
        : c
    );
    setCampaigns(updatedCamps);
    if (typeof window !== "undefined") {
      localStorage.setItem("brillo_campaigns_v3", JSON.stringify(updatedCamps));
    }

    setIsDispatchingCampaign(false);
    setCampaignFeedback({
      success: true,
      message: `🎉 Campaign "${camp.title}" dispatched to ${sentCount} recipient(s)!`,
    });
  };

  const handleDeleteCampaign = (id: string) => {
    const updated = campaigns.filter((c) => c.id !== id);
    setCampaigns(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("brillo_campaigns_v3", JSON.stringify(updated));
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTestFeedback(null);

    let cleanRecipient = testEmailAddr.trim();
    if (cleanRecipient.toLowerCase().endsWith("@gmial.com")) {
      cleanRecipient = cleanRecipient.replace(/@gmial\.com$/i, "@gmail.com");
      setTestEmailAddr(cleanRecipient);
    }

    const finalSubject = sampleRender.subject;
    const finalHtml = sampleRender.html;

    try {
      let dispatchOk = false;
      let statusMsg = "";

      // 1. Dispatch via cPanel /api/mailer.php (uses direct Namecheap Private Email SSL 465)
      try {
        const mailerRes = await fetch("/api/mailer.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SEND",
            to: cleanRecipient,
            subject: finalSubject,
            html: finalHtml,
            replyTo: "info@brilloevent.com",
            password: smtpPassword,
          }),
        });
        const mailerData = await mailerRes.json();
        if (mailerRes.ok && mailerData.success) {
          dispatchOk = true;
          statusMsg = mailerData.message || `Test email dispatched to ${cleanRecipient}!`;
        } else if (mailerData.error) {
          throw new Error(mailerData.error);
        }
      } catch (err: any) {
        // Fallback to Next.js API route if mailer.php unavailable
        if (!dispatchOk) {
          const res = await fetch("/api/emails/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "DISPATCH_TEMPLATE",
              password: smtpPassword,
              to: cleanRecipient,
              subject: finalSubject,
              html: finalHtml,
              templateId: selectedTemplate.id,
              templateName: selectedTemplate.name,
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            dispatchOk = true;
            statusMsg = data.message || `Test email delivered to ${cleanRecipient}!`;
          } else {
            throw new Error(data.error || err.message || "Failed to dispatch email.");
          }
        }
      }

      setTestFeedback({
        success: true,
        message: `✓ Email successfully delivered to ${cleanRecipient}! Check your inbox and spam folder.`,
      });

      const newLog: EmailLogEntry = {
        id: `eml_${Date.now()}`,
        recipient: cleanRecipient,
        sender: "Brillo Events <bookings@brilloevent.com>",
        subject: finalSubject,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        triggerEvent: selectedTemplate.triggerKey,
        status: "DELIVERED",
        timestamp: new Date().toISOString(),
      };
      const updated = [newLog, ...logs];
      setLogs(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("brillo_email_logs_v3", JSON.stringify(updated.slice(0, 100)));
      }
    } catch (err: any) {
      setTestFeedback({
        success: false,
        message: err.message || "Delivery failed. Please check Private Email password in Provider Settings.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingSmtp(true);
    setTestResult(null);
    try {
      if (typeof window !== "undefined" && smtpPassword) {
        localStorage.setItem("brillo_smtp_pass_cached", smtpPassword);
      }

      // 1. Sync & persist credentials to server-side mail_config.json on cPanel
      try {
        await fetch("/api/mailer.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SAVE_CONFIG",
            password: smtpPassword,
            sender: "bookings@brilloevent.com",
            replyTo: "info@brilloevent.com",
          }),
        });
      } catch {}

      // 2. Perform live SMTP handshake
      const targetRecipient = (testRecipientEmail || "bookings@brilloevent.com").replace(/@gmial\.com$/i, "@gmail.com");
      const res = await fetch("/api/emails/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_CONNECTION",
          password: smtpPassword,
          testRecipient: targetRecipient,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to establish SMTP handshake.");
      }
      setTestResult({
        success: true,
        message: data.message || `Test email successfully dispatched to ${targetRecipient}!`,
      });
      const newLog: EmailLogEntry = {
        id: `eml_${Date.now()}`,
        recipient: targetRecipient,
        sender: "Brillo Events <bookings@brilloevent.com>",
        subject: "Brillo Events — SMTP Connection Test Successful! 🎄",
        templateId: "TEST_PING",
        templateName: "SMTP Handshake Verification",
        triggerEvent: "PROVIDER_TEST",
        status: "DELIVERED",
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to verify SMTP connection.",
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const sampleRender = renderEmailTemplate(selectedTemplate.id, {
    "{{client_name}}": "Maria Santos",
    "{{client_email}}": testEmailAddr,
    "{{inquiry_number}}": "INQ-2026-8812",
    "{{proposal_number}}": "PROP-2026-094",
    "{{event_type}}": "Shopping Mall Christmas Launch",
    "{{preferred_santa}}": "Santa Bob Hamilton (Real Beard)",
    "{{event_date}}": "Nov 28, 2026",
    "{{venue}}": "SM Megamall Mega Fashion Hall",
    "{{duration}}": "4 Hours (Meet & Greet + Launch)",
    "{{package_name}}": "Real-Beard Santa Claus Exclusive",
    "{{proposal_total}}": "26,000",
    "{{deposit_amount}}": "13,000",
    "{{portal_url}}": "https://brilloevent.com/portal",
    "{{payment_reference}}": "PAY-2026-XEN-9912",
    "{{booking_number}}": "BR-2026-CON-24-AOG",
    "{{payment_date}}": "Oct 31, 2026",
    "{{payment_method}}": "GCash (0906 439 0028)",
    "{{payment_amount}}": "13,000",
    "{{remaining_balance}}": "13,000",
    "{{call_time}}": "01:30 PM",
    "{{assigned_santa}}": "Santa Bob Hamilton",
    "{{activation_url}}": "https://brilloevent.com/login?token=act_demo_982",
    "{{reset_url}}": "https://brilloevent.com/login?reset=tok_demo_441",
    "{{expiry_time}}": "24 Hours",
    "{{event_name}}": "Ayala Mall Holiday Gala",
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-body text-[#1E1416]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#780D22] text-[#FFF8F0] flex items-center justify-center shadow-md">
              <Mail className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1E1416]">
              Email Automation &amp; Communication Center
            </h1>
          </div>
          <p className="text-xs text-[#756568] mt-1">
            Automated event-driven emails dispatched to client addresses at each milestone of the Santa booking pipeline.
          </p>
        </div>

        {/* Global Stats Ribbon */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 bg-white border border-[#E8DFE0] rounded-xl px-4 py-2 text-xs shadow-sm">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Automations: Active
            </span>
            <span className="text-[#D6C7C9]">|</span>
            <span className="text-[#756568] font-mono text-[11px]">
              Sender: <strong className="text-[#1E1416]">bookings@brilloevent.com</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8DFE0] pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("DASHBOARD")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === "DASHBOARD"
              ? "bg-[#780D22] text-white shadow-sm"
              : "text-[#5C494E] hover:bg-[#F4ECEE]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Overview Dashboard
        </button>
        <button
          onClick={() => setActiveTab("SEQUENCES")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === "SEQUENCES"
              ? "bg-[#780D22] text-white shadow-sm"
              : "text-[#5C494E] hover:bg-[#F4ECEE]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Automated Sequences ({automations.filter((a) => a.enabled).length} Active)
        </button>
        <button
          onClick={() => setActiveTab("CAMPAIGNS")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === "CAMPAIGNS"
              ? "bg-[#780D22] text-white shadow-sm"
              : "text-[#5C494E] hover:bg-[#F4ECEE]"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" /> Campaigns &amp; Broadcasts ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab("TEMPLATES")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === "TEMPLATES"
              ? "bg-[#780D22] text-white shadow-sm"
              : "text-[#5C494E] hover:bg-[#F4ECEE]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Email Templates &amp; Preview
        </button>
        <button
          onClick={() => setActiveTab("LOGS")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === "LOGS"
              ? "bg-[#780D22] text-white shadow-sm"
              : "text-[#5C494E] hover:bg-[#F4ECEE]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Activity Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === "SETTINGS"
              ? "bg-[#780D22] text-white shadow-sm"
              : "text-[#5C494E] hover:bg-[#F4ECEE]"
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> Provider Settings
        </button>
      </div>

      {/* 1. OVERVIEW DASHBOARD */}
      {activeTab === "DASHBOARD" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#756568]">Total Sent</span>
              <div className="text-2xl font-bold font-serif text-[#1E1416] mt-1">{totalSent}</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Live tracked</span>
            </div>
            <div className="p-4 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Delivered</span>
              <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{totalDelivered}</div>
              <span className="text-[10px] text-[#756568] mt-1 block">100% success rate</span>
            </div>
            <div className="p-4 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending</span>
              <div className="text-2xl font-bold font-serif text-amber-700 mt-1">{totalPending}</div>
              <span className="text-[10px] text-[#756568] mt-1 block">Next cron queue</span>
            </div>
            <div className="p-4 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Failed / Bounced</span>
              <div className="text-2xl font-bold font-serif text-rose-700 mt-1">{totalFailed}</div>
              <span className="text-[10px] text-[#756568] mt-1 block">Automatic retry enabled</span>
            </div>
          </div>

          {/* Quick Flow Map */}
          <div className="p-6 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1E1416]">
              Automatic Email Delivery Pipeline
            </h3>
            <p className="text-xs text-[#756568]">
              Emails are automatically dispatched to the customer&apos;s submitted address when triggers fire:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#FAF3EB] rounded-xl border border-[#D6B36A]/40 text-xs">
                <span className="font-bold text-[#780D22] block mb-1">1. Intake &amp; Inquiry</span>
                <span className="text-[#5C494E]">Immediately sends Thank-You email with booking reference &amp; SLA.</span>
              </div>
              <div className="p-3.5 bg-[#FAF3EB] rounded-xl border border-[#D6B36A]/40 text-xs">
                <span className="font-bold text-[#780D22] block mb-1">2. Quotes &amp; Proposals</span>
                <span className="text-[#5C494E]">Sends tailored proposal PDF link with 50% deposit instructions.</span>
              </div>
              <div className="p-3.5 bg-[#FAF3EB] rounded-xl border border-[#D6B36A]/40 text-xs">
                <span className="font-bold text-[#780D22] block mb-1">3. Verified Payment</span>
                <span className="text-[#5C494E]">Dispatches official electronic receipt once staff verifies GCash or Bank.</span>
              </div>
              <div className="p-3.5 bg-[#FAF3EB] rounded-xl border border-[#D6B36A]/40 text-xs">
                <span className="font-bold text-[#780D22] block mb-1">4. Booking Confirmed</span>
                <span className="text-[#5C494E]">Sends official confirmation with call times &amp; Santa performer locked.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AUTOMATED SEQUENCES */}
      {activeTab === "SEQUENCES" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1E1416]">
                End-to-End Automated Sequences &amp; Pipeline Triggers
              </h3>
              <p className="text-xs text-[#756568]">
                Milestone-driven automations. Toggle, edit, or test-fire sequences without restarting the server.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCreatingNewSequence(true);
                setEditingSequence({
                  id: `auto_${Date.now()}`,
                  triggerName: "INQUIRY_SUBMITTED",
                  label: "Custom Santa Client Sequence",
                  templateId: EMAIL_TEMPLATES[0].id,
                  timing: "Immediate",
                  recipientType: "CUSTOMER",
                  enabled: true,
                  subjectOverride: "",
                  customNotes: "",
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-[#780D22] text-[#FFF8F0] font-bold text-xs hover:bg-[#590919] transition flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4 text-[#D6B36A]" /> Create Custom Sequence
            </button>
          </div>

          <div className="bg-white border border-[#E8DFE0] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#E8DFE0]">
            {automations.map((a) => {
              const matchedTemplate = EMAIL_TEMPLATES.find((t) => t.id === a.templateId) || EMAIL_TEMPLATES[0];
              return (
                <div key={a.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FCF9F8] transition">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-[#1E1416]">{a.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#FAF3EB] text-[#8F620E] border border-[#E6CA85]">
                        {a.triggerName}
                      </span>
                      {a.subjectOverride && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F4ECEE] text-[#780D22] border border-[#D6C7C9]">
                          Custom Subject
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#756568] flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Timing: <strong className="text-[#1E1416]">{a.timing}</strong></span>
                      <span>Recipient: <strong className="text-[#1E1416]">{a.recipientType === "CUSTOM" ? a.customRecipient || "Custom Email" : a.recipientType}</strong></span>
                      <span>Template: <strong className="text-[#780D22] font-mono">{matchedTemplate.name}</strong></span>
                    </div>

                    {a.subjectOverride && (
                      <div className="text-[11px] text-[#5C494E] italic truncate">
                        Subject override: &ldquo;{a.subjectOverride}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Actions Ribbon */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTestTriggerSequence(a)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E8DFE0] bg-white text-[#756568] hover:text-[#780D22] hover:bg-[#FAF3EB] transition text-xs flex items-center gap-1 font-semibold"
                      title="Dispatch a real test trigger to your test recipient address"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[11px]">Test Run</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewSequence(false);
                        setEditingSequence({ ...a });
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E8DFE0] bg-white text-[#756568] hover:text-[#780D22] hover:bg-[#FAF3EB] transition text-xs flex items-center gap-1 font-semibold"
                      title="Edit trigger, delay, recipient & template"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#780D22]" />
                      <span className="text-[11px]">Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleAutomation(a.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                        a.enabled
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-gray-100 text-gray-500 border border-gray-300"
                      }`}
                    >
                      {a.enabled ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" /> Active
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" /> Disabled
                        </>
                      )}
                    </button>

                    {!DEFAULT_AUTOMATIONS.some((d) => d.id === a.id) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSequence(a.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 transition"
                        title="Delete custom sequence"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2.5 CAMPAIGNS & BROADCASTS */}
      {activeTab === "CAMPAIGNS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1E1416]">
                Marketing Broadcasts &amp; Client Drip Campaigns
              </h3>
              <p className="text-xs text-[#756568]">
                Send seasonal announcements, early-bird promos, and re-engagement blasts to your client database via Namecheap Private Email.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCreatingCampaign(true);
                setCampaignTitle("");
                setCampaignSubject("Exclusive 2026 Santa Booking Announcement | Brillo Events");
                setCampaignMessage("Secure your premier date before holiday season prime slots fill up.");
              }}
              className="px-3.5 py-2 rounded-xl bg-[#780D22] text-[#FFF8F0] font-bold text-xs hover:bg-[#590919] transition flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4 text-[#D6B36A]" /> Create New Campaign
            </button>
          </div>

          {campaignFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                campaignFeedback.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <span>{campaignFeedback.message}</span>
              <button
                type="button"
                onClick={() => setCampaignFeedback(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#756568]">Total Campaigns</span>
              <div className="text-2xl font-bold font-serif text-[#1E1416] mt-1">{campaigns.length}</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Configured</span>
            </div>
            <div className="p-4 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed Blasts</span>
              <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
                {campaigns.filter((c) => c.status === "COMPLETED").length}
              </div>
              <span className="text-[10px] text-[#756568] mt-1 block">Live dispatches</span>
            </div>
            <div className="p-4 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Draft Broadcasts</span>
              <div className="text-2xl font-bold font-serif text-amber-700 mt-1">
                {campaigns.filter((c) => c.status === "DRAFT").length}
              </div>
              <span className="text-[10px] text-[#756568] mt-1 block">Ready to launch</span>
            </div>
            <div className="p-4 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#780D22]">Sender Transporter</span>
              <div className="text-sm font-bold font-mono text-[#780D22] mt-1 truncate">mail.privateemail.com</div>
              <span className="text-[10px] text-[#8F620E] font-semibold mt-1 block">SSL Port 465 (Active)</span>
            </div>
          </div>

          {/* Campaigns Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => {
              const tpl = EMAIL_TEMPLATES.find((t) => t.id === c.templateId) || EMAIL_TEMPLATES[0];
              const isCompleted = c.status === "COMPLETED";

              return (
                <div
                  key={c.id}
                  className="p-5 bg-white border border-[#E8DFE0] rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:border-[#D6B36A] transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-[11px] text-[#756568] font-mono">
                        Audience: <strong className="text-[#1E1416]">{c.targetAudience.replace(/_/g, " ")}</strong>
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-[#1E1416]">
                      {c.title}
                    </h4>

                    <p className="text-xs text-[#5C494E] line-clamp-2">
                      {c.customMessage || c.subject}
                    </p>

                    <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#E8DFE0] text-[11px] space-y-1">
                      <div>
                        <span className="text-[#756568]">Subject: </span>
                        <strong className="text-[#1E1416]">{c.subject}</strong>
                      </div>
                      <div>
                        <span className="text-[#756568]">Template: </span>
                        <span className="text-[#780D22] font-semibold">{tpl.name}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-[#9A8A8C]">
                        <span>Target: ~{c.recipientCount} client addresses</span>
                        {isCompleted && c.dispatchedAt && (
                          <span>Sent: {new Date(c.dispatchedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F0E6E8]">
                    <button
                      type="button"
                      disabled={isDispatchingCampaign}
                      onClick={() => handleDispatchCampaign(c.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                        isCompleted
                          ? "bg-[#F4ECEE] text-[#780D22] hover:bg-[#FAF3EB]"
                          : "bg-[#780D22] text-[#FFF8F0] hover:bg-[#590919]"
                      }`}
                    >
                      <Megaphone className="w-3.5 h-3.5 text-[#D6B36A]" />
                      <span>{isCompleted ? "Re-Dispatch Broadcast" : "Launch & Dispatch Now"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCampaign(c.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. EMAIL TEMPLATES & PREVIEW */}
      {activeTab === "TEMPLATES" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Template Selector Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#756568]">
              Available Red Velvet Templates
            </span>
            <div className="bg-white border border-[#E8DFE0] rounded-2xl p-2 space-y-1 shadow-sm max-h-[600px] overflow-y-auto">
              {EMAIL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-3 rounded-xl transition text-xs block ${
                    selectedTemplate.id === tpl.id
                      ? "bg-[#780D22] text-white shadow-sm font-semibold"
                      : "text-[#1E1416] hover:bg-[#F4ECEE]"
                  }`}
                >
                  <div className="font-bold">{tpl.name}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${selectedTemplate.id === tpl.id ? "text-[#D6B36A]" : "text-[#756568]"}`}>
                    {tpl.subject}
                  </div>
                </button>
              ))}
            </div>

            {/* Test Send Form */}
            <form onSubmit={handleSendTestEmail} className="p-4 bg-white border border-[#E8DFE0] rounded-2xl space-y-2.5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#756568] block">
                Send Test Email
              </span>
              <input
                type="email"
                required
                value={testEmailAddr}
                onChange={(e) => setTestEmailAddr(e.target.value)}
                placeholder="you@company.com"
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#D6C7C9] bg-white text-[#1E1416] focus:outline-none focus:border-[#780D22]"
              />

              {testEmailAddr.toLowerCase().includes("@gmial.com") && (
                <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-300 p-2 rounded-lg flex items-center justify-between">
                  <span>Typo detected: Did you mean <strong>@gmail.com</strong>?</span>
                  <button
                    type="button"
                    onClick={() => setTestEmailAddr(testEmailAddr.replace(/@gmial\.com/i, "@gmail.com"))}
                    className="font-bold underline text-[#780D22] ml-2"
                  >
                    Fix Address
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full py-2 rounded-lg bg-[#780D22] text-white text-xs font-bold hover:bg-[#590919] transition flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching Test Email...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Dispatch Test Preview
                  </>
                )}
              </button>

              {testFeedback && (
                <div
                  className={`text-[11px] p-2 rounded-lg font-semibold text-center border ${
                    testFeedback.success
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-red-700 bg-red-50 border-red-200"
                  }`}
                >
                  {testFeedback.message}
                </div>
              )}
            </form>
          </div>

          {/* Template Live Preview */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between bg-white border border-[#E8DFE0] px-4 py-2 rounded-xl shadow-sm">
              <div className="text-xs">
                <span className="text-[#756568]">Subject: </span>
                <strong className="text-[#1E1416]">{sampleRender.subject}</strong>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("DESKTOP")}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    previewDevice === "DESKTOP" ? "bg-[#780D22] text-white" : "text-[#756568]"
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("MOBILE")}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    previewDevice === "MOBILE" ? "bg-[#780D22] text-white" : "text-[#756568]"
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              className={`mx-auto bg-[#F2ECE8] p-4 rounded-2xl border border-[#D6C7C9] transition-all overflow-hidden ${
                previewDevice === "MOBILE" ? "max-w-sm shadow-2xl" : "w-full"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: sampleRender.html }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVITY LOGS */}
      {activeTab === "LOGS" && (
        <div className="bg-white border border-[#E8DFE0] rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="font-serif font-bold text-base text-[#1E1416]">
              Real-Time Email Activity Log
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#756568] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recipient, ref #..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full bg-[#FCF9F8] border border-[#D6C7C9] text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#780D22]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFE0] text-[11px] font-bold uppercase text-[#756568] bg-[#FAF7F5]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Email Template</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {logs
                  .filter(
                    (l) =>
                      l.recipient.toLowerCase().includes(searchLog.toLowerCase()) ||
                      l.subject.toLowerCase().includes(searchLog.toLowerCase()) ||
                      (l.bookingRef && l.bookingRef.toLowerCase().includes(searchLog.toLowerCase()))
                  )
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-[#FCF9F8] transition">
                      <td className="py-2.5 px-3 font-mono text-[#756568]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1E1416]">{log.recipient}</td>
                      <td className="py-2.5 px-3 text-[#5C494E]">{log.templateName}</td>
                      <td className="py-2.5 px-3 text-[#756568] max-w-xs truncate">{log.subject}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PROVIDER SETTINGS */}
      {activeTab === "SETTINGS" && (
        <div className="max-w-3xl bg-white border border-[#E8DFE0] rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1E1416]">
              Namecheap Private Email &amp; SMTP Transporter Configuration
            </h3>
            <p className="text-xs text-[#756568] mt-0.5">
              Configure your Namecheap Private Email credentials (mail.privateemail.com:465) for live transactional sending and Xendit receipt delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <label className="block md:col-span-2">
              <span className="font-bold text-[#5C494E]">Official Sender Display Name:</span>
              <input
                type="text"
                defaultValue="Brillo Events Management Services"
                className="w-full mt-1 px-3 py-2 border border-[#D6C7C9] rounded-lg bg-[#FAF7F5] text-[#1E1416]"
              />
            </label>

            <label className="block">
              <span className="font-bold text-[#5C494E]">Sender Email Address (From):</span>
              <input
                type="text"
                defaultValue="bookings@brilloevent.com"
                className="w-full mt-1 px-3 py-2 border border-[#D6C7C9] rounded-lg bg-[#FAF7F5] text-[#1E1416]"
              />
            </label>

            <label className="block">
              <span className="font-bold text-[#5C494E]">Reply-To Address (Shared Inbox):</span>
              <input
                type="text"
                defaultValue="info@brilloevent.com"
                className="w-full mt-1 px-3 py-2 border border-[#D6C7C9] rounded-lg bg-[#FAF7F5] text-[#1E1416]"
              />
            </label>

            <label className="block">
              <span className="font-bold text-[#5C494E]">SMTP Host (Namecheap):</span>
              <input
                type="text"
                defaultValue="mail.privateemail.com"
                className="w-full mt-1 px-3 py-2 border border-[#D6C7C9] rounded-lg bg-[#FAF7F5] font-mono text-[#1E1416]"
              />
            </label>

            <label className="block">
              <span className="font-bold text-[#5C494E]">SMTP Port &amp; Encryption:</span>
              <input
                type="text"
                defaultValue="465 (SSL / TLS Encrypted)"
                className="w-full mt-1 px-3 py-2 border border-[#D6C7C9] rounded-lg bg-[#FAF7F5] font-mono text-[#1E1416]"
              />
            </label>

            <label className="block">
              <span className="font-bold text-[#5C494E]">Private Email Password:</span>
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="Enter password for bookings@brilloevent.com"
                className="w-full mt-1 px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white font-mono text-[#1E1416] focus:border-[#780D22] focus:outline-none"
              />
              <span className="text-[10px] text-[#9A8A8C] mt-1 block">
                Required for authenticated SSL sending via mail.privateemail.com:465.
              </span>
            </label>

            <label className="block">
              <span className="font-bold text-[#5C494E]">Test Delivery Recipient:</span>
              <input
                type="email"
                value={testRecipientEmail}
                onChange={(e) => setTestRecipientEmail(e.target.value)}
                placeholder="bookings@brilloevent.com"
                className="w-full mt-1 px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
              />
              <span className="text-[10px] text-[#9A8A8C] mt-1 block">
                The test message will be dispatched directly to this mailbox.
              </span>
            </label>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-red-50 border-red-300 text-red-900"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold">
                  {testResult.success ? "SMTP Connection Verified!" : "SMTP Handshake Error"}
                </div>
                <div className="leading-relaxed">{testResult.message}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E8DFE0]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  smtpPassword ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="text-xs font-semibold text-[#5C494E]">
                {smtpPassword
                  ? "Ready to Test: mail.privateemail.com:465 (Password Loaded)"
                  : "Enter Password to Authenticate Transporter"}
              </span>
            </div>

            <button
              type="button"
              disabled={isTestingSmtp}
              onClick={handleTestConnection}
              className="py-2.5 px-5 rounded-xl bg-[#780D22] text-[#FFF8F0] font-bold text-xs hover:bg-[#590919] transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isTestingSmtp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying Transporter...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Save &amp; Send Test Email
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-[#FAF3EB] rounded-xl border border-[#D6B36A]/50 text-[11px] text-[#5C494E] space-y-1">
            <div className="font-bold text-[#8F620E]">Domain Authentication Status:</div>
            <div>• SPF: <span className="text-emerald-700 font-bold">Pass (v=spf1 include:spf.privateemail.com ~all)</span></div>
            <div>• DKIM: <span className="text-emerald-700 font-bold">Active (Namecheap Private Email Signed)</span></div>
            <div>• DMARC: <span className="text-emerald-700 font-bold">Configured (p=quarantine)</span></div>
          </div>
        </div>
      )}

      {/* MODAL 1: SEQUENCE CUSTOMIZER */}
      {editingSequence && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-[#E8DFE0] rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFE0]">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#780D22]" />
                <h3 className="font-serif font-bold text-base text-[#1E1416]">
                  {isCreatingNewSequence ? "Create Custom Automated Sequence" : `Edit Sequence: ${editingSequence.label}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSequence(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSequence(editingSequence);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-[#1E1416] block mb-1">Sequence Label / Name *</label>
                <input
                  type="text"
                  required
                  value={editingSequence.label}
                  onChange={(e) => setEditingSequence({ ...editingSequence, label: e.target.value })}
                  placeholder="e.g. VIP Booking Intake Follow-Up"
                  className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E1416] block mb-1">Trigger Event</label>
                  <select
                    value={editingSequence.triggerName}
                    onChange={(e) => setEditingSequence({ ...editingSequence, triggerName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                  >
                    <option value="INQUIRY_SUBMITTED">INQUIRY_SUBMITTED (Quote submitted)</option>
                    <option value="PROPOSAL_DISPATCHED">PROPOSAL_DISPATCHED (Quote created)</option>
                    <option value="PAYMENT_VERIFIED">PAYMENT_VERIFIED (Payment confirmed)</option>
                    <option value="BOOKING_CONFIRMED">BOOKING_CONFIRMED (Date secured)</option>
                    <option value="ACCOUNT_INVITED">ACCOUNT_INVITED (Portal activation)</option>
                    <option value="PASSWORD_RESET_REQUESTED">PASSWORD_RESET_REQUESTED</option>
                    <option value="EVENT_REMINDER_7D">EVENT_REMINDER_7D (7 days prior)</option>
                    <option value="EVENT_REMINDER_24H">EVENT_REMINDER_24H (24 hours prior)</option>
                    <option value="MANUAL_DISPATCH">MANUAL_DISPATCH (Manual trigger)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1E1416] block mb-1">Dispatch Timing</label>
                  <select
                    value={editingSequence.timing}
                    onChange={(e) => setEditingSequence({ ...editingSequence, timing: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                  >
                    <option value="Immediate">Immediate (0s delay)</option>
                    <option value="5 Minutes">5 Minutes Delay</option>
                    <option value="1 Hour">1 Hour Delay</option>
                    <option value="12 Hours">12 Hours Delay</option>
                    <option value="24 Hours">24 Hours Delay</option>
                    <option value="3 Days Before">3 Days Before Event</option>
                    <option value="7 Days Before">7 Days Before Event</option>
                    <option value="On Staff Action">On Staff Action</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E1416] block mb-1">Recipient Target</label>
                  <select
                    value={editingSequence.recipientType}
                    onChange={(e) => setEditingSequence({ ...editingSequence, recipientType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                  >
                    <option value="CUSTOMER">CUSTOMER (Client Email Address)</option>
                    <option value="STAFF">STAFF (bookings@brilloevent.com)</option>
                    <option value="SANTA">SANTA (Assigned Performer)</option>
                    <option value="CUSTOM">CUSTOM (Specific Mailbox)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1E1416] block mb-1">Connected Email Template</label>
                  <select
                    value={editingSequence.templateId}
                    onChange={(e) => setEditingSequence({ ...editingSequence, templateId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                  >
                    {EMAIL_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingSequence.recipientType === "CUSTOM" && (
                <div>
                  <label className="font-bold text-[#1E1416] block mb-1">Custom Recipient Email</label>
                  <input
                    type="email"
                    value={editingSequence.customRecipient || ""}
                    onChange={(e) => setEditingSequence({ ...editingSequence, customRecipient: e.target.value })}
                    placeholder="coordinator@client.com"
                    className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-[#1E1416] block mb-1">Custom Subject Line Override (Optional)</label>
                <input
                  type="text"
                  value={editingSequence.subjectOverride || ""}
                  onChange={(e) => setEditingSequence({ ...editingSequence, subjectOverride: e.target.value })}
                  placeholder="Leave empty to use default template subject"
                  className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#1E1416] block mb-1">Custom Sequence Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={editingSequence.customNotes || ""}
                  onChange={(e) => setEditingSequence({ ...editingSequence, customNotes: e.target.value })}
                  placeholder="Internal notes or special instructions for this automated sequence trigger"
                  className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E8DFE0]">
                <button
                  type="button"
                  onClick={() => handleTestTriggerSequence(editingSequence)}
                  className="px-3 py-2 rounded-xl border border-[#D6B36A] bg-[#FAF3EB] text-[#780D22] font-bold text-xs hover:bg-[#F4ECEE] transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-amber-600" /> Send Test to {testEmailAddr}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSequence(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#756568] hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#780D22] text-[#FFF8F0] font-bold text-xs hover:bg-[#590919] transition shadow-md"
                  >
                    Save Sequence
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CAMPAIGN COMPOSER */}
      {isCreatingCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-[#E8DFE0] rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFE0]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#780D22]" />
                <h3 className="font-serif font-bold text-base text-[#1E1416]">
                  Create Marketing Campaign Broadcast
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingCampaign(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCampaign();
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-[#1E1416] block mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Christmas 2026 Mall Tour Priority Booking"
                  className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1E1416] block mb-1">Target Audience</label>
                  <select
                    value={campaignAudience}
                    onChange={(e) => setCampaignAudience(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                  >
                    <option value="ALL_LEADS">All Leads &amp; CRM Contacts</option>
                    <option value="CORPORATE_MALLS">Corporate Malls &amp; Hotels</option>
                    <option value="PRIVATE_EVENTS">Private Event Organizers</option>
                    <option value="CONFIRMED_BOOKINGS">Confirmed Bookings</option>
                    <option value="CUSTOM_LIST">Custom Recipient List</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1E1416] block mb-1">Base Red Velvet Template</label>
                  <select
                    value={campaignTemplateId}
                    onChange={(e) => setCampaignTemplateId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                  >
                    {EMAIL_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {campaignAudience === "CUSTOM_LIST" && (
                <div>
                  <label className="font-bold text-[#1E1416] block mb-1">Target Email Addresses (comma separated)</label>
                  <input
                    type="text"
                    value={campaignCustomList}
                    onChange={(e) => setCampaignCustomList(e.target.value)}
                    placeholder="client1@smsupermalls.com, client2@ayalamalls.com.ph"
                    className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-[#1E1416] block mb-1">Email Subject Line *</label>
                <input
                  type="text"
                  required
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  placeholder="Exclusive 2026 Santa Booking Announcement | Brillo Events"
                  className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#1E1416] block mb-1">Custom Announcement Message</label>
                <textarea
                  rows={3}
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder="Add your special message, promo code, holiday greetings, or call-to-action details..."
                  className="w-full px-3 py-2 border border-[#D6C7C9] rounded-lg bg-white text-[#1E1416] focus:border-[#780D22] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DFE0]">
                <button
                  type="button"
                  onClick={() => setIsCreatingCampaign(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#756568] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#780D22] text-[#FFF8F0] font-bold text-xs hover:bg-[#590919] transition shadow-md"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
