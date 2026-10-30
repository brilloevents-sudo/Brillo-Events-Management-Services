"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Users2,
  Check,
  X,
  Image as ImageIcon,
  UserCog,
  Phone,
  Pencil,
  Camera,
  Plus,
  Upload,
  CheckCircle2,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";

// Real PA & Handler Directory from the Google Sheet ("Santa database" tab)
const PA_CREW_DIRECTORY = [
  {
    name: "Merlina Aday Soerensen",
    assignedSanta: "Santa Perry (Per Soerensen)",
    role: "Senior Personal Assistant & Handler",
    phone: "0955 716 0765",
    location: "Imus, Cavite",
    keyVenues: ["Amanpulo VIP", "SM Baguio", "SM Urdaneta", "SM Tuguegarao", "One Ayala"],
  },
  {
    name: "Avrel Khane Bloc (Elf 01)",
    assignedSanta: "Santa Cedric (Cedric Bloc)",
    role: "Lead Elf & Stage Handler",
    phone: "0968 131 6710",
    location: "Mabalacat, Pampanga",
    keyVenues: ["SM Bataan", "One Ayala Mall", "Marquee Mall", "SM City Baguio", "SM Sucat"],
  },
  {
    name: "Jerosa Lorono (Elf 02)",
    assignedSanta: "Santa Cedric (Cedric Bloc)",
    role: "Co-Handler & Wardrobe Assistant",
    phone: "0965 746 5782",
    location: "Mabalacat, Pampanga",
    keyVenues: ["One Ayala Mall", "Marquee Mall", "SM Sucat"],
  },
  {
    name: "Arlyn Alderson",
    assignedSanta: "Santa Bob Hamilton",
    role: "Executive Santa Handler",
    phone: "0927 113 1300",
    location: "Limay, Bataan",
    keyVenues: ["SM Megamall", "The Podium", "SM Olongapo Central", "SM Tarlac", "SM Marilao", "SM San Lazaro"],
  },
  {
    name: "Maritez Vest",
    assignedSanta: "Santa Terry (Tery Allen Vest)",
    role: "Personal Assistant & Tour Coordinator",
    phone: "0981 075 7980",
    location: "Limay, Bataan",
    keyVenues: ["SM Clark", "SM Rosales", "SM City Pampanga", "Marquee Mall", "SM Southmall"],
  },
  {
    name: "Princess Penaso",
    assignedSanta: "Santa Peter (Peter Georgopoulos)",
    role: "Metro Manila Field PA Handler",
    phone: "0963 279 8603",
    location: "Manila / Pasig",
    keyVenues: ["SM Mall of Asia (SMOA)", "SM Sucat", "SMDC Light", "SMDC Wind Tagaytay", "One Ayala", "SM Aura"],
  },
  {
    name: "Teresita Gelera Villanueva",
    assignedSanta: "Santa Vic (Victor Gary Jacobs)",
    role: "Personal Assistant & Crowd Coordinator",
    phone: "0976 635 0420",
    location: "Caloocan City",
    keyVenues: ["SM San Jose", "SM City San Mateo", "SM Fairview", "SM San Lazaro", "SM Caloocan", "SM Novaliches"],
  },
  {
    name: "Franco Cunial",
    assignedSanta: "Santa Benito (Benedetto Cunila)",
    role: "Personal Assistant & Escort",
    phone: "0967 851 9375",
    location: "Las Piñas City",
    keyVenues: ["SM BF Parañaque", "SMDC Grae", "SM Sta. Mesa"],
  },
];

