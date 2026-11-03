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
  Star,
  Trash2,
  Save,
  DollarSign,
  CalendarDays,
  FileText,
  Lock,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  saveTalentToStorage,
  broadcastTalentUpdate,
  subscribeToTalentUpdates,
  getIndexedDBTalents,
} from "@/lib/talent-storage";

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
    keyVenues: [
      "SM Megamall",
      "The Podium",
      "SM Olongapo Central",
      "SM Tarlac",
      "SM Marilao",
      "SM San Lazaro",
    ],
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
    keyVenues: [
      "SM Mall of Asia (SMOA)",
      "SM Sucat",
      "SMDC Light",
      "SMDC Wind Tagaytay",
      "One Ayala",
      "SM Aura",
    ],
  },
  {
    name: "Teresita Gelera Villanueva",
    assignedSanta: "Santa Vic (Victor Gary Jacobs)",
    role: "Personal Assistant & Crowd Coordinator",
    phone: "0976 635 0420",
    location: "Caloocan City",
    keyVenues: [
      "SM San Jose",
      "SM City San Mateo",
      "SM Fairview",
      "SM San Lazaro",
      "SM Caloocan",
      "SM Novaliches",
    ],
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

type DossierTabId =
  | "profile"
  | "gallery"
  | "bookings"
  | "availability"
  | "rates"
  | "documents"
  | "payouts"
  | "audit";

export default function UnifiedRosterPage() {
  const [activeTab, setActiveTab] = useState<"SANTAS" | "PA_CREW">("SANTAS");
  const [talents, setTalents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Full 8-Tab Dossier Modal state (Opened when clicking "Edit Profile", "Photo", or "8-Tab Profile ->")
  const [dossierOpen, setDossierOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState<DossierTabId>("profile");
  const [selectedTalent, setSelectedTalent] = useState<any | null>(null);
  const [isNewTalent, setIsNewTalent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [editForm, setEditForm] = useState<any>({
    id: "",
    displayName: "",
    sourceName: "",
    talentType: "REAL_BEARD",
    status: "ACTIVE",
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
  });

  // Photo & Video Upload states inside Tab 2 (Photo & Video Gallery)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [pickedIsVideo, setPickedIsVideo] = useState<boolean>(false);
  const [videoExternalUrl, setVideoExternalUrl] = useState<string>("");
  const [photoCaption, setPhotoCaption] = useState<string>("");
  const [photoSetPrimary, setPhotoSetPrimary] = useState<boolean>(true);
  const [photoPublicApproved, setPhotoPublicApproved] = useState<boolean>(true);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState<string>("");

  function isVideoMedia(img: any): boolean {
    if (!img) return false;
    const url = String(img.publicUrl || img.originalPath || "");
    const fName = String(img.fileName || "");
    return (
      img.mediaType === "VIDEO" ||
      url.startsWith("data:video/") ||
      /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ||
      /\.(mp4|webm|mov|m4v)$/i.test(fName) ||
      /youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com/i.test(url)
    );
  }

  function toEmbedVideoUrl(url: string): string | null {
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
    );
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    return null;
  }

  function compressImageFile(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.readAsDataURL(file);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.readAsDataURL(file);
        }
      };
      img.onerror = () => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.readAsDataURL(file);
      };
      img.src = url;
    });
  }

  function loadRoster() {
    setLoading(true);
    Promise.all([
      fetch("/api/talents").then((r) => r.json()).catch(() => ({ talents: [] })),
      fetch("/api/bookings").then((r) => r.json()).catch(() => ({ bookings: [] })),
      getIndexedDBTalents().catch(() => []),
    ])
      .then(([tData, bData, idbTalents]) => {
        let talentList = tData?.talents || [];
        if (Array.isArray(idbTalents) && idbTalents.length > 0) {
          const idbMap = new Map<string, any>(idbTalents.map((t: any) => [t.id, t]));
          talentList = talentList.map((t: any) => {
            const idbT = idbMap.get(t.id) || (t.canonicalId ? idbMap.get(t.canonicalId) : null);
            if (!idbT) return t;
            const images = Array.isArray(idbT.images) ? idbT.images : t.images;
            return { ...t, ...idbT, images };
          });
        }
        if (talentList.length > 0) {
          setTalents(talentList);
          setSelectedTalent((curr: any) => {
            if (!curr?.id) return curr;
            const updatedFromList = talentList.find(
              (t: any) => t.id === curr.id || t.canonicalId === curr.canonicalId
            );
            if (!updatedFromList) return curr;
            const images = Array.isArray(updatedFromList.images) ? updatedFromList.images : curr.images;
            return { ...curr, ...updatedFromList, images };
          });
        }
        if (bData?.bookings) setBookings(bData.bookings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRoster();
    const unsub = subscribeToTalentUpdates(() => {
      loadRoster();
    });
    return () => unsub();
  }, []);

  async function togglePublicApproval(talentId: string, current: boolean) {
    const nextVal = !current;
    // Optimistic UI state flip
    setTalents((prev: any[]) =>
      prev.map((t: any) =>
        t.id === talentId || t.canonicalId === talentId
          ? { ...t, approvedForPublicDisplay: nextVal }
          : t
      )
    );
    try {
      const res = await fetch(`/api/talents/${talentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedForPublicDisplay: nextVal }),
      });
      const data = await res.json();
      if (data?.talent) {
        saveTalentToStorage(data.talent).catch(() => {});
        broadcastTalentUpdate(data.talent.id);
      }
      loadRoster();
    } catch (err) {
      console.error(err);
      loadRoster();
    }
  }

  // Open the 8-Tab Modal directly on the requested tab (e.g. "profile" or "gallery")
  function open8TabDossier(t: any, initialTab: DossierTabId = "profile") {
    setIsNewTalent(false);
    setSelectedTalent(t);
    setDossierTab(initialTab);
    setFeedback(null);
    setPhotoPreviewUrl("");
    setPhotoFileName("");
    setPhotoCaption(`Santa ${t.displayName} Portrait`);
    setEditingPhotoId(null);
    setEditForm({
      id: t.id,
      displayName: t.displayName || "",
      sourceName: t.sourceName || t.displayName || "",
      talentType: t.talentType || "REAL_BEARD",
      status: t.status || "ACTIVE",
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
    });
    setDossierOpen(true);
  }

  function openNewTalentModal() {
    setIsNewTalent(true);
    setSelectedTalent({
      id: "",
      canonicalId: "TAL-NEW",
      displayName: "New Santa",
      images: [],
    });
    setDossierTab("profile");
    setFeedback(null);
    setPhotoPreviewUrl("");
    setPhotoFileName("");
    setEditForm({
      id: "",
      displayName: "",
      sourceName: "",
      talentType: "REAL_BEARD",
      status: "ACTIVE",
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
    });
    setDossierOpen(true);
  }

  async function handleSaveTalent(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const url = isNewTalent ? "/api/talents" : `/api/talents/${editForm.id}`;
      const method = isNewTalent ? "POST" : "PATCH";

      // If user selected or pasted a photo/video without clicking the upload button, include it!
      const hasPendingMedia = Boolean(photoPreviewUrl) || Boolean(videoExternalUrl.trim());
      const pendingPhotoData = hasPendingMedia
        ? {
            fileName: photoFileName || `santa_${editForm.displayName || "photo"}.jpg`,
            fileDataUrl: photoPreviewUrl || undefined,
            publicUrl: videoExternalUrl.trim() || undefined,
            caption: photoCaption || `Santa ${editForm.displayName} Portrait`,
            setAsPrimary: pickedIsVideo ? false : photoSetPrimary,
            approvedForClient: photoPublicApproved,
          }
        : undefined;

      const bodyPayload = {
        ...editForm,
        images: selectedTalent?.images || [],
        pendingPhoto: pendingPhotoData,
        fileDataUrl: photoPreviewUrl || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to save profile");
      }
      if (data.talent) {
        const authoritativeImgs = Array.isArray(data.talent.images)
          ? data.talent.images
          : (Array.isArray(selectedTalent?.images) ? selectedTalent.images : []);
        const preservedTalent = { ...selectedTalent, ...data.talent, images: authoritativeImgs };
        setSelectedTalent(preservedTalent);
        saveTalentToStorage(preservedTalent).catch(() => {});
        broadcastTalentUpdate(preservedTalent.id);
        setIsNewTalent(false);
        setEditForm((prev: any) => ({ ...prev, id: data.talent.id, images: authoritativeImgs }));
        setPhotoPreviewUrl("");
        setPhotoFileName("");
        setVideoExternalUrl("");
      }
      loadRoster();
      setFeedback({
        type: "success",
        text: `Santa ${editForm.displayName}'s profile and rate card have been saved!`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Error saving profile" });
    } finally {
      setSaving(false);
    }
  }

  async function handleFilePicked(file: File | undefined) {
    if (!file) return;
    setPhotoFileName(file.name);
    const isVid = file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    setPickedIsVideo(isVid);
    setVideoExternalUrl("");
    if (selectedTalent) {
      setPhotoCaption(
        `Santa ${selectedTalent.displayName} ${isVid ? "Performance Video Clip" : "Portrait"}`
      );
    }
    if (isVid) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotoPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      try {
        const compressed = await compressImageFile(file, 1200, 0.85);
        setPhotoPreviewUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setPhotoPreviewUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async function handleUploadPhotoSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hasFile = Boolean(photoPreviewUrl);
    const hasLink = Boolean(videoExternalUrl.trim());
    if (!selectedTalent?.id || (!hasFile && !hasLink)) return;
    setSaving(true);
    setFeedback(null);
    const isVid = pickedIsVideo || hasLink;
    try {
      const res = await fetch(`/api/talents/${selectedTalent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_PHOTO",
          fileName:
            photoFileName ||
            (isVid
              ? `santa_${selectedTalent.displayName}_video.mp4`
              : `santa_${selectedTalent.displayName}.jpg`),
          fileDataUrl: hasFile ? photoPreviewUrl : undefined,
          publicUrl: hasLink ? videoExternalUrl.trim() : undefined,
          caption:
            photoCaption ||
            `Santa ${selectedTalent.displayName} ${isVid ? "Video Clip" : "Portrait"}`,
          setAsPrimary: isVid ? false : photoSetPrimary,
          approvedForClient: photoPublicApproved,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Failed to upload media");
      }
      if (data.talent) {
        setSelectedTalent(data.talent);
        saveTalentToStorage(data.talent).catch(() => {});
        broadcastTalentUpdate(data.talent.id);
      }
      setPhotoPreviewUrl("");
      setPhotoFileName("");
      setPickedIsVideo(false);
      setVideoExternalUrl("");
      loadRoster();
      setFeedback({
        type: "success",
        text: isVid
          ? "New video uploaded and saved to Tab 2: Photo & Video Gallery!"
          : "New portrait photo uploaded to Tab 2: Photo & Video Gallery!",
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Could not upload media" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSetPrimaryPhoto(imageId: string) {
    if (!selectedTalent?.id) return;
    try {
      const res = await fetch(`/api/talents/${selectedTalent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_PRIMARY_PHOTO", imageId }),
      });
      const data = await res.json();
      if (data.talent) {
        setSelectedTalent(data.talent);
        saveTalentToStorage(data.talent).catch(() => {});
        broadcastTalentUpdate(data.talent.id);
        loadRoster();
        setFeedback({ type: "success", text: "Primary portrait updated!" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  }

  async function handleSavePhotoCaption(imageId: string) {
    if (!selectedTalent?.id) return;
    try {
      const res = await fetch(`/api/talents/${selectedTalent.id}`, {
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
        setSelectedTalent(data.talent);
        saveTalentToStorage(data.talent).catch(() => {});
        broadcastTalentUpdate(data.talent.id);
        loadRoster();
      }
      setEditingPhotoId(null);
      setFeedback({ type: "success", text: "Photo caption updated!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    }
  }

  async function handleDeletePhoto(imageId: string) {
    if (!selectedTalent?.id) return;
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to delete this photo/video from the gallery?")) {
      return;
    }
    const currentImgs = Array.isArray(selectedTalent.images) ? [...selectedTalent.images] : [];
    const updatedImgs = currentImgs.filter((img: any) => img.id !== imageId && img.publicUrl !== imageId);
    const wasPrimary = currentImgs.find((img: any) => img.id === imageId || img.publicUrl === imageId)?.isPrimary;
    if (wasPrimary && updatedImgs.length > 0 && !updatedImgs.some((img: any) => img.isPrimary)) {
      updatedImgs[0] = { ...updatedImgs[0], isPrimary: true };
    }
    const updatedTalent = { ...selectedTalent, images: updatedImgs };
    setSelectedTalent(updatedTalent);
    setEditForm((prev: any) => ({ ...prev, images: updatedImgs }));
    await saveTalentToStorage(updatedTalent).catch(() => {});
    broadcastTalentUpdate(updatedTalent.id);

    try {
      const res = await fetch(`/api/talents/${selectedTalent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_PHOTO", imageId }),
      });
      const data = await res.json();
      if (data.talent) {
        setSelectedTalent(data.talent);
        saveTalentToStorage(data.talent).catch(() => {});
        broadcastTalentUpdate(data.talent.id);
      }
      loadRoster();
      setFeedback({ type: "success", text: "Photo deleted permanently from gallery." });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to delete photo" });
    }
  }

  async function handleReorderPhotos(newImages: any[]) {
    if (!selectedTalent?.id) return;
    const updatedTalent = { ...selectedTalent, images: newImages };
    setSelectedTalent(updatedTalent);
    setEditForm((prev: any) => ({ ...prev, images: newImages }));
    await saveTalentToStorage(updatedTalent).catch(() => {});
    broadcastTalentUpdate(updatedTalent.id);

    try {
      const res = await fetch(`/api/talents/${selectedTalent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REORDER_PHOTOS", images: newImages }),
      });
      const data = await res.json();
      if (data.talent) {
        setSelectedTalent(data.talent);
        saveTalentToStorage(data.talent).catch(() => {});
        broadcastTalentUpdate(data.talent.id);
      }
      loadRoster();
      setFeedback({ type: "success", text: "Gallery order updated and saved!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to reorder photos" });
    }
  }

  function handleMovePhoto(fromIndex: number, toIndex: number) {
    const imgs = Array.isArray(selectedTalent?.images) ? [...selectedTalent.images] : [];
    if (fromIndex < 0 || fromIndex >= imgs.length || toIndex < 0 || toIndex >= imgs.length || fromIndex === toIndex) return;
    const [moved] = imgs.splice(fromIndex, 1);
    imgs.splice(toIndex, 0, moved);
    handleReorderPhotos(imgs);
  }

  function handleMovePhotoToStart(index: number) {
    if (index === 0) return;
    handleMovePhoto(index, 0);
  }

  function handleMovePhotoToEnd(index: number) {
    const imgs = Array.isArray(selectedTalent?.images) ? selectedTalent.images : [];
    if (index === imgs.length - 1) return;
    handleMovePhoto(index, imgs.length - 1);
  }

  // Bookings for the currently opened Santa in the 8-Tab Modal
  const selectedTalentBookings = bookings.filter(
    (b) =>
      selectedTalent &&
      (b.talentAssignments?.[0]?.talent?.id === selectedTalent.id ||
        b.talentAssignments?.[0]?.talent?.displayName === selectedTalent.displayName)
  );

  const dossierTabs: { id: DossierTabId; label: string }[] = [
    { id: "profile", label: "1. Profile & Bio" },
    { id: "gallery", label: `2. Photo & Video Gallery (${selectedTalent?.images?.length || 0})` },
    { id: "bookings", label: `3. Booking History (${selectedTalentBookings.length})` },
    { id: "availability", label: "4. Availability" },
    { id: "rates", label: "5. Rates & Costing" },
    { id: "documents", label: "6. Documents" },
    { id: "payouts", label: "7. Payments & Payouts" },
    { id: "audit", label: "8. Notes & Audit" },
  ];

  const activePrimaryAvatar =
    selectedTalent?.images?.find((img: any) => img.isPrimary)?.publicUrl ||
    selectedTalent?.images?.[0]?.publicUrl ||
    "/brand/logo-brillo.png";

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
            Click <strong>Edit Profile</strong>, <strong>Upload Photo</strong>, or <strong>8-Tab Profile</strong> on any Santa card to open the complete 8-Tab Operational Dossier.
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
                  {/* Portrait Container with Quick Photo Upload Overlay (Opens Tab 2 of 8-Tab Modal) */}
                  <div className="relative h-60 bg-[#F4ECEE] border-b border-[#E8DFE0] overflow-hidden flex items-center justify-center">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto.publicUrl}
                        alt={primaryPhoto.caption || t.displayName}
                        onClick={() => open8TabDossier(t, "profile")}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      />
                    ) : (
                      <div className="text-center p-6 text-[#756568]">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <span className="text-xs font-mono block">No Cleared Portrait</span>
                        <button
                          type="button"
                          onClick={() => open8TabDossier(t, "gallery")}
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

                    {/* Top-Right Upload Photo Quick Button -> Opens 8-Tab Modal on Tab 2: Photo Gallery */}
                    <button
                      type="button"
                      onClick={() => open8TabDossier(t, "gallery")}
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

                {/* Card Action Footer: All 3 buttons open the full 8-Tab Operational Dossier! */}
                <div className="p-3 border-t border-[#E8DFE0] bg-[#FCF9F8] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => open8TabDossier(t, "profile")}
                      className="px-2.5 py-1.5 rounded-md bg-[#F9EBED] text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white border border-[#F0D0D5] font-bold inline-flex items-center gap-1 transition"
                      title="Open 8-Tab Profile Editor (Tab 1: Profile & Bio)"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => open8TabDossier(t, "gallery")}
                      className="px-2.5 py-1.5 rounded-md bg-white hover:bg-[#FAF7F5] text-[#3D2C2E] border border-[#D6C7C9] font-semibold inline-flex items-center gap-1 transition"
                      title="Open 8-Tab Profile Editor (Tab 2: Photo Gallery)"
                    >
                      <Camera className="w-3 h-3 text-[#9B1B30]" />
                      <span>Photo</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => open8TabDossier(t, "profile")}
                    className="px-3 py-1.5 rounded-md bg-white hover:border-[#9B1B30] hover:text-[#9B1B30] text-[#1E1416] border border-[#D6C7C9] font-bold inline-flex items-center gap-1 transition"
                  >
                    <span>8-Tab Profile →</span>
                  </button>
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
          FULL 8-TAB SANTA DOSSIER MODAL (OPENS WHEN CLICKING EDIT PROFILE,
          UPLOAD PHOTO, OR 8-TAB PROFILE)
         ===================================================================== */}
      {dossierOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="dashboard-card w-full max-w-6xl bg-white overflow-hidden my-auto max-h-[92vh] flex flex-col shadow-2xl">
            {/* Sticky Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8DFE0] bg-[#FAF7F5] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-3.5">
                <button
                  type="button"
                  onClick={() => setDossierTab("gallery")}
                  className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C68A12] bg-white shrink-0 shadow-xs group"
                  title="Click to open Tab 2: Photo Gallery"
                >
                  <img
                    src={activePrimaryAvatar}
                    alt={editForm.displayName || "Santa"}
                    className="w-full h-full object-cover object-top"
                  />
                  <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Camera className="w-4 h-4 text-white" />
                  </span>
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[#9B1B30] font-bold text-xs">
                      {selectedTalent?.canonicalId || "TAL-NEW"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#6E5D5F] border border-[#D6C7C9] font-mono">
                      Source: {editForm.sourceName || editForm.displayName || "New Profile"}
                    </span>
                    {editForm.approvedForPublicDisplay ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                        ✓ Publicly Approved
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
                        Internal Only
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1416] mt-0.5">
                    {isNewTalent
                      ? "Add New Santa Performer"
                      : `Santa ${editForm.displayName || selectedTalent?.displayName}`}
                  </h2>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDossierTab("profile")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                    dossierTab === "profile"
                      ? "bg-[#F9EBED] text-[#9B1B30] border-[#9B1B30]"
                      : "bg-white text-[#3D2C2E] border-[#D6C7C9] hover:bg-[#FAF7F5]"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                {!isNewTalent && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setDossierTab("gallery");
                        setTimeout(() => fileInputRef.current?.click(), 120);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                        dossierTab === "gallery"
                          ? "bg-[#F9EBED] text-[#9B1B30] border-[#9B1B30]"
                          : "bg-white text-[#3D2C2E] border-[#D6C7C9] hover:bg-[#FAF7F5]"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5 text-[#9B1B30]" />
                      <span>+ Upload Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDossierTab("gallery");
                        setTimeout(() => videoInputRef.current?.click(), 120);
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-bold border border-[#D6C7C9] bg-white text-[#3D2C2E] hover:border-[#9B1B30] hover:text-[#9B1B30] flex items-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#9B1B30]" />
                      <span>🎬 + Upload Video</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveTalent()}
                  disabled={saving}
                  className="btn-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Profile"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDossierOpen(false)}
                  className="p-2 rounded-lg border border-[#D6C7C9] bg-white text-[#3D2C2E] hover:bg-[#FAF7F5]"
                  title="Close 8-Tab Dossier"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 8-Tab Navigation Bar (Always Visible at Top of Modal) */}
            <div className="flex overflow-x-auto space-x-1 px-4 sm:px-6 bg-[#FAF7F5] border-b border-[#E8DFE0] shrink-0">
              {dossierTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDossierTab(tab.id)}
                  className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                    dossierTab === tab.id
                      ? "border-[#9B1B30] text-[#9B1B30] font-bold bg-white rounded-t-lg"
                      : "border-transparent text-[#6E5D5F] hover:text-[#1E1416] hover:border-[#D6C7C9]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content for Active Tab */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {feedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    feedback.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-[#FEF2F2] border-[#F87171] text-[#B91C1C]"
                  }`}
                >
                  <span>{feedback.text}</span>
                  <button
                    type="button"
                    onClick={() => setFeedback(null)}
                    className="opacity-70 hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ===============================================================
                  TAB 1: 1. PROFILE & BIO
                 =============================================================== */}
              {dossierTab === "profile" && (
                <form onSubmit={handleSaveTalent} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold mb-1">Display Name *</label>
                        <input
                          type="text"
                          required
                          value={editForm.displayName}
                          onChange={(e) =>
                            setEditForm({ ...editForm, displayName: e.target.value })
                          }
                          placeholder="e.g. Bob Hamilton"
                          className="w-full px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Full Legal / Source Name</label>
                        <input
                          type="text"
                          value={editForm.sourceName}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sourceName: e.target.value })
                          }
                          placeholder="e.g. BOB HALMITON"
                          className="w-full px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold mb-1">Nationality</label>
                        <input
                          type="text"
                          value={editForm.nationality}
                          onChange={(e) =>
                            setEditForm({ ...editForm, nationality: e.target.value })
                          }
                          placeholder="e.g. American, Danish, Italian"
                          className="w-full px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Talent Category</label>
                        <select
                          value={editForm.talentType}
                          onChange={(e) =>
                            setEditForm({ ...editForm, talentType: e.target.value })
                          }
                          className="w-full px-3 py-2 font-semibold"
                        >
                          <option value="REAL_BEARD">REAL_BEARD (Authentic Beard)</option>
                          <option value="REGULAR_SANTA">REGULAR_SANTA (Costumed)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Roster Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                          placeholder="e.g. 6ft"
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

                    <div>
                      <label className="block font-bold mb-1">
                        Biography &amp; Holiday Portfolio Brief
                      </label>
                      <textarea
                        rows={4}
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#1E1416]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E8DFE0]">
                      <label className="flex items-center space-x-2 cursor-pointer font-semibold text-[#1E1416]">
                        <input
                          type="checkbox"
                          checked={editForm.approvedForPublicDisplay}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              approvedForPublicDisplay: e.target.checked,
                            })
                          }
                        />
                        <span>Approved for Public Funnel Display</span>
                      </label>

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

                  {/* Right Column inside Tab 1: Primary Portrait Preview & Quick Rate Card */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1E1416]">Primary Portrait</span>
                        {!isNewTalent && (
                          <button
                            type="button"
                            onClick={() => setDossierTab("gallery")}
                            className="text-[#9B1B30] font-bold hover:underline flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Manage Photos ({selectedTalent?.images?.length || 0})</span>
                          </button>
                        )}
                      </div>
                      <div className="h-52 rounded-xl overflow-hidden bg-white border border-[#E8DFE0] flex items-center justify-center">
                        {selectedTalent?.images?.length > 0 ? (
                          <img
                            src={activePrimaryAvatar}
                            alt={editForm.displayName}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="text-center p-4 text-[#6E5D5F]">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                            <span>No Portrait Uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1E1416]">Rate Summary</span>
                        <button
                          type="button"
                          onClick={() => setDossierTab("rates")}
                          className="text-[#9B1B30] font-bold hover:underline"
                        >
                          Edit Rates (Tab 5) →
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono pt-1">
                        <div>
                          Base TF:{" "}
                          <strong className="text-emerald-700">
                            ₱{Number(editForm.baseTalentFee || 12000).toLocaleString()}
                          </strong>
                        </div>
                        <div>
                          MM Rate:{" "}
                          <strong className="text-[#9B1B30]">
                            ₱{Number(editForm.metroManilaRate || 18000).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* ===============================================================
                  TAB 2: 2. PHOTO & VIDEO GALLERY (UPLOAD PHOTOS/VIDEOS, SET PRIMARY, CAPTION, DELETE)
                 =============================================================== */}
              {dossierTab === "gallery" && (
                <div className="space-y-5">
                  <form
                    onSubmit={handleUploadPhotoSubmit}
                    className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] grid grid-cols-1 lg:grid-cols-3 gap-4"
                  >
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFilePicked(e.dataTransfer.files?.[0]);
                      }}
                      className="border-2 border-dashed border-[#D6C7C9] hover:border-[#9B1B30] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-white transition min-h-[165px]"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFilePicked(e.target.files?.[0])}
                        className="hidden"
                      />
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFilePicked(e.target.files?.[0])}
                        className="hidden"
                      />
                      {photoPreviewUrl ? (
                        <div className="space-y-1.5 w-full">
                          {pickedIsVideo ? (
                            <video
                              src={photoPreviewUrl}
                              controls
                              className="h-32 w-full max-w-[220px] object-cover rounded-lg mx-auto border border-[#D6C7C9] bg-black"
                            />
                          ) : (
                            <img
                              src={photoPreviewUrl}
                              alt="Upload Preview"
                              className="h-32 w-32 object-cover rounded-lg mx-auto border border-[#D6C7C9]"
                            />
                          )}
                          <div className="text-[11px] font-mono font-bold text-[#1E7E48]">
                            {pickedIsVideo ? "🎬 VIDEO READY: " : "📷 PHOTO READY: "}
                            {photoFileName} — Click to replace
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Upload className="w-7 h-7 text-[#9B1B30] mx-auto" />
                          <div className="font-bold text-[#1E1416]">
                            Choose Photo or Video File (or Drag &amp; Drop Here)
                          </div>
                          <div className="text-[11px] text-[#6E5D5F]">
                            Photos (JPG, PNG, WebP) &amp; Videos (MP4, WebM, MOV)
                          </div>
                          <div className="flex items-center justify-center gap-2 pt-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="px-2.5 py-1 rounded bg-[#F9EBED] text-[#9B1B30] border border-[#F0D0D5] text-[10px] font-bold"
                            >
                              📷 Pick Photo
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                videoInputRef.current?.click();
                              }}
                              className="px-2.5 py-1 rounded bg-[#9B1B30] text-white text-[10px] font-bold"
                            >
                              🎬 Pick Video File
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2 flex flex-col justify-between space-y-3">
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold mb-1">
                              Photo / Video Caption Title
                            </label>
                            <input
                              type="text"
                              value={photoCaption}
                              onChange={(e) => setPhotoCaption(e.target.value)}
                              placeholder={`e.g. Santa ${editForm.displayName} Mall Portrait / Video Reel`}
                              className="w-full px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1">
                              Or Paste Video Link (MP4 / YouTube / Google Drive / Vimeo)
                            </label>
                            <input
                              type="url"
                              value={videoExternalUrl}
                              onChange={(e) => {
                                setVideoExternalUrl(e.target.value);
                                if (e.target.value.trim()) {
                                  setPickedIsVideo(true);
                                }
                              }}
                              placeholder="https://... (optional if uploading a video file)"
                              className="w-full px-3 py-2 font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-5 pt-1">
                          {!pickedIsVideo && !videoExternalUrl.trim() && (
                            <label className="flex items-center gap-2 cursor-pointer font-semibold">
                              <input
                                type="checkbox"
                                checked={photoSetPrimary}
                                onChange={(e) => setPhotoSetPrimary(e.target.checked)}
                              />
                              <span>Set as Primary Roster &amp; Funnel Portrait</span>
                            </label>
                          )}
                          <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <input
                              type="checkbox"
                              checked={photoPublicApproved}
                              onChange={(e) => setPhotoPublicApproved(e.target.checked)}
                            />
                            <span>Approved for Public Client Display</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFE0]">
                        {(photoPreviewUrl || videoExternalUrl.trim()) && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreviewUrl("");
                              setPhotoFileName("");
                              setPickedIsVideo(false);
                              setVideoExternalUrl("");
                            }}
                            className="px-3 py-2 rounded-lg border border-[#D6C7C9] bg-white text-[#3D2C2E] font-semibold"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={(!photoPreviewUrl && !videoExternalUrl.trim()) || saving}
                          className="btn-primary px-5 py-2 rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {saving
                              ? "Uploading..."
                              : pickedIsVideo || videoExternalUrl.trim()
                              ? "🎬 Upload & Save Video to Gallery"
                              : "📷 Upload & Save Photo to Gallery"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Existing Photos & Videos Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(selectedTalent?.images || []).map((img: any, idx: number) => {
                      const isVid = isVideoMedia(img);
                      const embedUrl = isVid ? toEmbedVideoUrl(img.publicUrl) : null;

                      return (
                        <div
                          key={img.id || img.publicUrl || `img-${idx}`}
                          className={`rounded-xl overflow-hidden border flex flex-col justify-between bg-white shadow-xs ${
                            img.isPrimary ? "border-2 border-[#C68A12] ring-2 ring-[#C68A12]/20" : "border-[#E8DFE0]"
                          }`}
                        >
                          <div>
                            <div className="relative h-48 overflow-hidden bg-[#FAF7F5]">
                              {isVid ? (
                                embedUrl ? (
                                  <iframe
                                    src={embedUrl}
                                    title={img.caption || "Santa Video"}
                                    className="w-full h-full border-0 bg-black"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <video
                                    src={img.publicUrl}
                                    controls
                                    preload="metadata"
                                    className="w-full h-full object-cover bg-black"
                                  />
                                )
                              ) : (
                                <img
                                  src={img.publicUrl}
                                  alt={img.caption || editForm.displayName}
                                  className="w-full h-full object-cover object-top"
                                />
                              )}

                              {isVid ? (
                                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9B1B30] text-white flex items-center gap-1 shadow-xs pointer-events-none">
                                  <span>🎬 Video Clip</span>
                                </span>
                              ) : img.isPrimary ? (
                                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C68A12] text-white flex items-center gap-1 shadow-xs">
                                  <Star className="w-3 h-3 fill-white" />
                                  <span>Primary Portrait</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryPhoto(img.id)}
                                  className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 hover:bg-[#9B1B30] text-[#1E1416] hover:text-white border border-[#D6C7C9] transition shadow-xs"
                                >
                                  ★ Set Primary
                                </button>
                              )}

                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
                                #{idx + 1}
                              </span>
                            </div>

                            {/* Reorder / Organize Bar: Unahan, Prev, Next, Dulo */}
                            <div className="px-2.5 py-1.5 bg-[#FAF7F5] border-b border-[#E8DFE0] flex items-center justify-between text-[11px]">
                              <span className="font-mono text-[10px] font-bold text-[#6E5D5F]">
                                Pos: {idx + 1}/{selectedTalent.images.length}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  title="Lipat sa Unahan (Move to Front)"
                                  disabled={idx === 0}
                                  onClick={() => handleMovePhotoToStart(idx)}
                                  className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[10px] font-bold border transition ${
                                    idx === 0
                                      ? "opacity-30 cursor-not-allowed bg-transparent border-transparent text-[#9E8E90]"
                                      : "bg-white hover:bg-[#9B1B30] hover:text-white border-[#D6C7C9] text-[#1E1416]"
                                  }`}
                                >
                                  <ChevronsLeft className="w-3.5 h-3.5" />
                                  <span>Unahan</span>
                                </button>
                                <button
                                  type="button"
                                  title="Lipat pakaliwa (Move Left)"
                                  disabled={idx === 0}
                                  onClick={() => handleMovePhoto(idx, idx - 1)}
                                  className={`p-1 rounded flex items-center justify-center border transition ${
                                    idx === 0
                                      ? "opacity-30 cursor-not-allowed bg-transparent border-transparent text-[#9E8E90]"
                                      : "bg-white hover:bg-[#9B1B30] hover:text-white border-[#D6C7C9] text-[#1E1416]"
                                  }`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Lipat pakanan (Move Right)"
                                  disabled={idx === selectedTalent.images.length - 1}
                                  onClick={() => handleMovePhoto(idx, idx + 1)}
                                  className={`p-1 rounded flex items-center justify-center border transition ${
                                    idx === selectedTalent.images.length - 1
                                      ? "opacity-30 cursor-not-allowed bg-transparent border-transparent text-[#9E8E90]"
                                      : "bg-white hover:bg-[#9B1B30] hover:text-white border-[#D6C7C9] text-[#1E1416]"
                                  }`}
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Lipat sa Dulo (Move to End)"
                                  disabled={idx === selectedTalent.images.length - 1}
                                  onClick={() => handleMovePhotoToEnd(idx)}
                                  className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 text-[10px] font-bold border transition ${
                                    idx === selectedTalent.images.length - 1
                                      ? "opacity-30 cursor-not-allowed bg-transparent border-transparent text-[#9E8E90]"
                                      : "bg-white hover:bg-[#9B1B30] hover:text-white border-[#D6C7C9] text-[#1E1416]"
                                  }`}
                                >
                                  <span>Dulo</span>
                                  <ChevronsRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="p-2.5">
                              {editingPhotoId === img.id ? (
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={editingCaptionText}
                                    onChange={(e) => setEditingCaptionText(e.target.value)}
                                    className="w-full px-2 py-1 text-xs"
                                  />
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSavePhotoCaption(img.id)}
                                      className="btn-primary px-2 py-0.5 rounded text-[10px] font-bold"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingPhotoId(null)}
                                      className="px-2 py-0.5 rounded border border-[#D6C7C9] text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-semibold text-[#1E1416] truncate text-xs">
                                    {img.caption || img.fileName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPhotoId(img.id);
                                      setEditingCaptionText(img.caption || img.fileName || "");
                                    }}
                                    className="text-[#9B1B30] hover:underline text-[10px] font-bold shrink-0"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="px-2.5 py-1.5 border-t border-[#E8DFE0] bg-[#FAF7F5] flex items-center justify-between text-[10px]">
                            <span className="font-mono text-[#6E5D5F] truncate max-w-[120px]">
                              {img.fileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(img.id)}
                              className="text-[#B91C1C] hover:text-white hover:bg-[#B91C1C] px-2 py-1 rounded border border-[#B91C1C]/40 hover:border-[#B91C1C] font-bold flex items-center gap-1 transition shadow-2xs"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===============================================================
                  TAB 3: 3. BOOKING HISTORY
                 =============================================================== */}
              {dossierTab === "bookings" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#1E1416]">
                      All Scheduled &amp; Historical Engagements ({selectedTalentBookings.length})
                    </h3>
                    <Link
                      href="/admin/calendar"
                      className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>Open Master Calendar</span>
                    </Link>
                  </div>

                  {selectedTalentBookings.length === 0 ? (
                    <div className="p-8 text-center text-[#6E5D5F] bg-[#FAF7F5] rounded-xl border border-[#E8DFE0]">
                      No bookings assigned to Santa {editForm.displayName} yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-[#E8DFE0] rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-[#FAF7F5] text-[10px] font-mono uppercase text-[#6E5D5F] border-b border-[#E8DFE0]">
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Booking #</th>
                            <th className="py-2.5 px-3">Mall / Venue</th>
                            <th className="py-2.5 px-3">Agreed TF</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8DFE0]">
                          {selectedTalentBookings.map((b: any) => (
                            <tr key={b.id} className="hover:bg-[#FAF7F5]">
                              <td className="py-2 px-3 font-mono">
                                {new Date(b.eventDate).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-[#9B1B30]">
                                {b.bookingNumber}
                              </td>
                              <td className="py-2 px-3 font-bold text-[#1E1416]">
                                {b.mallOrVenue}
                              </td>
                              <td className="py-2 px-3 font-mono text-emerald-800 font-bold">
                                ₱
                                {Number(
                                  b.talentAssignments?.[0]?.agreedTalentFee ||
                                    editForm.baseTalentFee ||
                                    12000
                                ).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 font-mono text-[10px]">{b.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ===============================================================
                  TAB 4: 4. AVAILABILITY
                 =============================================================== */}
              {dossierTab === "availability" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#1E1416]">
                        Calendar Availability &amp; Locked Dates
                      </h3>
                      <p className="text-[11px] text-[#6E5D5F]">
                        Dates below are currently booked for Santa {editForm.displayName}.
                      </p>
                    </div>
                    <Link
                      href="/admin/calendar"
                      className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Edit on Master Calendar →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedTalentBookings.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-lg bg-[#FAF7F5] border border-[#E8DFE0]"
                      >
                        <span className="font-mono text-xs font-bold text-[#9B1B30] block">
                          {new Date(b.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </span>
                        <span className="text-[#1E1416] font-bold block truncate mt-1">
                          {b.mallOrVenue}
                        </span>
                        <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                          Confirmed Deployment
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===============================================================
                  TAB 5: 5. RATES & COSTING (EDITABLE)
                 =============================================================== */}
              {dossierTab === "rates" && (
                <form onSubmit={handleSaveTalent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-1">
                      <label className="block font-bold text-[#3D2C2E]">
                        Internal Base Talent Fee (₱)
                      </label>
                      <input
                        type="number"
                        value={editForm.baseTalentFee}
                        onChange={(e) =>
                          setEditForm({ ...editForm, baseTalentFee: e.target.value })
                        }
                        className="w-full px-3 py-2 font-mono text-sm font-bold"
                      />
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-1">
                      <label className="block font-bold text-[#3D2C2E]">
                        Metro Manila Client Rate (₱)
                      </label>
                      <input
                        type="number"
                        value={editForm.metroManilaRate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, metroManilaRate: e.target.value })
                        }
                        className="w-full px-3 py-2 font-mono text-sm font-bold"
                      />
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-1">
                      <label className="block font-bold text-[#3D2C2E]">
                        Provincial Client Rate (₱)
                      </label>
                      <input
                        type="number"
                        value={editForm.provincialRate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, provincialRate: e.target.value })
                        }
                        className="w-full px-3 py-2 font-mono text-sm font-bold"
                      />
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-1">
                      <label className="block font-bold text-[#3D2C2E]">
                        Dec 24 &amp; 25 Holiday Rate (₱)
                      </label>
                      <input
                        type="number"
                        value={editForm.holidayRate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, holidayRate: e.target.value })
                        }
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
                      value={editForm.specialRateNote}
                      onChange={(e) =>
                        setEditForm({ ...editForm, specialRateNote: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#D6C7C9] bg-[#FAF7F5] text-[#1E1416]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary px-5 py-2 rounded-lg font-bold flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? "Saving..." : "Save Rate Card"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ===============================================================
                  TAB 6: 6. DOCUMENTS
                 =============================================================== */}
              {dossierTab === "documents" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#1E1416]">
                    Dossier &amp; Casting Files
                  </h3>
                  <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-[#C68A12]" />
                      <div>
                        <strong className="text-[#1E1416] block">
                          {editForm.sourceName || editForm.displayName}.docx
                        </strong>
                        <span className="text-[11px] text-[#6E5D5F]">
                          Historical DOCX Casting Archive
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                      Archived
                    </span>
                  </div>
                </div>
              )}

              {/* ===============================================================
                  TAB 7: 7. PAYMENTS & PAYOUTS
                 =============================================================== */}
              {dossierTab === "payouts" && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-[#C68A12]" />
                    <h3 className="text-sm font-bold text-[#1E1416]">
                      Disbursements, Talent Fees &amp; Paluwal Cash Advance Ledger
                    </h3>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                    <div>
                      <span className="text-[#6E5D5F] block">Total Assigned Gigs:</span>
                      <strong className="text-base text-[#1E1416]">
                        {selectedTalentBookings.length} Gigs
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#6E5D5F] block">Allocated Season TF:</span>
                      <strong className="text-base text-emerald-700">
                        ₱
                        {(
                          selectedTalentBookings.length * Number(editForm.baseTalentFee || 12000)
                        ).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#6E5D5F] block">Base Per-Gig TF:</span>
                      <strong className="text-base text-[#9B1B30]">
                        ₱{Number(editForm.baseTalentFee || 12000).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                  <Link
                    href="/admin/expenses"
                    className="btn-primary inline-flex items-center px-4 py-2 rounded-lg font-bold"
                  >
                    Open Expenses &amp; Paluwal Ledger →
                  </Link>
                </div>
              )}

              {/* ===============================================================
                  TAB 8: 8. NOTES & AUDIT
                 =============================================================== */}
              {dossierTab === "audit" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#1E1416]">
                    Audit Trail &amp; Source Provenance
                  </h3>
                  <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#E8DFE0] space-y-2 font-mono text-[11px]">
                    <div>
                      <strong>Canonical Talent ID:</strong>{" "}
                      {selectedTalent?.canonicalId || "TAL-NEW"}
                    </div>
                    <div>
                      <strong>Source Sheet Name:</strong>{" "}
                      {editForm.sourceName || editForm.displayName}
                    </div>
                    <div>
                      <strong>Originating Tracker:</strong> SANTA OPERATION TRACKER - 2026.xlsx
                      (Google Sheet Synced)
                    </div>
                    <div>
                      <strong>Public Funnel Status:</strong>{" "}
                      {editForm.approvedForPublicDisplay ? "Public Approved" : "Internal Only"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
