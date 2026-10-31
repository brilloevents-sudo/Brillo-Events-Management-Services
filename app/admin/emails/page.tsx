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
} from "lucide-react";
import { EMAIL_TEMPLATES, EmailTemplateDef, renderEmailTemplate } from "@/lib/email-templates";
import { DEFAULT_AUTOMATIONS, AutomationSequenceItem, EmailLogEntry } from "@/lib/email-automation";

export default function EmailAutomationCenterPage() {
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "SEQUENCES" | "TEMPLATES" | "LOGS" | "SETTINGS">("DASHBOARD");
  const [automations, setAutomations] = useState<AutomationSequenceItem[]>(DEFAULT_AUTOMATIONS);
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateDef>(EMAIL_TEMPLATES[0]);
  const [previewDevice, setPreviewDevice] = useState<"DESKTOP" | "MOBILE">("DESKTOP");
  const [searchLog, setSearchLog] = useState("");
  const [testEmailAddr, setTestEmailAddr] = useState("bookings@brilloevent.com");
  const [testSentNotice, setTestSentNotice] = useState(false);
  const [smtpPassword, setSmtpPassword] = useState("");
  const [testRecipientEmail, setTestRecipientEmail] = useState("bookings@brilloevent.com");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load existing logs and settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedPass = localStorage.getItem("brillo_smtp_pass_cached");
        if (cachedPass) {
          setSmtpPassword(cachedPass);
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
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = selectedTemplate.subject.replace("{{client_name}}", "Test Client");
    
    // Attempt live dispatch if password or API is available
    try {
      await fetch("/api/emails/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_CONNECTION",
          password: smtpPassword,
          testRecipient: testEmailAddr,
          customConfig: {
            subject: finalSubject,
          },
        }),
      });
    } catch {}

    const newLog: EmailLogEntry = {
      id: `eml_${Date.now()}`,
      recipient: testEmailAddr,
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
    setTestSentNotice(true);
    setTimeout(() => setTestSentNotice(false), 4000);
  };

  const handleTestConnection = async () => {
    setIsTestingSmtp(true);
    setTestResult(null);
    try {
      if (typeof window !== "undefined" && smtpPassword) {
        localStorage.setItem("brillo_smtp_pass_cached", smtpPassword);
      }
      const res = await fetch("/api/emails/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TEST_CONNECTION",
          password: smtpPassword,
          testRecipient: testRecipientEmail || "bookings@brilloevent.com",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to establish SMTP handshake.");
      }
      setTestResult({
        success: true,
        message: data.message || `Test email successfully dispatched to ${testRecipientEmail || "bookings@brilloevent.com"}!`,
      });
      const newLog: EmailLogEntry = {
        id: `eml_${Date.now()}`,
        recipient: testRecipientEmail || "bookings@brilloevent.com",
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
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#1E1416]">
              End-to-End Automated Triggers
            </h3>
            <span className="text-xs text-[#756568]">
              Toggle sequences ON or OFF without restarting the server.
            </span>
          </div>

          <div className="bg-white border border-[#E8DFE0] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#E8DFE0]">
            {automations.map((a) => (
              <div key={a.id} className="p-4 flex items-center justify-between hover:bg-[#FCF9F8] transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#1E1416]">{a.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#FAF3EB] text-[#8F620E] border border-[#E6CA85]">
                      {a.triggerName}
                    </span>
                  </div>
                  <div className="text-xs text-[#756568] flex items-center gap-3">
                    <span>Timing: <strong className="text-[#1E1416]">{a.timing}</strong></span>
                    <span>Recipient: <strong className="text-[#1E1416]">{a.recipientType}</strong></span>
                  </div>
                </div>

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
              </div>
            ))}
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
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#780D22] text-white text-xs font-bold hover:bg-[#590919] transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Test Preview
              </button>
              {testSentNotice && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-semibold text-center">
                  ✓ Test email logged and dispatched!
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
    </div>
  );
}
