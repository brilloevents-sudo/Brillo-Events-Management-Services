"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users2,
  ArrowLeft,
  Calendar,
  Wallet,
  Check,
  X,
  Image as ImageIcon,
  Save,
  Clock,
  Building2,
} from "lucide-react";

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [height, setHeight] = useState("");
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [baseTalentFee, setBaseTalentFee] = useState<number | string>("");
  const [metroManilaRate, setMetroManilaRate] = useState<number | string>("");
  const [provincialRate, setProvincialRate] = useState<number | string>("");
  const [holidayRate, setHolidayRate] = useState<number | string>("");
  const [specialRateNote, setSpecialRateNote] = useState("");
  const [bio, setBio] = useState("");
  const [approvedForPublicDisplay, setApprovedForPublicDisplay] = useState(false);

  function loadTalent() {
    setLoading(true);
    fetch(`/api/talents/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.talent) {
          const t = data.talent;
          setTalent(t);
          setDisplayName(t.displayName || "");
          setAge(t.age || "");
          setHeight(t.height || "");
          setNationality(t.nationality || "");
          setPhone(t.phone || "");
          setBaseTalentFee(t.baseTalentFee ? Number(t.baseTalentFee) : 12000);
          setMetroManilaRate(t.metroManilaRate ? Number(t.metroManilaRate) : 18000);
          setProvincialRate(t.provincialRate ? Number(t.provincialRate) : 23400);
          setHolidayRate(t.holidayRate ? Number(t.holidayRate) : 21000);
          setSpecialRateNote(t.specialRateNote || "");
          setBio(t.bio || "");
          setApprovedForPublicDisplay(Boolean(t.approvedForPublicDisplay));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTalent();
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/talents/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          age: age ? parseInt(String(age), 10) : null,
          height,
          nationality,
          phone,
          baseTalentFee: parseFloat(String(baseTalentFee)),
          metroManilaRate: parseFloat(String(metroManilaRate)),
          provincialRate: parseFloat(String(provincialRate)),
          holidayRate: parseFloat(String(holidayRate)),
          specialRateNote,
          bio,
          approvedForPublicDisplay,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFeedback("Profile updated successfully!");
      loadTalent();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  if (!talent) {
    return <div className="p-12 text-center text-slate-500">Talent profile not found.</div>;
  }

  const finance = talent.financeSummary || {};

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/talents"
            className="p-2 rounded-lg bg-obsidian-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-gold-400 font-bold text-sm">
                {talent.canonicalId}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-obsidian-900 text-slate-400 border border-slate-700">
                Source: {talent.sourceName}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Santa {talent.displayName}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg text-xs font-semibold bg-crimson-700 hover:bg-crimson-600 text-white flex items-center shadow-md disabled:opacity-50 transition"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? "Saving Changes..." : "Save Profile"}
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs">
          {feedback}
        </div>
      )}

      {/* Extracted Photo Gallery */}
      <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-white flex items-center">
            <ImageIcon className="w-4 h-4 mr-2 text-gold-400" />
            Extracted Real Photos ({talent.images?.length || 0})
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Extracted directly from Real Beard DOCX archive
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {talent.images?.map((img: any) => (
            <div
              key={img.id}
              className="rounded-lg overflow-hidden border border-slate-800 bg-obsidian-950 flex flex-col group relative"
            >
              <div className="h-36 overflow-hidden">
                <img
                  src={img.publicUrl}
                  alt={img.caption || talent.displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-2 text-[10px] text-slate-400 font-mono truncate">
                {img.caption || img.fileName}
              </div>
              {img.isPrimary && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-gold-600 text-obsidian-950">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Edit Form (Left) & Finance/Bookings (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Left Column: Profile Form (2 cols) */}
        <form onSubmit={handleSave} className="md:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white">Talent Parameters &amp; Rate Sheet</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Display Name *</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nationality</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Height</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Base TF (₱)</label>
                <input
                  type="number"
                  value={baseTalentFee}
                  onChange={(e) => setBaseTalentFee(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Metro Manila (₱)</label>
                <input
                  type="number"
                  value={metroManilaRate}
                  onChange={(e) => setMetroManilaRate(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Provincial (₱)</label>
                <input
                  type="number"
                  value={provincialRate}
                  onChange={(e) => setProvincialRate(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Holiday Rate (₱)</label>
                <input
                  type="number"
                  value={holidayRate}
                  onChange={(e) => setHolidayRate(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Special Rate / Operational Note</label>
              <input
                type="text"
                value={specialRateNote}
                onChange={(e) => setSpecialRateNote(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white"
                placeholder="e.g. Marquee - 13,000, SM mega 14,000"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Biography &amp; Holiday Portfolio Brief</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-obsidian-950 border border-slate-700 rounded-lg text-white resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
              <input
                type="checkbox"
                id="publicApproved"
                checked={approvedForPublicDisplay}
                onChange={(e) => setApprovedForPublicDisplay(e.target.checked)}
                className="rounded text-crimson-600 focus:ring-gold-500"
              />
              <label htmlFor="publicApproved" className="text-slate-200 font-medium cursor-pointer">
                Approved for Public Funnel Display (Shows on client-facing site)
              </label>
            </div>
          </div>
        </form>

        {/* Right Column: Financial Balances & Bookings (1 col) */}
        <div className="space-y-6">
          {/* Paluwal Summary */}
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Wallet className="w-4 h-4 mr-1.5 text-gold-400" />
              Paluwal Ledger Balance
            </h2>

            <div className="space-y-2 font-mono text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Advances Given:</span>
                <span className="text-amber-400 font-bold">₱{Number(finance.totalAdvances || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Deducted:</span>
                <span className="text-emerald-400 font-semibold">₱{Number(finance.totalDeductions || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1">
                <span className="text-slate-400">Net Active Balance:</span>
                <span className="text-rose-400 font-bold">₱{Number(finance.netAdvanceBalance || 0).toLocaleString()}</span>
              </div>
            </div>

            <Link
              href={`/admin/paluwal?talentId=${talent.id}`}
              className="block text-center mt-3 py-2 rounded bg-obsidian-950 hover:bg-obsidian-850 border border-slate-800 text-slate-300 font-mono text-[11px]"
            >
              Open Full Paluwal Ledger →
            </Link>
          </div>

          {/* Bookings Assigned */}
          <div className="p-5 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
              Appearances ({talent.assignments?.length || 0})
            </h2>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {talent.assignments?.map((a: any) => (
                <div key={a.id} className="p-2.5 rounded bg-obsidian-950 border border-slate-800 text-xs space-y-0.5">
                  <div className="font-semibold text-white">{a.booking?.mallOrVenue}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(a.booking?.eventDate).toLocaleDateString()} • {a.booking?.bookingNumber}
                  </div>
                  <div className="text-emerald-400 text-[11px] font-mono">
                    Fee: ₱{Number(a.agreedTalentFee || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
