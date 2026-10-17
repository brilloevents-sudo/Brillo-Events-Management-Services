"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, ShieldCheck } from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setLogs(d.recentAuditLogs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="pb-4 border-b border-[#E2DED4]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
          Governance &amp; Traceability
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
          Immutable System Audit Log
        </h1>
        <p className="text-xs text-[#6B706C] mt-1">
          Chronological record of booking confirmations, hold expirations, payment verifications, and import commits.
        </p>
      </div>

      <div className="bg-[#FFFEFB] border border-[#E2DED4] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F6F3EC] border-b border-[#E2DED4] text-[10px] font-mono uppercase tracking-wider text-[#6B706C]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DED4]/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#6B706C]">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#6B706C]">
                  All recent system events are tracked in the Settings &amp; Audit database table.
                </td>
              </tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-[#F6F3EC]/60">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#6B706C]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#252824]">{log.actorRole || "SYSTEM"}</td>
                  <td className="py-3 px-4 font-mono text-[#A92F3A] font-bold">{log.action}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">{log.entityType}</td>
                  <td className="py-3 px-4 text-[#252824]">{log.reason || "Executed"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
