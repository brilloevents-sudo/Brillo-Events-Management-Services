"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users2, Check, X, ShieldAlert, Sparkles, Image as ImageIcon, Plus } from "lucide-react";

export default function TalentsPage() {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function loadTalents() {
    setLoading(true);
    fetch("/api/talents")
      .then((res) => res.json())
      .then((d) => {
        if (d.talents) setTalents(d.talents);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTalents();
  }, []);

  async function togglePublicApproval(talentId: string, current: boolean) {
    try {
      await fetch(`/api/talents/${talentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedForPublicDisplay: !current }),
      });
      loadTalents();
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
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-crimson-950 text-crimson-300 border border-crimson-800 font-mono">
              REAL BEARD ROSTER
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              Talent Roster &amp; Extracted Photos
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            13 verified Real-Beard Santas with 28 authentic photos extracted from source DOCX archives.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center bg-obsidian-900 border border-slate-800 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {talents.map((t) => {
            const primaryPhoto = t.images.find((img: any) => img.isPrimary) || t.images[0];
            const isApproved = t.approvedForPublicDisplay;

            return (
              <div
                key={t.id}
                className="rounded-xl bg-obsidian-900 border border-slate-800/90 overflow-hidden shadow-md flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-56 bg-obsidian-950 border-b border-slate-800 overflow-hidden flex items-center justify-center">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto.publicUrl}
                        alt={primaryPhoto.caption || t.displayName}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-600">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <span className="text-xs font-mono">No Cleared Photo (Draft Profile)</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-gold-300 border border-slate-700">
                        {t.canonicalId}
                      </span>
                    </div>

                    {/* Photo Count */}
                    {t.images.length > 0 && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 backdrop-blur-md text-slate-300 border border-slate-700 flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-gold-400" />
                          <span>{t.images.length} photos</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">Santa {t.displayName}</h3>
                        <p className="text-xs text-slate-400">
                          {t.talentType} • {t.nationality || "International"}
                        </p>
                      </div>

                      <button
                        onClick={() => togglePublicApproval(t.id, isApproved)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center space-x-1 border transition ${
                          isApproved
                            ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                            : "bg-obsidian-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                        title="Toggle Public Site Visibility"
                      >
                        {isApproved ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />}
                        <span>{isApproved ? "Public Approved" : "Internal Only"}</span>
                      </button>
                    </div>

                    {/* Physical Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                      <div>
                        Height: <span className="text-slate-200">{t.height || "N/A"}</span>
                      </div>
                      <div>
                        Age: <span className="text-slate-200">{t.age ? `${t.age} yrs` : "N/A"}</span>
                      </div>
                      <div>
                        Base TF: <span className="text-emerald-400 font-bold">₱{Number(t.baseTalentFee || 12000).toLocaleString()}</span>
                      </div>
                      <div>
                        Target MM: <span className="text-gold-300 font-semibold">₱{Number(t.metroManilaRate || 18000).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Bio or Notes */}
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {t.bio || t.specialRateNote || "Real-beard Santa available for mall centerpieces and corporate events."}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3 border-t border-slate-800 bg-obsidian-950/60 flex items-center justify-between text-xs">
                  <Link
                    href={`/admin/individual-talent-bookings?talentId=${t.id}`}
                    className="text-gold-400 hover:text-gold-300 font-medium"
                  >
                    View Bookings ({t.assignments?.length || 0}) →
                  </Link>
                  <Link
                    href={`/admin/talents/${t.id}`}
                    className="px-2.5 py-1 rounded bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 border border-slate-700"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
