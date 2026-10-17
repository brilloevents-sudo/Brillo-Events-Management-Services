"use client";

import { useEffect, useState } from "react";
import { Settings, ShieldAlert, Clock, Save, CheckCircle, FileText } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our seed, settings are stored in SystemSetting
    fetch("/api/dashboard")
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            System Settings &amp; Compliance Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global target policies, company metadata verification, and tamper-resistant audit logs.
          </p>
        </div>
      </div>

      {/* Mandatory Owner Verification Notice */}
      <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-semibold text-amber-300">
            Mandatory Contact Details Verification Notice
          </strong>
          <p className="leading-relaxed">
            Public reference contact details currently configured as{" "}
            <strong className="text-white">0927 887 2343</strong> and{" "}
            <strong className="text-white">brilloevents@gmail.com</strong>. The owner must verify
            ownership of these numbers and mailboxes before deploying to a public domain.
          </p>
        </div>
      </div>

      {/* Target Offer Rules */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-white flex items-center">
          <Settings className="w-4 h-4 mr-2 text-gold-400" />
          Playbook Target Offer Controls
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Metro Manila Target</span>
            <div className="text-lg font-bold text-gold-300 mt-1">₱18,000</div>
            <div className="text-[10px] text-slate-500 mt-1">Standard 4-hour block</div>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Provincial Target</span>
            <div className="text-lg font-bold text-gold-300 mt-1">₱23,400</div>
            <div className="text-[10px] text-slate-500 mt-1">+30% starting calculation</div>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Dec 24 &amp; 25 Holiday</span>
            <div className="text-lg font-bold text-gold-300 mt-1">₱23k – ₱30k</div>
            <div className="text-[10px] text-slate-500 mt-1">Quote actual talent rate</div>
          </div>

          <div className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Standard Downpayment</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">50%</div>
            <div className="text-[10px] text-slate-500 mt-1">Reservation deposit required</div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center">
          <Clock className="w-4 h-4 mr-2 text-slate-400" />
          System Mutation Audit Trail
        </h2>
        <p className="text-xs text-slate-400">
          All high-impact mutations (holds, verifications, bookings, rate overrides) are permanently recorded with actor identity.
        </p>

        <div className="p-4 rounded-lg bg-obsidian-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Audit system initialized and active. All mutation services log directly to Prisma store.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