export default function UnifiedRosterPage() {
  const [activeTab, setActiveTab] = useState<"SANTAS" | "PA_CREW">("SANTAS");
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick-Edit / Create Santa Profile Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isNewTalent, setIsNewTalent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({
    id: "",
    displayName: "",
    sourceName: "",
    talentType: "REAL_BEARD",
    nationality: "American",
    age: 62,
    height: "6'0\"",
    phone: "",
    baseTalentFee: 12000,
    metroManilaRate: 18000,
    provincialRate: 23400,
    holidayRate: 21000,
    specialRateNote: "",
    bio: "",
    approvedForPublicDisplay: true,
    fileDataUrl: "",
    fileName: "",
  });

  // Quick Upload Photo Modal state
  const [photoModalTalent, setPhotoModalTalent] = useState<any | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [photoCaption, setPhotoCaption] = useState<string>("");
  const [photoSetPrimary, setPhotoSetPrimary] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function loadRoster() {
    setLoading(true);
    fetch("/api/talents")
      .then((r) => r.json())
      .then((tData) => {
        if (tData?.talents) setTalents(tData.talents);
      })
      .catch(() => {})
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

  function openQuickEdit(t: any) {
    setIsNewTalent(false);
    setFeedback(null);
    setEditForm({
      id: t.id,
      displayName: t.displayName || "",
      sourceName: t.sourceName || t.displayName || "",
      talentType: t.talentType || "REAL_BEARD",
      nationality: t.nationality || "",
      age: t.age || "",
      height: t.height || "",
      phone: t.phone || "",
      baseTalentFee: Number(t.baseTalentFee || 12000),
      metroManilaRate: Number(t.metroManilaRate || 18000),
      provincialRate: Number(t.provincialRate || 23400),
      holidayRate: Number(t.holidayRate || 21000),
      specialRateNote: t.specialRateNote || "",
      bio: t.bio || "",
      approvedForPublicDisplay: Boolean(t.approvedForPublicDisplay),
      fileDataUrl: "",
      fileName: "",
    });
    setEditModalOpen(true);
  }

  function openNewTalentModal() {
    setIsNewTalent(true);
    setFeedback(null);
    setEditForm({
      id: "",
      displayName: "",
      sourceName: "",
      talentType: "REAL_BEARD",
      nationality: "American",
      age: 62,
      height: "6'0\"",
      phone: "",
      baseTalentFee: 12000,
      metroManilaRate: 18000,
      provincialRate: 23400,
      holidayRate: 21000,
      specialRateNote: "",
      bio: "",
      approvedForPublicDisplay: true,
      fileDataUrl: "",
      fileName: "",
    });
    setEditModalOpen(true);
  }

  async function handleSaveTalent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const url = isNewTalent ? "/api/talents" : `/api/talents/${editForm.id}`;
      const method = isNewTalent ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to save profile");
      }
      loadRoster();
      setEditModalOpen(false);
    } catch (err: any) {
      setFeedback(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  }

  function openPhotoUploadModal(t: any) {
    setPhotoModalTalent(t);
    setPhotoPreviewUrl("");
    setPhotoFileName("");
    setPhotoCaption(`Santa ${t.displayName} Portrait`);
    setPhotoSetPrimary(true);
    setFeedback(null);
  }

  function handleFilePicked(file: File | undefined) {
    if (!file) return;
    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleUploadPhotoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photoModalTalent || !photoPreviewUrl) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/talents/${photoModalTalent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_PHOTO",
          fileName: photoFileName || `santa_${photoModalTalent.displayName}.jpg`,
          fileDataUrl: photoPreviewUrl,
          caption: photoCaption || `Santa ${photoModalTalent.displayName} Portrait`,
          setAsPrimary: photoSetPrimary,
          approvedForClient: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to upload photo");
      }
      loadRoster();
      setPhotoModalTalent(null);
    } catch (err: any) {
      setFeedback(err.message || "Could not upload photo");
    } finally {
      setSaving(false);
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
            Unified roster of authenticated Real-Beard Santa performers and dedicated PA / event handlers. Edit profiles or upload new portraits directly from any card.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openNewTalentModal}
            className="btn-primary px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Santa Performer</span>
          </button>

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
              <span>PA &amp; Handlers ({PA_CREW_DIRECTORY.length})</span>
            </button>
          </div>
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
                className="dashboard-card overflow-hidden flex flex-col justify-between hover:border-[#9B1B30]/50 transition group"
              >
                <div>
                  {/* Portrait Container with Quick Photo Upload Overlay */}
                  <div className="relative h-60 bg-[#F4ECEE] border-b border-[#E8DFE0] overflow-hidden flex items-center justify-center">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto.publicUrl}
                        alt={primaryPhoto.caption || t.displayName}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-6 text-[#756568]">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <span className="text-xs font-mono block">No Cleared Portrait</span>
                        <button
                          type="button"
                          onClick={() => openPhotoUploadModal(t)}
                          className="mt-2.5 px-3 py-1 rounded-lg bg-[#9B1B30] text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs hover:opacity-95"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Upload Portrait</span>
                        </button>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#181012]/85 text-[#F8E2A8] border border-[#C68A12]/40">
                        {t.canonicalId}
                      </span>
                      {images.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/90 text-[#1E1416] border border-[#D6C7C9]">
                          {images.length} {images.length === 1 ? "photo" : "photos"}
                        </span>
                      )}
                    </div>

                    {/* Top-Right Upload Photo Quick Button */}
                    <button
                      type="button"
                      onClick={() => openPhotoUploadModal(t)}
                      className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 hover:bg-[#9B1B30] text-[#1E1416] hover:text-white border border-[#D6C7C9] text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                      title={`Upload new photo for Santa ${t.displayName}`}
                    >
                      <Camera className="w-3 h-3" />
                      <span>Upload Photo</span>
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
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

                {/* Logical 3-Button Action Footer Sequence:
                    1. Quick Edit Profile  |  2. Photo Gallery  |  3. Full 8-Tab Profile */}
                <div className="p-3 border-t border-[#E8DFE0] bg-[#FCF9F8] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openQuickEdit(t)}
                      className="px-2.5 py-1.5 rounded-md bg-[#F9EBED] text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white border border-[#F0D0D5] font-bold inline-flex items-center gap-1 transition"
                      title="Quick Edit Profile & Rates"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openPhotoUploadModal(t)}
                      className="px-2.5 py-1.5 rounded-md bg-white hover:bg-[#FAF7F5] text-[#3D2C2E] border border-[#D6C7C9] font-semibold inline-flex items-center gap-1 transition"
                      title="Upload New Portrait Photo"
                    >
                      <Camera className="w-3 h-3 text-[#9B1B30]" />
                      <span>Photo</span>
                    </button>
                  </div>

                  <Link
                    href={`/admin/talents/${t.id}`}
                    className="px-3 py-1.5 rounded-md bg-white hover:border-[#9B1B30] hover:text-[#9B1B30] text-[#1E1416] border border-[#D6C7C9] font-bold inline-flex items-center gap-1 transition"
                  >
                    <span>8-Tab Profile →</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PA_CREW_DIRECTORY.map((member, idx) => (
            <div key={idx} className="dashboard-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#F9EBED] border border-[#F0D0D5] flex items-center justify-center text-[#9B1B30] font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1E1416]">{member.name}</h2>
                    <span className="text-[10px] text-[#756568] font-mono uppercase block">
                      {member.role}
                    </span>
                  </div>
                </div>
                <span className="badge-esign text-[10px] px-2 py-0.5 rounded font-mono">
                  {member.keyVenues.length} Venues
                </span>
              </div>

              <div className="text-xs text-[#9B1B30] font-bold pt-2 border-t border-[#E8DFE0]">
                Assigned To: {member.assignedSanta}
              </div>

              <div className="flex items-center justify-between text-xs text-[#4A3A3D]">
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C68A12]" />
                  <span className="font-mono text-[11px]">{member.phone}</span>
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-[#6E5D5F]">
                  <MapPin className="w-3 h-3" />
                  <span>{member.location}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8DFE0] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#756568] font-bold block">
                  Assigned Mall Dispatches:
                </span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {member.keyVenues.map((v, vIdx) => (
                    <span
                      key={vIdx}
                      className="px-2 py-0.5 rounded bg-[#FAF7F5] border border-[#E8DFE0] text-[10px] text-[#3D2C2E] font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: QUICK-EDIT OR CREATE SANTA PROFILE & RATES
         ===================================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="dashboard-card w-full max-w-xl bg-white overflow-hidden my-8">
            <div className="p-4 border-b border-[#E8DFE0] bg-[#FAF7F5] flex items-center justify-between">
              <div>
                <span className="badge-esign px-2 py-0.5 rounded-full text-[10px] uppercase">
                  {isNewTalent ? "New Santa Performer" : "Quick Profile Editor"}
                </span>
                <h2 className="text-lg font-bold text-[#1E1416] mt-0.5">
                  {isNewTalent
                    ? "Add New Santa Performer to Roster"
                    : `Edit Profile & Rates — Santa ${editForm.displayName}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg border border-[#D6C7C9] text-[#3D2C2E] hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTalent} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {feedback && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#F87171] text-[#B91C1C] font-bold">
                  {feedback}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    placeholder="e.g. Bob Hamilton"
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Nationality</label>
                  <input
                    type="text"
                    value={editForm.nationality}
                    onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                    placeholder="e.g. American, Danish, Italian"
                    className="w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Age</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Height</label>
                  <input
                    type="text"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                    placeholder="e.g. 6ft 1in"
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="0915 158 1344"
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E8DFE0]">
                <div>
                  <label className="block font-bold mb-1">Base TF (₱)</label>
                  <input
                    type="number"
                    value={editForm.baseTalentFee}
                    onChange={(e) => setEditForm({ ...editForm, baseTalentFee: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">MM Rate (₱)</label>
                  <input
                    type="number"
                    value={editForm.metroManilaRate}
                    onChange={(e) => setEditForm({ ...editForm, metroManilaRate: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Provincial (₱)</label>
                  <input
                    type="number"
                    value={editForm.provincialRate}
                    onChange={(e) => setEditForm({ ...editForm, provincialRate: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Holiday (₱)</label>
                  <input
                    type="number"
                    value={editForm.holidayRate}
                    onChange={(e) => setEditForm({ ...editForm, holidayRate: e.target.value })}
                    className="w-full px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Biography &amp; Portfolio Notes</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#1E1416]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="quickApproveCheck"
                  checked={editForm.approvedForPublicDisplay}
                  onChange={(e) =>
                    setEditForm({ ...editForm, approvedForPublicDisplay: e.target.checked })
                  }
                />
                <label htmlFor="quickApproveCheck" className="font-semibold cursor-pointer">
                  Approved for Public Client Funnel Display
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E8DFE0]">
                {!isNewTalent && editForm.id ? (
                  <Link
                    href={`/admin/talents/${editForm.id}`}
                    className="text-xs font-bold text-[#9B1B30] hover:underline flex items-center gap-1"
                  >
                    <span>Open Full 8-Tab Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#D6C7C9] bg-white text-[#3D2C2E] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary px-5 py-2 rounded-lg font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{saving ? "Saving..." : "Save Profile"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: DIRECT PHOTO UPLOAD FROM ROSTER CARD
         ===================================================================== */}
      {photoModalTalent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="dashboard-card w-full max-w-md bg-white overflow-hidden">
            <div className="p-4 border-b border-[#E8DFE0] bg-[#FAF7F5] flex items-center justify-between">
              <div>
                <span className="badge-esign px-2 py-0.5 rounded-full text-[10px] uppercase">
                  Portrait Uploader
                </span>
                <h3 className="text-base font-bold text-[#1E1416] mt-0.5">
                  Upload Photo for Santa {photoModalTalent.displayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalTalent(null)}
                className="p-1.5 rounded-lg border border-[#D6C7C9] text-[#3D2C2E] hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadPhotoSubmit} className="p-5 space-y-4 text-xs">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilePicked(e.dataTransfer.files?.[0]);
                }}
                className="border-2 border-dashed border-[#D6C7C9] hover:border-[#9B1B30] rounded-xl p-5 text-center cursor-pointer bg-[#FAF7F5] transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFilePicked(e.target.files?.[0])}
                  className="hidden"
                />
                {photoPreviewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={photoPreviewUrl}
                      alt="Preview"
                      className="w-36 h-36 object-cover rounded-lg mx-auto border border-[#D6C7C9]"
                    />
                    <div className="text-[11px] font-mono text-[#1E7E48] font-bold">
                      {photoFileName || "Image Ready"} (Click to change)
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-3">
                    <Upload className="w-8 h-8 text-[#9B1B30] mx-auto" />
                    <div className="font-bold text-[#1E1416]">
                      Click to choose a photo or drag &amp; drop here
                    </div>
                    <div className="text-[11px] text-[#6E5D5F]">
                      Supports JPG, PNG, WebP high-resolution portraits
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">Photo Caption</label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="e.g. Santa Bob Flagship Mall Portrait"
                  className="w-full px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rosterSetPrimary"
                  checked={photoSetPrimary}
                  onChange={(e) => setPhotoSetPrimary(e.target.checked)}
                />
                <label htmlFor="rosterSetPrimary" className="font-semibold cursor-pointer">
                  Set as Primary Roster Portrait immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DFE0]">
                <button
                  type="button"
                  onClick={() => setPhotoModalTalent(null)}
                  className="px-4 py-2 rounded-lg border border-[#D6C7C9] bg-white text-[#3D2C2E] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!photoPreviewUrl || saving}
                  className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{saving ? "Uploading..." : "Upload & Save Photo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
