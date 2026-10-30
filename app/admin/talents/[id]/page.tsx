"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  Check,
  X,
  Image as ImageIcon,
  Save,
  FileText,
  Star,
  Lock,
  Upload,
  Camera,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  DollarSign,
  CalendarDays,
  Phone,
  MapPin,
} from "lucide-react";

export default function TalentDetailPage() {
  const params = useParams();
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "profile" | "gallery" | "bookings" | "availability" | "rates" | "documents" | "payouts" | "audit"
  >("profile");

  // Profile & Rate Card Form states
  const [displayName, setDisplayName] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [talentType, setTalentType] = useState("REAL_BEARD");
  const [status, setStatus] = useState("ACTIVE");
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

  // Photo Upload states in Tab 2 (Photo Gallery)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>("");
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [uploadCaption, setUploadCaption] = useState<string>("");
  const [uploadSetPrimary, setUploadSetPrimary] = useState<boolean>(true);
  const [uploadPublicApproved, setUploadPublicApproved] = useState<boolean>(true);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);

  // Inline Caption Editor for existing gallery photos
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState<string>("");

  function populateFormFromTalent(t: any) {
    setTalent(t);
    setDisplayName(t.displayName || "");
    setSourceName(t.sourceName || t.displayName || "");
    setTalentType(t.talentType || "REAL_BEARD");
    setStatus(t.status || "ACTIVE");
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

  function loadTalent() {
    setLoading(true);
    fetch(`/api/talents/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.talent) {
          populateFormFromTalent(data.talent);
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
          sourceName,
          talentType,
          status,
          age: age ? parseInt(String(age), 10) : null,
          height,
          nationality,
          phone,
          baseTalentFee: parseFloat(String(baseTalentFee || 12000)),
          metroManilaRate: parseFloat(String(metroManilaRate || 18000)),
          provincialRate: parseFloat(String(provincialRate || 23400)),
          holidayRate: parseFloat(String(holidayRate || 21000)),
          specialRateNote,
          bio,
          approvedForPublicDisplay,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (data.talent) populateFormFromTalent(data.talent);
      setFeedback({
        type: "success",
        text: `Santa ${displayName}'s profile and rate card have been saved!`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: `Error: ${err.message}` });
    } finally {
      setSaving(false);
    }
  }

  // Handle File Selection / Drag-and-Drop for Photo Upload
  function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setUploadFileName(file.name);
    if (!uploadCaption) {
      setUploadCaption(`Santa ${displayName || talent?.displayName} Portrait`);
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  // Upload Photo to Gallery
  async function handleUploadPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadPreviewUrl) {
      setFeedback({ type: "error", text: "Please select or drop an image file first." });
      return;
    }

    setUploadingPhoto(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/talents/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_PHOTO",
          fileName: uploadFileName || `santa_${displayName}_portrait.jpg`,
          fileDataUrl: uploadPreviewUrl,
          caption: uploadCaption || `Santa ${displayName} Portrait`,
          setAsPrimary: uploadSetPrimary,
          approvedForClient: uploadPublicApproved,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to upload photo");
      }
      if (data.talent) {
        setTalent((prev: any) => ({ ...prev, images: data.talent.images }));
      } else {
        loadTalent();
      }
      setUploadPreviewUrl("");
      setUploadFileName("");
      setUploadCaption("");
      setFeedback({
        type: "success",
        text: "New portrait uploaded and added to Photo Gallery!",
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setUploadingPhoto(false);
    }
  }

  // Set Primary Photo
  async function handleSetPrimaryPhoto(imageId: string) {
    setFeedback(null);
    try {
      const res = await fetch(`/api/talents/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_PRIMARY_PHOTO",
          imageId,
        }),
      });
      const data = await res.json();
      if (data.talent) {
        setTalent((prev: any) => ({ ...prev, images: data.talent.images }));
        setFeedback({ type: "success", text: "Primary portrait updated!" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  }

  // Save Edited Photo Caption
  async function handleSavePhotoCaption(imageId: string) {
    try {
      const res = await fetch(`/api/talents/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PHOTO",
          imageId,
          caption: editingCaptionText,
        }),
      });
      const data = await res.json();
      if (data.talent) {
        setTalent((prev: any) => ({ ...prev, images: data.talent.images }));
      }
      setEditingPhotoId(null);
      setFeedback({ type: "success", text: "Photo caption updated!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  }

  // Delete Photo
  async function handleDeletePhoto(imageId: string) {
    try {
      const res = await fetch(`/api/talents/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_PHOTO",
          imageId,
        }),
      });
      const data = await res.json();
      if (data.talent) {
        setTalent((prev: any) => ({ ...prev, images: data.talent.images }));
        setFeedback({ type: "success", text: "Photo removed from gallery." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B1B30]" />
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="p-12 text-center text-[#6E5D5F]">
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
    { id: "profile", label: "1. Profile & Bio" },
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
      {/* Top Executive Header & Logical Action Sequence */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/roster"
            className="p-2.5 rounded-xl bg-white border border-[#D6C7C9] text-[#3D2C2E] hover:border-[#9B1B30] hover:text-[#9B1B30] shadow-xs transition"
            title="Back to Santa & Crew Roster"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Clickable Avatar that opens Photo Gallery */}
          <div className="flex items-center space-x-3.5">
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C68A12] bg-[#FAF7F5] shrink-0 shadow-xs group"
              title="Click to upload or change Primary Portrait"
            >
              <img
                src={primaryPhoto}
                alt={talent.displayName}
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="w-4 h-4 text-white" />
              </span>
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[#9B1B30] font-bold text-xs">
                  {talent.canonicalId}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F5] text-[#6E5D5F] border border-[#D6C7C9] font-mono">
                  Source: {talent.sourceName}
                </span>
                {approvedForPublicDisplay ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                    Publicly Approved
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
                    Internal Only
                  </span>
                )}
              </div>
              <h1 className="page-title text-2xl font-serif font-bold tracking-tight mt-0.5">
                Santa {displayName || talent.displayName}
              </h1>
            </div>
          </div>
        </div>

        {/* Logical 3-Button Header Sequence:
            Step 1: Edit Profile/Rates  |  Step 2: Upload Photos  |  Step 3: Save Profile */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
              activeTab === "profile"
                ? "bg-[#F9EBED] text-[#9B1B30] border-[#9B1B30]"
                : "bg-white text-[#3D2C2E] border-[#D6C7C9] hover:bg-[#FAF7F5]"
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("gallery");
              setTimeout(() => fileInputRef.current?.click(), 150);
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-bold border border-[#D6C7C9] bg-white text-[#3D2C2E] hover:border-[#9B1B30] hover:text-[#9B1B30] flex items-center gap-1.5 transition"
          >
            <Camera className="w-3.5 h-3.5 text-[#9B1B30]" />
            <span>+ Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="btn-primary px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-[#FEF2F2] border-[#F87171] text-[#B91C1C]"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-current opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 8-Tab Operational Navigation */}
      <div className="flex overflow-x-auto space-x-1 border-b border-[#E8DFE0] pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#9B1B30] text-[#9B1B30] font-bold bg-white"
                : "border-transparent text-[#6E5D5F] hover:text-[#1E1416] hover:border-[#D6C7C9]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =====================================================================
          TAB 1: PROFILE & BIO (WITH EDIT FIELDS + SAVE BUTTON)
         ===================================================================== */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <form onSubmit={handleSave} className="lg:col-span-2 space-y-4">
            <div className="dashboard-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFE0]">
                <div>
                  <h2 className="text-sm font-bold text-[#1E1416]">
                    Santa Performer Profile &amp; Biodata
                  </h2>
                  <p className="text-[11px] text-[#6E5D5F]">
                    Edit display name, nationality, physical stature, contact number, and public portfolio bio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("gallery")}
                  className="px-3 py-1.5 rounded-lg bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] font-bold flex items-center gap-1 hover:bg-[#9B1B30] hover:text-white transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Manage Photos ({talent.images?.length || 0})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Full Legal / Source Name</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Talent Category</label>
                  <select
                    value={talentType}
                    onChange={(e) => setTalentType(e.target.value)}
                    className="w-full px-3 py-2 font-semibold"
                  >
                    <option value="REAL_BEARD">REAL_BEARD (Authentic Beard)</option>
                    <option value="REGULAR_SANTA">REGULAR_SANTA (Costumed)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Roster Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1">Height</label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0915 158 1344"
                    className="w-full px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Biography &amp; Holiday Portfolio Brief</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#1E1416] focus:border-[#9B1B30] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E8DFE0]">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="publicApproved"
                    checked={approvedForPublicDisplay}
                    onChange={(e) => setApprovedForPublicDisplay(e.target.checked)}
                    className="rounded text-[#9B1B30]"
                  />
                  <label htmlFor="publicApproved" className="text-[#1E1416] font-semibold cursor-pointer">
                    Approved for Public Funnel Display
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-5 py-2 rounded-lg font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Right Sidebar: Portrait Preview + Paluwal Summary */}
          <div className="space-y-4">
            <div className="dashboard-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1E1416]">Primary Portrait</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("gallery")}
                  className="text-xs font-bold text-[#9B1B30] hover:underline flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Change / Upload</span>
                </button>
              </div>
              <div className="h-56 rounded-xl overflow-hidden bg-[#FAF7F5] border border-[#E8DFE0] flex items-center justify-center">
                {talent.images && talent.images.length > 0 ? (
                  <img
                    src={primaryPhoto}
                    alt={talent.displayName}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="text-center p-4 text-[#6E5D5F]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                    <span className="text-xs block">No Portrait Uploaded</span>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-card p-5 space-y-3">
              <h2 className="text-sm font-bold text-[#1E1416] flex items-center">
                <Wallet className="w-4 h-4 mr-1.5 text-[#C68A12]" />
                Paluwal Active Balance
              </h2>
              <div className="space-y-2 font-mono text-xs pt-1">
                <div className="flex justify-between">
                  <span className="text-[#6E5D5F]">Total Advances:</span>
                  <span className="text-amber-800 font-bold">
                    ₱{Number(finance.totalAdvances || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E5D5F]">Total Recovered:</span>
                  <span className="text-emerald-800 font-semibold">
                    ₱{Number(finance.totalDeductions || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E8DFE0] pt-1">
                  <span className="text-[#6E5D5F]">Net Outstanding:</span>
                  <span className="text-[#9B1B30] font-bold">
                    ₱{Number(finance.netAdvanceBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PHOTO GALLERY (UPLOAD PHOTOS, SET PRIMARY, EDIT CAPTION, DELETE)
         ===================================================================== */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          {/* Drag-and-Drop / File Picker Uploader Card */}
          <div className="dashboard-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8DFE0]">
              <div>
                <h2 className="text-base font-bold text-[#1E1416] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#9B1B30]" />
                  <span>Upload New Portrait Photo for Santa {displayName}</span>
                </h2>
                <p className="text-xs text-[#6E5D5F]">
                  Drag &amp; drop a photo file or click below to select from your computer. You can set it as the Primary Portrait immediately.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadPhoto} className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4 text-xs">
              {/* Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelected(e.dataTransfer.files?.[0]);
                }}
                className="border-2 border-dashed border-[#D6C7C9] hover:border-[#9B1B30] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-[#FAF7F5] transition min-h-[180px]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelected(e.target.files?.[0])}
                  className="hidden"
                />
                {uploadPreviewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={uploadPreviewUrl}
                      alt="Upload Preview"
                      className="h-36 w-36 object-cover rounded-xl mx-auto border border-[#D6C7C9] shadow-xs"
                    />
                    <div className="text-[11px] font-mono font-bold text-[#1E7E48]">
                      {uploadFileName} — Click to replace
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-[#9B1B30] mx-auto" />
                    <div className="font-bold text-[#1E1416] text-sm">
                      Choose Photo File or Drag &amp; Drop Here
                    </div>
                    <div className="text-[11px] text-[#6E5D5F]">
                      PNG, JPG, WebP up to 10MB
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Metadata & Action */}
              <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold mb-1">
                      Photo Caption / Portrait Title
                    </label>
                    <input
                      type="text"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder={`e.g. Santa ${displayName} Flagship Mall Portrait`}
                      className="w-full px-3 py-2"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E1416]">
                      <input
                        type="checkbox"
                        checked={uploadSetPrimary}
                        onChange={(e) => setUploadSetPrimary(e.target.checked)}
                      />
                      <span>Set as Primary Roster &amp; Profile Portrait</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E1416]">
                      <input
                        type="checkbox"
                        checked={uploadPublicApproved}
                        onChange={(e) => setUploadPublicApproved(e.target.checked)}
                      />
                      <span>Approved for Public Client Display</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DFE0]">
                  {uploadPreviewUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadPreviewUrl("");
                        setUploadFileName("");
                      }}
                      className="px-4 py-2 rounded-lg border border-[#D6C7C9] bg-white text-[#3D2C2E] font-semibold"
                    >
                      Clear Selection
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!uploadPreviewUrl || uploadingPhoto}
                    className="btn-primary px-5 py-2.5 rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadingPhoto ? "Uploading Portrait..." : "Upload & Save to Gallery"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Existing Gallery Grid with Set Primary / Edit Caption / Delete Buttons */}
          <div className="dashboard-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFE0]">
              <div>
                <h2 className="text-base font-bold text-[#1E1416]">
                  Cleared &amp; Extracted Portraits ({talent.images?.length || 0})
                </h2>
                <p className="text-xs text-[#6E5D5F]">
                  Click &ldquo;Set Primary&rdquo; on any photo to make it Santa {displayName}&apos;s main avatar, edit captions inline, or delete unwanted photos.
                </p>
              </div>
            </div>

            {!talent.images || talent.images.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#6E5D5F]">
                No photos in gallery yet. Use the uploader above to add Santa {displayName}&apos;s first portrait.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {talent.images.map((img: any) => (
                  <div
                    key={img.id}
                    className={`rounded-xl overflow-hidden border flex flex-col justify-between bg-white shadow-xs transition ${
                      img.isPrimary ? "border-2 border-[#C68A12]" : "border-[#E8DFE0]"
                    }`}
                  >
                    <div>
                      <div className="relative h-52 overflow-hidden bg-[#FAF7F5]">
                        <img
                          src={img.publicUrl}
                          alt={img.caption || talent.displayName}
                          className="w-full h-full object-cover object-top"
                        />
                        {img.isPrimary ? (
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C68A12] text-white flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 fill-white" />
                            <span>Primary Portrait</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPhoto(img.id)}
                            className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 hover:bg-[#9B1B30] text-[#1E1416] hover:text-white border border-[#D6C7C9] shadow-xs transition"
                          >
                            ★ Set Primary
                          </button>
                        )}
                      </div>

                      {/* Caption Display or Inline Editor */}
                      <div className="p-3">
                        {editingPhotoId === img.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingCaptionText}
                              onChange={(e) => setEditingCaptionText(e.target.value)}
                              className="w-full px-2.5 py-1 text-xs"
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSavePhotoCaption(img.id)}
                                className="btn-primary px-2.5 py-1 rounded text-[10px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPhotoId(null)}
                                className="px-2 py-1 rounded border border-[#D6C7C9] text-[10px] font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs font-semibold text-[#1E1416] truncate">
                              {img.caption || img.fileName}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPhotoId(img.id);
                                setEditingCaptionText(img.caption || img.fileName || "");
                              }}
                              className="text-[#9B1B30] hover:underline text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom Actions */}
                    <div className="px-3 py-2 border-t border-[#E8DFE0] bg-[#FAF7F5] flex items-center justify-between text-[10px]">
                      <span className="font-mono text-[#6E5D5F] truncate max-w-[130px]">
                        {img.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(img.id)}
                        className="text-[#B91C1C] hover:underline font-bold flex items-center gap-0.5"
                        title="Delete photo from gallery"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: BOOKING HISTORY
         ===================================================================== */}
      {activeTab === "bookings" && (
        <div className="dashboard-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1E1416]">
              All Scheduled &amp; Historical Engagements ({talent.assignments?.length || 0})
            </h2>
            <Link
              href="/admin/calendar"
              className="btn-primary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Open Master Calendar</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F5] text-[10px] font-mono uppercase text-[#6E5D5F] border-b border-[#E8DFE0]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Booking #</th>
                  <th className="py-2.5 px-3">Mall / Venue</th>
                  <th className="py-2.5 px-3">Agreed TF</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">View / Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0]">
                {talent.assignments?.map((a: any) => (
                  <tr key={a.id} className="hover:bg-[#FAF7F5]">
                    <td className="py-2.5 px-3 font-mono">
                      {new Date(a.booking?.eventDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#9B1B30]">
                      {a.booking?.bookingNumber}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#1E1416]">
                      {a.booking?.mallOrVenue}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-800 font-bold">
                      ₱{Number(a.agreedTalentFee || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px]">
                      {a.booking?.status}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/admin/bookings/${a.booking?.id}`}
                        className="text-[#9B1B30] hover:underline text-[11px] font-bold"
                      >
                        Inspect &amp; Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: AVAILABILITY
         ===================================================================== */}
      {activeTab === "availability" && (
        <div className="dashboard-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1E1416]">
                Calendar Availability &amp; Locked Dates
              </h2>
              <p className="text-xs text-[#6E5D5F]">
                Dates below are locked for Santa {displayName}. Click &ldquo;Edit on Calendar&rdquo; to add or modify assignments.
              </p>
            </div>
            <Link
              href="/admin/calendar"
              className="btn-primary px-3.5 py-1.5 rounded-lg text-xs font-bold"
            >
              Edit on Master Calendar →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {talent.assignments?.map((a: any) => (
              <div key={a.id} className="p-3 rounded-lg bg-[#FAF7F5] border border-[#E8DFE0]">
                <span className="font-mono text-xs font-bold text-[#9B1B30] block">
                  {new Date(a.booking?.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </span>
                <span className="text-[#1E1416] font-bold block truncate mt-1">
                  {a.booking?.mallOrVenue}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                  Confirmed Deployment
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: RATES & COSTING (NOW FULLY EDITABLE WITH SAVE BUTTON!)
         ===================================================================== */}
      {activeTab === "rates" && (
        <form onSubmit={handleSave} className="dashboard-card p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DFE0]">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-[#9B1B30]" />
              <div>
                <h2 className="text-base font-bold text-[#1E1416]">
                  Editable Rate Card &amp; Margin Rules — Santa {displayName}
                </h2>
                <p className="text-[11px] text-[#6E5D5F]">
                  Update internal base talent fee and client quotation tiers (Metro Manila, Provincial +30%, Dec 24/25 Holiday).
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Rate Card"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-1.5">
              <label className="block font-bold text-[#3D2C2E]">
                Internal Base Talent Fee (₱)
              </label>
              <input
                type="number"
                value={baseTalentFee}
                onChange={(e) => setBaseTalentFee(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm font-bold"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-1.5">
              <label className="block font-bold text-[#3D2C2E]">
                Metro Manila Client Rate (₱)
              </label>
              <input
                type="number"
                value={metroManilaRate}
                onChange={(e) => setMetroManilaRate(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm font-bold"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-1.5">
              <label className="block font-bold text-[#3D2C2E]">
                Provincial Client Rate (₱)
              </label>
              <input
                type="number"
                value={provincialRate}
                onChange={(e) => setProvincialRate(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm font-bold"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-1.5">
              <label className="block font-bold text-[#3D2C2E]">
                Dec 24 &amp; 25 Holiday Rate (₱)
              </label>
              <input
                type="number"
                value={holidayRate}
                onChange={(e) => setHolidayRate(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">
              Special Rate Card Notes (e.g., Marquee / SM Megamall Package Rate, Transpo Rules)
            </label>
            <textarea
              rows={3}
              value={specialRateNote}
              onChange={(e) => setSpecialRateNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#1E1416]"
            />
          </div>
        </form>
      )}

      {/* =====================================================================
          TAB 6: DOCUMENTS
         ===================================================================== */}
      {activeTab === "documents" && (
        <div className="dashboard-card p-6 space-y-3 text-xs">
          <h2 className="text-base font-bold text-[#1E1416]">
            Dossier &amp; Casting Files
          </h2>
          <div className="p-4 rounded-lg bg-[#FAF7F5] border border-[#E8DFE0] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-[#C68A12]" />
              <div>
                <strong className="text-[#1E1416] block">{talent.sourceName}.docx</strong>
                <span className="text-[11px] text-[#6E5D5F]">Historical DOCX Casting Archive</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
              Archived
            </span>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 7: PAYMENTS & PAYOUTS
         ===================================================================== */}
      {activeTab === "payouts" && (
        <div className="dashboard-card p-6 space-y-4 text-xs">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#C68A12]" />
            <h2 className="text-base font-bold text-[#1E1416]">
              Disbursements &amp; Payout Ledgers
            </h2>
          </div>
          <p className="text-[#6E5D5F]">
            Managed via Finance. Paluwal cash advances are reconciled before final performance balance payout.
          </p>
          <Link
            href={`/admin/expenses`}
            className="btn-primary inline-flex items-center px-4 py-2 rounded-lg font-bold transition"
          >
            Open Expenses &amp; Paluwal Ledger →
          </Link>
        </div>
      )}

      {/* =====================================================================
          TAB 8: NOTES & AUDIT
         ===================================================================== */}
      {activeTab === "audit" && (
        <div className="dashboard-card p-6 space-y-3 text-xs">
          <h2 className="text-base font-bold text-[#1E1416]">
            Audit Trail &amp; Source Provenance
          </h2>
          <div className="p-4 rounded-lg bg-[#FAF7F5] border border-[#E8DFE0] space-y-2 font-mono text-[11px]">
            <div>
              <strong>Created:</strong>{" "}
              {talent.createdAt ? new Date(talent.createdAt).toISOString() : "2026-10-17"}
            </div>
            <div>
              <strong>Last Updated:</strong>{" "}
              {talent.updatedAt ? new Date(talent.updatedAt).toISOString() : "2026-10-30"}
            </div>
            <div>
              <strong>Canonical Talent ID:</strong> {talent.canonicalId}
            </div>
            <div>
              <strong>Originating Tracker:</strong> SANTA OPERATION TRACKER- 2026.xlsx (Google Sheet Synced)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
