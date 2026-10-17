"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Receipt,
  User,
} from "lucide-react";

export default function RequestStatusPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/public/status/${params.token}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d.booking);
        else setError(d.error);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className="p-16 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-obsidian-900 border border-slate-800 text-center space-y-4 text-xs">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Invalid or Expired Tracking Link</h2>
        <p className="text-slate-400 leading-relaxed">
          {error || "We could not find a booking request matching this token."}
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-lg bg-obsidian-800 text-gold-400 font-semibold"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const isSecured =
    data.status === "SECURED_UNASSIGNED" ||
    data.status === "READY_FOR_DEPLOYMENT" ||
    data.status === "EVENT_IN_PROGRESS" ||
    data.status === "EVENT_COMPLETED";

  const eventDateObj = new Date(data.eventDate);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-xs">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-obsidian-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-mono text-gold-400 uppercase tracking-wider font-bold">
              Official Booking Reference
            </div>
            <h1 className="text-2xl font-extrabold text-white font-mono mt-0.5">
              {data.bookingNumber}
            </h1>
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                isSecured
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : data.isHoldActive
                  ? "bg-amber-950 text-amber-300 border-amber-800"
                  : "bg-blue-950 text-blue-300 border-blue-800"
              }`}
            >
              {data.statusLabel}
            </span>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed">{data.statusDescription}</p>

        {/* Temporary Hold Countdown Notice */}
        {data.isHoldActive && data.holdExpiresAt && (
          <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-200 flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">24-Hour Temporary Hold Active</strong>
              <p className="text-[11px] text-amber-300/90 mt-0.5">
                Your requested date is soft-held on our master calendar until{" "}
                <strong className="text-white">{new Date(data.holdExpiresAt).toLocaleString()}</strong>.
                To secure this date before it automatically releases, please execute your agreement and complete downpayment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Event Overview Card */}
      <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gold-400" />
          Event Logistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400">Mall / Venue:</span>
            <div className="font-semibold text-white text-sm mt-0.5">{data.mallOrVenue}</div>
            <div className="text-slate-400 mt-0.5">{data.eventName}</div>
          </div>

          <div>
            <span className="text-slate-400">Confirmed Schedule:</span>
            <div className="font-semibold text-white text-sm mt-0.5">
              {eventDateObj.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-slate-400 mt-0.5">
              Appearance: {data.startTime || "14:00"} - {data.endTime || "18:00"} ({Number(data.durationHours || 4)} hours)
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Santa Profile (If assigned) */}
      {data.assignedTalent && (
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center">
            <User className="w-4 h-4 mr-2 text-emerald-400" />
            Assigned Santa Performer
          </h2>

          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {data.assignedTalent.photos?.[0] && (
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-obsidian-950 border border-slate-700 shrink-0">
                <img
                  src={data.assignedTalent.photos[0].publicUrl}
                  alt={data.assignedTalent.displayName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-white">Santa {data.assignedTalent.displayName}</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {data.assignedTalent.bio || "Professional authenticated real-beard Santa with commanding holiday presence."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial & Contract Status */}
      <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-3 font-mono">
        <h2 className="text-sm font-bold text-white font-sans flex items-center">
          <Receipt className="w-4 h-4 mr-2 text-gold-400" />
          Contract &amp; Downpayment Status
        </h2>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Quoted Investment</span>
            <div className="text-base font-bold text-white mt-0.5">
              ₱{Number(data.totalContractAmount || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Deposit Received</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              ₱{Number(data.depositPaid || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {data.contract && (
          <div className="pt-2 text-slate-300 font-sans flex items-center justify-between text-xs">
            <span>Agreement Status: <strong>{data.contract.status}</strong></span>
            {data.contract.signedFileUrl && (
              <a
                href={data.contract.signedFileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold-400 hover:text-gold-300 font-semibold"
              >
                Download Signed Copy →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
