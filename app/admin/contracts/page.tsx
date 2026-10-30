"use client";

import { useEffect, useState, useRef } from "react";
import {
  FileCheck2,
  Upload,
  CheckCircle,
  ShieldCheck,
  Eye,
  FileUp,
  Lock,
  X,
} from "lucide-react";

async function sha256FileBrowser(file: File): Promise<{ hex: string; base64: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Convert first 2MB max for base64 payload verification
  const slice = arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 2 * 1024 * 1024));
  let binary = "";
  const bytes = new Uint8Array(slice);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return { hex, base64 };
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [templateType, setTemplateType] = useState("WITH_DP");
  const [signedFileUrl, setSignedFileUrl] = useState("");
  const [signerName, setSignerName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(
    null
  );

  // Drag-and-Drop Signed PDF / Image Upload + SHA-256 Hash State
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [documentSha256, setDocumentSha256] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function loadData() {
    setLoading(true);
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((d) => {
        if (d.bookings) {
          setBookings(d.bookings);
          if (d.bookings.length > 0 && !selectedBookingId) {
            setSelectedBookingId(d.bookings[0].id);
          }

          const allContracts = d.bookings.flatMap((b: any) =>
            (b.contracts || []).map((c: any) => ({ ...c, booking: b }))
          );
          setContracts(allContracts);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function processSelectedFile(file: File) {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      setFeedback({
        type: "err",
        msg: "Only PDF, PNG, JPG, or WEBP signed agreement files are permitted.",
      });
      return;
    }
    const { hex, base64 } = await sha256FileBrowser(file);
    setUploadedFileName(file.name);
    setUploadedFileBase64(base64);
    setDocumentSha256(hex);
    setSignedFileUrl("");
    setFeedback(null);
  }

  async function handleCreateContract(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBookingId) return;

    setGenerating(true);
    setFeedback(null);
    try {
      const role =
        typeof window !== "undefined"
          ? localStorage.getItem("brillo_rbac_role") || "SUPER_ADMIN"
          : "SUPER_ADMIN";

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-brillo-role": role,
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          templateType,
          signedFileUrl: signedFileUrl.trim() || null,
          uploadedFileName,
          uploadedFileBase64,
          documentSha256,
          signerName,
          isSigned: Boolean(uploadedFileBase64 || signedFileUrl.trim()),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFeedback({
        type: "ok",
        msg: `Contract ${data.contract?.contractNumber || "Agreement"} archived!${
          data.documentSha256 ? ` SHA-256 Digest: ${data.documentSha256.slice(0, 16)}...` : ""
        }`,
      });
      setUploadedFileName(null);
      setUploadedFileBase64(null);
      setDocumentSha256(null);
      setSignedFileUrl("");
      loadData();
    } catch (err: any) {
      setFeedback({ type: "err", msg: err.message });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E8DFE0]">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="badge-esign px-2.5 py-0.5 rounded text-[10px] font-mono">
              E-SIGN &amp; ARCHIVE
            </span>
            <h1 className="page-title text-2xl font-serif tracking-tight flex items-center">
              Contracts &amp; Agreement Archive
            </h1>
          </div>
          <p className="page-subtitle text-xs mt-1">
            Framework agreement generation, Documenso e-signature sync, and SHA-256 verified signed PDF archival.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border ${
            feedback.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-[#F9EBED] border-[#F0D0D5] text-[#9B1B30]"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Clean White Velvet Generator & Drag-and-Drop Uploader Card */}
      <form
        onSubmit={handleCreateContract}
        className="dashboard-card p-6 space-y-5 text-xs"
      >
        <div className="flex items-center justify-between border-b border-[#E8DFE0] pb-3">
          <h2 className="text-sm font-bold text-[#1E1416] flex items-center">
            <FileCheck2 className="w-4 h-4 mr-2 text-[#9B1B30]" />
            Generate Agreement or Archive Signed Document
          </h2>
          <span className="inline-flex items-center text-[11px] font-mono text-[#756568]">
            <Lock className="w-3 h-3 mr-1 text-[#C68A12]" />
            Cryptographic SHA-256 Verification Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1.5">Select Booking *</label>
            <select
              required
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full px-3 py-2.5"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingNumber} • {b.mallOrVenue}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1.5">Agreement Framework Template *</label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full px-3 py-2.5"
            >
              <option value="WITH_DP">Standard Framework (With 50% Downpayment)</option>
              <option value="NO_DP">Special Framework (Authorized Deposit Waiver)</option>
              <option value="SM_CUSTOM">SM Supermalls Institutional MOA</option>
            </select>
          </div>

          <div>
            <label className="block mb-1.5">Client Signer Name</label>
            <input
              type="text"
              placeholder="e.g. Maria Santos (Marketing Director)"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full px-3 py-2.5"
            />
          </div>
        </div>

        {/* Drag-and-Drop Signed PDF / Image Upload Zone */}
        <div className="space-y-2">
          <label className="block">
            Upload Signed Agreement PDF / Scan (Auto-Computes SHA-256 Hash)
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const f = e.dataTransfer.files?.[0];
              if (f) processSelectedFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition ${
              dragActive
                ? "border-[#9B1B30] bg-[#F9EBED]/50"
                : uploadedFileName
                ? "border-emerald-400 bg-emerald-50/40"
                : "border-[#D6C7C9] bg-[#FCF9F8] hover:border-[#9B1B30]/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) processSelectedFile(f);
              }}
            />

            {uploadedFileName ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-left px-2">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-bold text-[#1E1416]">{uploadedFileName}</div>
                    <div className="text-[11px] font-mono text-emerald-800 break-all">
                      SHA-256: {documentSha256}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFileName(null);
                    setUploadedFileBase64(null);
                    setDocumentSha256(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-[#756568]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <FileUp className="w-6 h-6 text-[#9B1B30] mx-auto" />
                <div className="font-semibold text-[#1E1416]">
                  Drag &amp; drop signed PDF or image here, or{" "}
                  <span className="text-[#9B1B30] underline">browse file</span>
                </div>
                <p className="text-[11px] text-[#756568]">
                  Supports PDF, PNG, JPG up to 10MB • Automatically verified &amp; hashed with SHA-256
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Optional Validated Cloud Storage HTTPS URL */}
        <div>
          <label className="block mb-1.5">
            Or Verified Cloud Object Storage HTTPS URL (S3 / R2 / Documenso)
          </label>
          <input
            type="url"
            placeholder="https://storage.brilloevent.com/contracts/signed-sm-moa.pdf"
            value={signedFileUrl}
            onChange={(e) => setSignedFileUrl(e.target.value)}
            className="w-full px-3 py-2.5 font-mono"
          />
          <p className="text-[10.5px] text-[#756568] mt-1">
            Security note: Raw local filesystem paths are rejected; use the drag-and-drop uploader above or an HTTPS bucket URL.
          </p>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#E8DFE0]">
          <button
            type="submit"
            disabled={generating}
            className="btn-primary px-5 py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {generating ? "Hashing & Archiving..." : "Generate & Archive Contract"}
          </button>
        </div>
      </form>

      {/* Executed & Generated Agreements Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="p-4 border-b border-[#E8DFE0] flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E1416]">
            Executed &amp; Generated Agreements ({contracts.length})
          </span>
          <span className="text-[11px] text-[#756568]">
            Immutable contract registry
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#9B1B30]" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#756568]">
            No contracts generated yet. Select a booking above to generate or upload a signed MOA.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8DFE0] bg-[#FCF9F8] text-[10px] font-mono text-[#756568] uppercase">
                  <th className="p-3.5">Contract Number</th>
                  <th className="p-3.5">Venue / Branch</th>
                  <th className="p-3.5">Template</th>
                  <th className="p-3.5">Signer</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Verification / Digest</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFE0] font-mono text-[11px]">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F4ECEE]/50 transition">
                    <td className="p-3.5 font-bold text-[#9B1B30]">{c.contractNumber}</td>
                    <td className="p-3.5 text-[#1E1416] font-sans font-semibold">
                      {c.booking?.mallOrVenue}
                    </td>
                    <td className="p-3.5 text-[#4A3A3D]">{c.templateType}</td>
                    <td className="p-3.5 text-[#4A3A3D] font-sans">
                      {c.signerName || "Awaiting Signer"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.status === "SIGNED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "badge-gold"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#756568]">{c.signProvider}</td>
                    <td className="p-3.5 text-right">
                      {c.signedFileUrl ? (
                        <a
                          href={c.signedFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#9B1B30] hover:underline font-sans font-semibold inline-flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Document
                        </a>
                      ) : (
                        <span className="text-[#756568] font-sans">Pending Signature</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
