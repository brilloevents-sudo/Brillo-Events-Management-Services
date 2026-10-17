"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Search, Phone, Mail, FileText, ArrowRight } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setClients(d.clients);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(
    (c) =>
      (c.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.contactPerson || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2DED4]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
            Accounts &amp; Agencies
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
            Clients &amp; Agencies Directory
          </h1>
          <p className="text-xs text-[#6B706C] mt-1">
            Corporate mall operators, event agencies, and private account records derived from bookings.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#6B706C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFEFB] border border-[#E2DED4] text-xs text-[#252824] rounded-md pl-8 pr-3 py-1.5"
          />
        </div>
      </div>

      <div className="bg-[#FFFEFB] border border-[#E2DED4] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F6F3EC] border-b border-[#E2DED4] text-[10px] font-mono uppercase tracking-wider text-[#6B706C]">
              <th className="py-3 px-4">Company / Account</th>
              <th className="py-3 px-4">Point Person</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Total Bookings</th>
              <th className="py-3 px-4 text-right">Total Quoted Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DED4]/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#6B706C]">
                  Loading client directory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#6B706C]">
                  No matching client accounts found.
                </td>
              </tr>
            ) : (
              filtered.map((client) => {
                const totalVolume = (client.bookings || []).reduce(
                  (acc: number, b: any) => acc + Number(b.clientQuotedAmount || 0),
                  0
                );
                return (
                  <tr key={client.id} className="hover:bg-[#F6F3EC]/60 transition">
                    <td className="py-3 px-4 font-semibold text-[#252824]">
                      {client.companyName || "Direct Client"}
                    </td>
                    <td className="py-3 px-4 text-[#252824]">
                      {client.contactPerson || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#6B706C]">
                      {client.email || client.phone || "On file"}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#F6F3EC] border border-[#E2DED4] text-[#252824] font-semibold">
                        {client.bookings?.length || 0} Bookings
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#A92F3A]">
                      ₱{totalVolume.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
