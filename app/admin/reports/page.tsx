"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Calendar, Users2 } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const metrics = data?.metrics || {};

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="pb-4 border-b border-[#E2DED4]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
          Management &amp; Analytics
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
          Executive Financial &amp; Deployment Reports
        </h1>
        <p className="text-xs text-[#6B706C] mt-1">
          Separates verified cash receipts, outstanding receivables, recorded expenses, and Paluwal advances.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#6B706C]">Loading financial summaries...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm">
            <span className="text-xs text-[#6B706C]">Verified Receipts</span>
            <div className="text-2xl font-serif font-bold text-emerald-800 mt-1">
              ₱{Number(metrics.totalVerifiedRevenue || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#6B706C] mt-1">Audited bank inflows only</p>
          </div>

          <div className="p-5 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm">
            <span className="text-xs text-[#6B706C]">Outstanding Collectibles</span>
            <div className="text-2xl font-serif font-bold text-[#A92F3A] mt-1">
              ₱{Number(metrics.totalOutstandingReceivables || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#6B706C] mt-1">Remaining contract balances</p>
          </div>

          <div className="p-5 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm">
            <span className="text-xs text-[#6B706C]">Recorded Expenses</span>
            <div className="text-2xl font-serif font-bold text-[#252824] mt-1">
              ₱{Number(metrics.totalExpenses || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#6B706C] mt-1">Operational disbursements</p>
          </div>

          <div className="p-5 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] shadow-sm">
            <span className="text-xs text-[#6B706C]">Paluwal Advances</span>
            <div className="text-2xl font-serif font-bold text-[#B99A5B] mt-1">
              ₱{Number(metrics.totalPaluwalAdvances || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#6B706C] mt-1">Talent cash advance ledger</p>
          </div>
        </div>
      )}
    </div>
  );
}
