"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users2,
  Check,
  X,
  Image as ImageIcon,
  UserCog,
  Phone,
} from "lucide-react";

export default function UnifiedRosterPage() {
  const [activeTab, setActiveTab] = useState<"SANTAS" | "PA_CREW">("SANTAS");
  const [talents, setTalents] = useState<any[]>([]);
  const [crew, setCrew] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function loadRoster() {
    setLoading(true);
    Promise.all([
      fetch("/api/talents").then((r) => r.json()).catch(() => ({ talents: [] })),
      fetch("/api/bookings").then((r) => r.json()).catch(() => ({ bookings: [] })),
    ])
      .then(([tData, bData]) => {
        if (tData?.talents) setTalents(tData.talents);
        if (bData?.bookings) {
          const paMap = new Map<string, any>();
          bData.bookings.forEach((b: any) => {
            const paName = b.paAssigned || "Dedicated Field PA Handler";
            if (!paMap.has(paName)) {
              paMap.set(paName, {
                name: paName,
                assignments: [],
                phone: "0906 439 0028 (Dispatch Hotline)",
              });
            }
            paMap.get(paName).assignments.push(b);
          });
          setCrew(Array.from(paMap.values()));
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRoster();
  }, []);

  async function togglePublicApproval(talentId: string, current: boolean) {
    try {
      await fetch(`/api/talents/${talentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedForPublicDisplay: !current }),
      });
      loadRoster();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-esign px-2.5 py-0.5 rounded text-[10px] font-mono">
              STAGE 2 • ROSTER &amp; DISPATCH
            </span>
            <h1 className="page-title text-2xl font-serif tracking-tight">
              Santa &amp; Field Crew Roster
            </h1>
          </div>
          <p className="page-subtitle text-xs mt-1">
            Unified roster of authenticated Real-Beard Santa performers and dedicated PA / event handlers.
          </p>
        </div>

        {/* Tab Toggle: Santa Performers vs PA & Crew */}
        <div className="inline-flex rounded-lg bg-white border border-[#D6C7C9] p-0.5 shadow-sm text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("SANTAS")}
            className={`px-3.5 py-1.5 rounded-md font-semibold flex items-center space-x-1.5 transition ${
              activeTab === "SANTAS"
                ? "bg-[#9B1B30] text-white"
                : "text-[#4A3A3D] hover:text-[#1E1416]"
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Santa Performers ({talents.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PA_CREW")}
            className={`px-3.5 py-1.5 rounded-md font-semibold flex items-center space-x-1.5 transition ${
              activeTab === "PA_CREW"
                ? "bg-[#9B1B30] text-white"
                : "text-[#4A3A3D] hover:text-[#1E1416]"
            }`}
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>PA &amp; Handlers ({crew.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card p-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B1B30]" />
        </div>
      ) : activeTab === "SANTAS" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {talents.map((t) => {
            const images = t.images || [];
            const primaryPhoto = images.find((img: any) => img.isPrimary) || images[0];
            const isApproved = t.approvedForPublicDisplay;

            return (
              <div
                key={t.id}
                className="dashboard-card overflow-hidden flex flex-col justify-between hover:border-[#9B1B30]/50 transition"
              >
                <div>
                  <div className="relative h-56 bg-[#F4ECEE] border-b border-[#E8DFE0] overflow-hidden flex items-center justify-center">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto.publicUrl}
                        alt={primaryPhoto.caption || t.displayName}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-6 text-[#756568]">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <span className="text-xs font-mono">No Cleared Portrait</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#181012]/85 text-[#F8E2A8] border border-[#C68A12]/40">
                        {t.canonicalId}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#1E1416]">
                          Santa {t.displayName}
                        </h3>
                        <p className="text-xs text-[#756568]">
                          {t.talentType} • {t.nationality || "International"}
                        </p>
                      </div>

                      <button
                        onClick={() => togglePublicApproval(t.id, isApproved)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center space-x-1 border transition ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-[#FCF9F8] text-[#756568] border-[#D6C7C9] hover:text-[#1E1416]"
                        }`}
                      >
                        {isApproved ? (
                          <Check className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        <span>{isApproved ? "Public Approved" : "Internal"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#4A3A3D] font-mono pt-2 border-t border-[#E8DFE0]">
                      <div>
                        Height: <strong className="text-[#1E1416]">{t.height || "N/A"}</strong>
                      </div>
                      <div>
                        Age:{" "}
                        <strong className="text-[#1E1416]">
                          {t.age ? `${t.age} yrs` : "N/A"}
                        </strong>
                      </div>
                      <div>
                        Base TF:{" "}
                        <strong className="text-emerald-700">
                          ₱{Number(t.baseTalentFee || 12000).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        MM Rate:{" "}
                        <strong className="text-[#9B1B30]">
                          ₱{Number(t.metroManilaRate || 18000).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-[#E8DFE0] bg-[#FCF9F8] flex items-center justify-between text-xs">
                  <Link
                    href="/admin/bookings?tab=DIRECT_TALENT"
                    className="text-[#9B1B30] hover:underline font-semibold"
                  >
                    Bookings ({t.assignments?.length || 0}) →
                  </Link>
                  <Link
                    href={`/admin/talents/${t.id}`}
                    className="px-2.5 py-1 rounded-md bg-white hover:border-[#9B1B30] text-[#1E1416] border border-[#D6C7C9] font-medium transition"
                  >
                    8-Tab Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crew.map((member, idx) => (
            <div key={idx} className="dashboard-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#F9EBED] border border-[#F0D0D5] flex items-center justify-center text-[#9B1B30] font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1E1416]">{member.name}</h2>
                    <span className="text-[10px] text-[#756568] font-mono uppercase">
                      Production Assistant &amp; Handler
                    </span>
                  </div>
                </div>
                <span className="badge-gold text-[10px] px-2 py-0.5 rounded font-mono">
                  {member.assignments.length} Events
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-[#4A3A3D] pt-2 border-t border-[#E8DFE0]">
                <Phone className="w-3.5 h-3.5 text-[#C68A12]" />
                <span className="font-mono text-[11px]">{member.phone}</span>
              </div>

              <div className="pt-2 border-t border-[#E8DFE0] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#756568] font-bold block">
                  Recent Venue Dispatches:
                </span>
                {member.assignments.slice(0, 3).map((a: any) => (
                  <div
                    key={a.id}
                    className="text-[11px] p-1.5 rounded bg-[#FCF9F8] border border-[#E8DFE0] flex items-center justify-between"
                  >
                    <span className="text-[#1E1416] font-medium truncate">
                      {a.mallOrVenue}
                    </span>
                    <span className="text-[#756568] font-mono text-[10px]">
                      {new Date(a.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
