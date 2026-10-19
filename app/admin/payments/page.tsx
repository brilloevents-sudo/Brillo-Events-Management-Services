"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  Zap,
  Save,
  KeyRound,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  // Xendit PH Payout / Receiving Accounts Configuration
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [xenditSecretKey, setXenditSecretKey] = useState("");
  const [accountHolderName, setAccountHolderName] = useState(
    "Brillo Events Management Services"
  );
  const [gcashNumber, setGcashNumber] = useState("0927 887 2343");
  const [bpiAccount, setBpiAccount] = useState("0041-8923-74");
  const [bdoAccount, setBdoAccount] = useState("0078-4029-1852");
  const [ubpAccount, setUbpAccount] = useState("1094-5288-3910");
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("brillo_xendit_secret_key") || "";
      setXenditSecretKey(storedKey);
      try {
        const storedAcc = localStorage.getItem("brillo_xendit_accounts");
        if (storedAcc) {
          const parsed = JSON.parse(storedAcc);
          if (parsed.ACCOUNT_NAME) setAccountHolderName(parsed.ACCOUNT_NAME);
          if (parsed.GCASH) setGcashNumber(parsed.GCASH);
          if (parsed.BPI) setBpiAccount(parsed.BPI);
          if (parsed.BDO) setBdoAccount(parsed.BDO);
          if (parsed.UBP) setUbpAccount(parsed.UBP);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  function saveGatewaySettings(e: React.FormEvent) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("brillo_xendit_secret_key", xenditSecretKey.trim());
      localStorage.setItem(
        "brillo_xendit_accounts",
        JSON.stringify({
          ACCOUNT_NAME: accountHolderName,
          GCASH: gcashNumber,
          MAYA: gcashNumber,
          BPI: bpiAccount,
          BDO: bdoAccount,
          UBP: ubpAccount,
        })
      );
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  }

  function loadPayments() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);

    fetch(`/api/payments?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.payments) setPayments(d.payments);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPayments();
  }, [filterStatus]);

  async function updatePaymentStatus(paymentId: string, status: "VERIFIED" | "REJECTED") {
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          status,
          verificationNotes: `Marked ${status} by finance staff`,
        }),
      });
      const data = await res.json();
      if (data.success) loadPayments();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              FINANCE GATE × XENDIT PH
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Payments &amp; Xendit Gateway Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automatic Xendit PH settlement (GCash, BPI, BDO, UnionBank, QR Ph) and manual deposit verification.
          </p>
        </div>

        <button
          onClick={() => setShowGatewayConfig(!showGatewayConfig)}
          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-2 transition self-start md:self-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{showGatewayConfig ? "Hide Xendit & Bank Config" : "Configure GCash / BPI / Xendit Gateway"}</span>
        </button>
      </div>

      {/* Xendit Gateway & Receiving Bank Configuration Panel */}
      {showGatewayConfig && (
        <form
          onSubmit={saveGatewaySettings}
          className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4 text-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-gold-400" />
                <span>Xendit PH Automatic Payment Gateway &amp; Settlement Accounts</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Powered by <code className="text-emerald-400">xendit/xendit-php</code> &amp;{" "}
                <code className="text-emerald-400">xendit-node</code>. Customize the GCash, BPI, BDO, and UnionBank accounts displayed on the landing page checkout.
              </p>
            </div>
            {savedNotice && (
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-[11px]">
                ✓ Gateway Accounts Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Account Holder / Merchant Name
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                GCash / Maya Mobile Number
              </label>
              <input
                type="text"
                value={gcashNumber}
                onChange={(e) => setGcashNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                BPI Account Number (Direct / InstaPay)
              </label>
              <input
                type="text"
                value={bpiAccount}
                onChange={(e) => setBpiAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                BDO Unibank Account Number
              </label>
              <input
                type="text"
                value={bdoAccount}
                onChange={(e) => setBdoAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                UnionBank Account Number
              </label>
              <input
                type="text"
                value={ubpAccount}
                onChange={(e) => setUbpAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Xendit Secret API Key (Optional Live Key)
              </label>
              <input
                type="password"
                placeholder="xnd_production_... or xnd_development_..."
                value={xenditSecretKey}
                onChange={(e) => setXenditSecretKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Webhook Endpoint: <code className="text-gold-400">https://brilloevent.com/api/webhooks/xendit</code> • PHP Bridge:{" "}
              <code className="text-gold-400">integrations/xendit-php/brillo-xendit-gateway.php</code>
            </span>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Xendit &amp; Bank Accounts</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setFilterStatus("")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterStatus === ""
              ? "bg-gold-500 text-obsidian-950 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Payments ({payments.length})
        </button>
        <button
          onClick={() => setFilterStatus("PENDING_VERIFICATION")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterStatus === "PENDING_VERIFICATION"
              ? "bg-amber-800 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Pending Verification
        </button>
        <button
          onClick={() => setFilterStatus("VERIFIED")}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterStatus === "VERIFIED"
              ? "bg-emerald-800 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Verified
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-obsidian-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-obsidian-950/80 text-[10px] font-mono text-slate-400 uppercase">
                  <th className="p-3.5">Booking / Client</th>
                  <th className="p-3.5">Payment Type</th>
                  <th className="p-3.5">Amount (₱)</th>
                  <th className="p-3.5">Method &amp; Ref</th>
                  <th className="p-3.5">Proof</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => {
                  const isPending = p.status === "PENDING_VERIFICATION";
                  const isVerified = p.status === "VERIFIED";

                  return (
                    <tr key={p.id} className="hover:bg-obsidian-850/40 transition">
                      <td className="p-3.5">
                        <div className="font-mono text-gold-400 font-semibold text-[11px]">
                          {p.booking?.bookingNumber}
                        </div>
                        <div className="text-white font-medium text-xs mt-0.5">
                          {p.booking?.client?.companyName || p.booking?.client?.primaryContact}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.booking?.mallOrVenue}
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-300">
                        {p.paymentType}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                        ₱{Number(p.amount).toLocaleString()}
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">
                        <div>{p.paymentMethod}</div>
                        <div className="text-[10px] text-slate-500">
                          {p.referenceNumber || "No ref recorded"}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {p.proofFileUrl ? (
                          <a
                            href={p.proofFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-gold-400 hover:text-gold-300 font-mono text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">
                            {String(p.paymentMethod || "").startsWith("XENDIT")
                              ? "Xendit Auto-Webhook"
                              : "No proof file"}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            isVerified
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : isPending
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : "bg-red-950 text-red-300 border-red-800"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.verifiedAt && (
                          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                            Verified {new Date(p.verifiedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => updatePaymentStatus(p.id, "VERIFIED")}
                              className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center transition"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verify
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(p.id, "REJECTED")}
                              className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {isVerified ? "Verified Gate Satisfied" : "Payment Rejected"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
