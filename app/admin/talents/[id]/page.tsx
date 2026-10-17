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
  AlertTriangle,
  FileText,
  DollarSign,
  ShieldAlert,
  Star,
  History,
  Lock,
} from "lucide-react";

export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "gallery" | "bookings" | "availability" | "rates" | "documents" | "payouts" | "audit"
  >("profile");

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

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
      setFeedback("Talent profile updated successfully!");
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A92F3A]"></div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="p-12 text-center text-[#6B706C]">
        Talent profile not found.
      </div>
    );
  }

  const primaryPhoto =
    talent.images?.find((img: any) => img.isPrimary)?.publicUrl ||
    talent.images?.[0]?.publicUrl ||
    "/brand/logo-brillo.png";

  const finance = talent.financeSummary || {};

  const tabs = [
    { id: "profile", label: "1. Profile" },
    { id: "gallery", label: `2. Photo Gallery (${talent.images?.length || 0})` },
    { id: "bookings", label: `3. Booking History (${talent.assignments?.length || 0})` },
    { id: "availability", label: "4. Availability" },
    { id: "rates", label: "5. Rates & Costing" },
    { id: "documents", label: "6. Documents" },
    { id: "payouts", label: "7. Payments & Payouts" },
    { id: "audit", label: "8. Notes & Audit" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Back link & Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DED4]">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/talents"
            className="p-2 rounded-lg bg-[#FFFEFB] border border-[#E2DED4] text-[#6B706C] hover:text-[#252824] shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Profile Header with Avatar */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#B99A5B] bg-[#F6F3EC] shrink-0 shadow-sm">
              <img
                src={primaryPhoto}
                alt={talent.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[#A92F3A] font-bold text-xs">
                  {talent.canonicalId}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#F6F3EC] text-[#6B706C] border border-[#E2DED4] font-mono">
                  Source: {talent.sourceName}
                </span>
                {talent.approvedForPublicDisplay ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                    Publicly Approved
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
                    Internal Only
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
                Santa {talent.displayName}
              </h1>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#A92F3A] hover:bg-[#8E252F] text-white flex items-center shadow-sm disabled:opacity-50 transition"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? "Saving Changes..." : "Save Profile"}
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs shadow-sm">
          {feedback}
        </div>
      )}

      {/* 8-Tab Operational Navigation (Codex Section 10) */}
      <div className="flex overflow-x-auto space-x-1 border-b border-[#E2DED4] pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#A92F3A] text-[#A92F3A] font-bold bg-[#FFFEFB]"
                : "border-transparent text-[#6B706C] hover:text-[#252824] hover:border-[#C5C0B4]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <form onSubmit={handleSave} className="md:col-span-2 space-y-4">
            <div className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-4 shadow-sm">
              <h2 className="text-sm font-serif font-bold text-[#252824]">Talent Parameters</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B706C] mb-1 font-medium">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFEFB] border border-[#E2DED4] rounded-lg text-[#252824] focus:ring-1 focus:ring-[#B99A5B]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B706C] mb-1 font-medium">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFEFB] border border-[#E2DED4] rounded-lg text-[#252824] focus:ring-1 focus:ring-[#B99A5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#6B706C] mb-1 font-medium">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFEFB] border border-[#E2DED4] rounded-lg text-[#252824] focus:ring-1 focus:ring-[#B99A5B]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B706C] mb-1 font-medium">Height</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFEFB] border border-[#E2DED4] rounded-lg text-[#252824] focus:ring-1 focus:ring-[#B99A5B]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B706C] mb-1 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFEFB] border border-[#E2DED4] rounded-lg text-[#252824] focus:ring-1 focus:ring-[#B99A5B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B706C] mb-1 font-medium">Biography &amp; Holiday Portfolio Brief</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFEFB] border border-[#E2DED4] rounded-lg text-[#252824] resize-none focus:ring-1 focus:ring-[#B99A5B]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-[#E2DED4]">
                <input
                  type="checkbox"
                  id="publicApproved"
                  checked={approvedForPublicDisplay}
                  onChange={(e) => setApprovedForPublicDisplay(e.target.checked)}
                  className="rounded text-[#A92F3A] focus:ring-[#B99A5B]"
                />
                <label htmlFor="publicApproved" className="text-[#252824] font-medium cursor-pointer">
                  Approved for Public Funnel Display (Permitted for client quote preferences)
                </label>
              </div>
            </div>
          </form>

          {/* Quick Stats sidebar */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-3 shadow-sm">
              <h2 className="text-sm font-serif font-bold text-[#252824] flex items-center">
                <Wallet className="w-4 h-4 mr-1.5 text-[#B99A5B]" />
                Paluwal Active Balance
              </h2>
              <div className="space-y-2 font-mono text-xs pt-1">
                <div className="flex justify-between">
                  <span className="text-[#6B706C]">Total Advances:</span>
                  <span className="text-amber-800 font-bold">
                    ₱{Number(finance.totalAdvances || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B706C]">Total Recovered:</span>
                  <span className="text-emerald-800 font-semibold">
                    ₱{Number(finance.totalDeductions || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E2DED4] pt-1">
                  <span className="text-[#6B706C]">Net Outstanding:</span>
                  <span className="text-[#A92F3A] font-bold">
                    ₱{Number(finance.netAdvanceBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Photo Gallery */}
      {activeTab === "gallery" && (
        <div className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2DED4]">
            <div>
              <h2 className="text-base font-serif font-bold text-[#252824]">
                Extracted Real Portraits ({talent.images?.length || 0})
              </h2>
              <p className="text-xs text-[#6B706C]">
                Extracted from historical DOCX casting dossiers in `Real beard-20261017T021027Z-1-001.zip`
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {talent.images?.map((img: any) => (
              <div
                key={img.id}
                className="rounded-lg overflow-hidden border border-[#E2DED4] bg-[#F6F3EC] flex flex-col group relative shadow-sm"
              >
                <div className="h-44 overflow-hidden bg-slate-100">
                  <img
                    src={img.publicUrl}
                    alt={img.caption || talent.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-2 text-[10px] text-[#6B706C] font-mono truncate">
                  {img.caption || img.fileName}
                </div>
                {img.isPrimary && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-[#B99A5B] text-white shadow-sm">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Booking History */}
      {activeTab === "bookings" && (
        <div className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-4 shadow-sm">
          <h2 className="text-base font-serif font-bold text-[#252824]">
            All Scheduled &amp; Historical Engagements ({talent.assignments?.length || 0})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F6F3EC] text-[10px] font-mono uppercase text-[#6B706C] border-b border-[#E2DED4]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Booking #</th>
                  <th className="py-2.5 px-3">Mall / Venue</th>
                  <th className="py-2.5 px-3">Agreed TF</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DED4]/60">
                {talent.assignments?.map((a: any) => (
                  <tr key={a.id} className="hover:bg-[#F6F3EC]/60">
                    <td className="py-2.5 px-3 font-mono">
                      {new Date(a.booking?.eventDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#A92F3A]">
                      {a.booking?.bookingNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#252824]">
                      {a.booking?.mallOrVenue}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-800">
                      ₱{Number(a.agreedTalentFee || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px]">
                      {a.booking?.status}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/admin/bookings/${a.booking?.id}`}
                        className="text-[#A92F3A] hover:underline text-[11px] font-medium"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Availability */}
      {activeTab === "availability" && (
        <div className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-4 shadow-sm">
          <h2 className="text-base font-serif font-bold text-[#252824]">
            Calendar Availability &amp; Blackout Dates
          </h2>
          <p className="text-xs text-[#6B706C]">
            Managed via the master operations dispatch engine. Days with confirmed appearances are locked against overlap conflicts.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {talent.assignments?.map((a: any) => (
              <div key={a.id} className="p-3 rounded-lg bg-[#F6F3EC] border border-[#E2DED4]">
                <span className="font-mono text-xs font-bold text-[#A92F3A] block">
                  {new Date(a.booking?.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </span>
                <span className="text-[#252824] block truncate mt-1">{a.booking?.mallOrVenue}</span>
                <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">Booked</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Rates & Costing */}
      {activeTab === "rates" && (
        <div className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#B99A5B]" />
            <h2 className="text-base font-serif font-bold text-[#252824]">
              Internal Rate Card (Restricted to Finance &amp; Admin)
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#F6F3EC]">
              <span className="text-[#6B706C] block">Internal Base TF</span>
              <strong className="text-lg font-mono text-emerald-800 block mt-1">
                ₱{Number(baseTalentFee).toLocaleString()}
              </strong>
            </div>
            <div className="p-4 rounded-lg bg-[#F6F3EC]">
              <span className="text-[#6B706C] block">Metro Manila Target</span>
              <strong className="text-lg font-mono text-[#252824] block mt-1">
                ₱{Number(metroManilaRate).toLocaleString()}
              </strong>
            </div>
            <div className="p-4 rounded-lg bg-[#F6F3EC]">
              <span className="text-[#6B706C] block">Provincial (+30%)</span>
              <strong className="text-lg font-mono text-[#252824] block mt-1">
                ₱{Number(provincialRate).toLocaleString()}
              </strong>
            </div>
            <div className="p-4 rounded-lg bg-[#F6F3EC]">
              <span className="text-[#6B706C] block">Holiday Rate</span>
              <strong className="text-lg font-mono text-[#A92F3A] block mt-1">
                ₱{Number(holidayRate).toLocaleString()}
              </strong>
            </div>
          </div>
          {specialRateNote && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono">
              <strong>Source Note:</strong> {specialRateNote}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Documents */}
      {activeTab === "documents" && (
        <div className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-3 shadow-sm text-xs">
          <h2 className="text-base font-serif font-bold text-[#252824]">
            Dossier &amp; Casting Files
          </h2>
          <div className="p-4 rounded-lg bg-[#F6F3EC] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-[#B99A5B]" />
              <div>
                <strong className="text-[#252824] block">{talent.sourceName}.docx</strong>
                <span className="text-[11px] text-[#6B706C]">Historical DOCX Casting Archive</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
              Archived
            </span>
          </div>
        </div>
      )}

      {/* Tab 7: Payments & Payouts */}
      {activeTab === "payouts" && (
        <div className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-4 shadow-sm text-xs">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#B99A5B]" />
            <h2 className="text-base font-serif font-bold text-[#252824]">
              Disbursements &amp; Payout Ledgers
            </h2>
          </div>
          <p className="text-[#6B706C]">
            Managed via Finance. Paluwal cash advances are reconciled before final performance balance payout.
          </p>
          <Link
            href={`/admin/paluwal?talentId=${talent.id}`}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#A92F3A] text-white font-medium hover:bg-[#8E252F] transition"
          >
            Open Paluwal Advance Records →
          </Link>
        </div>
      )}

      {/* Tab 8: Notes & Audit */}
      {activeTab === "audit" && (
        <div className="p-6 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-3 shadow-sm text-xs">
          <h2 className="text-base font-serif font-bold text-[#252824]">
            Audit Trail &amp; Source Provenance
          </h2>
          <div className="p-4 rounded-lg bg-[#F6F3EC] space-y-2 font-mono text-[11px]">
            <div><strong>Created:</strong> {new Date(talent.createdAt).toISOString()}</div>
            <div><strong>Last Updated:</strong> {new Date(talent.updatedAt).toISOString()}</div>
            <div><strong>Canonical Talent ID:</strong> {talent.canonicalId}</div>
            <div><strong>Originating Tracker:</strong> SANTA OPERATION TRACKER- 2026.xlsx</div>
          </div>
        </div>
      )}
    </div>
  );
}
