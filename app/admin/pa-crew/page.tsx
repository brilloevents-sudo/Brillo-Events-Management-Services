"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCog,
  Search,
  Plus,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  UserCheck,
} from "lucide-react";

export default function PACrewPage() {
  const [crew, setCrew] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our seed and schema, PAs are users with role PA or recorded on booking metadata
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          // Extract unique PAs assigned across bookings
          const paMap = new Map();
          d.bookings.forEach((b: any) => {
            const paName = b.paAssigned || "Unassigned Handler";
            if (!paMap.has(paName)) {
              paMap.set(paName, {
                name: paName,
                assignments: [],
                phone: "0927 887 2343 (Dispatch)",
              });
            }
            paMap.get(paName).assignments.push(b);
          });
          setCrew(Array.from(paMap.values()));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2DED4]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
            Operations &amp; Roster
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
            PA &amp; Santa Handlers Roster
          </h1>
          <p className="text-xs text-[#6B706C] mt-1">
            Production Assistants and Santa Handlers assigned for crowd control, hydration, costume staging, and run-of-show.
          </p>
        </div>

        <Link
          href="/admin/deployment"
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#A92F3A] hover:bg-[#8E252F] text-white shadow-sm transition"
        >
          View Deployment Checklists
        </Link>
      </div>

      {/* Crew Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-[#6B706C]">
            Loading crew roster...
          </div>
        ) : crew.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-[#6B706C]">
            No production assistants recorded yet.
          </div>
        ) : (
          crew.map((member, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#FFFEFB] border border-[#E2DED4] space-y-3 shadow-sm hover:border-[#B99A5B] transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#F6F3EC] border border-[#B99A5B]/40 flex items-center justify-center text-[#B99A5B] font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#252824]">{member.name}</h2>
                    <span className="text-[10px] text-[#6B706C] font-mono uppercase">
                      Santa Event Handler
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold font-mono">
                  {member.assignments.length} Gigs
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#6B706C] pt-2 border-t border-[#E2DED4]/60">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#B99A5B]" />
                  <span className="font-mono text-[11px]">{member.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2DED4]/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B706C] block mb-1.5 font-bold">
                  Recent Mall Assignments:
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {member.assignments.slice(0, 3).map((a: any) => (
                    <div
                      key={a.id}
                      className="text-[11px] p-1.5 rounded bg-[#F6F3EC] flex items-center justify-between"
                    >
                      <span className="text-[#252824] truncate">{a.mallOrVenue}</span>
                      <span className="text-[#6B706C] font-mono text-[10px]">
                        {new Date(a.eventDate).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
