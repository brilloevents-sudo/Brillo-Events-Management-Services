import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { uploadToSupabaseGallery } from "@/lib/supabase";
import fs from "fs";
import path from "path";

const ALLOWED_MEDIA_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "mp4",
  "webm",
  "mov",
  "m4v",
]);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const talent = await prisma.talent.findFirst({
      where: {
        OR: [{ id: params.id }, { canonicalId: params.id }],
      },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        },
        aliases: true,
        assignments: {
          include: {
            booking: {
              include: { client: true, payments: true, contracts: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        ledgerEntries: {
          orderBy: { entryDate: "desc" },
        },
      },
    });

    if (!talent) {
      return NextResponse.json({ success: false, error: "Talent not found" }, { status: 404 });
    }

    // Calculate Net Paluwal Balance
    let totalAdvances = 0;
    let totalDeductions = 0;
    let totalPayouts = 0;

    talent.ledgerEntries.forEach((entry) => {
      const amt = Number(entry.amount);
      if (entry.entryType === "ADVANCE") totalAdvances += amt;
      else if (entry.entryType === "DEDUCTION") totalDeductions += amt;
      else if (entry.entryType === "PAYOUT") totalPayouts += amt;
    });

    const netAdvanceBalance = totalAdvances - totalDeductions;

    return NextResponse.json({
      success: true,
      talent: {
        ...talent,
        financeSummary: {
          totalAdvances,
          totalDeductions,
          netAdvanceBalance,
          totalPayouts,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let body: any = {};
    let uploadedFile: File | null = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body.action = formData.get("action")?.toString();
      body.imageId = formData.get("imageId")?.toString();
      body.fileName = formData.get("fileName")?.toString();
      body.publicUrl = formData.get("publicUrl")?.toString();
      body.caption = formData.get("caption")?.toString();
      body.setAsPrimary = formData.get("setAsPrimary") === "true";
      body.approvedForClient = formData.get("approvedForClient") !== "false";
      body.displayName = formData.get("displayName")?.toString();
      const fileEntry = formData.get("file");
      if (fileEntry instanceof File) {
        uploadedFile = fileEntry;
      }
    } else {
      body = await req.json().catch(() => ({}));
    }

    const {
      action,
      imageId,
      fileName,
      fileDataUrl,
      publicUrl: customPublicUrl,
      caption,
      setAsPrimary = false,
      approvedForClient,
      displayName,
      sourceName,
      talentType,
      status,
      age,
      height,
      nationality,
      phone,
      bio,
      baseTalentFee,
      metroManilaRate,
      provincialRate,
      holidayRate,
      specialRateNote,
      approvedForPublicDisplay,
      actor = "SUPER_ADMIN",
    } = body;

    const existing = await prisma.talent.findFirst({
      where: {
        OR: [{ id: params.id }, { canonicalId: params.id }],
      },
      include: { images: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Talent not found" }, { status: 404 });
    }

    // 1. Handle Photo & Video Gallery Actions
    if (action === "ADD_PHOTO" || action === "ADD_MEDIA") {
      let resolvedUrl = customPublicUrl || "";
      const rawName = (
        uploadedFile?.name ||
        fileName ||
        `santa_${existing.displayName}_${Date.now()}.jpg`
      ).replace(/[^a-zA-Z0-9._-]/g, "_");
      const rawExt = (rawName.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ALLOWED_MEDIA_EXTENSIONS.has(rawExt) ? rawExt : "jpg";
      const safeName = rawName.replace(/\.[^.]+$/, "") + "." + safeExt;

      if (uploadedFile) {
        try {
          const bytes = await uploadedFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const uniqueFile = `${Date.now()}_${safeName}`;
          const sbUrl = await uploadToSupabaseGallery(
            `${existing.id}/${uniqueFile}`,
            buffer,
            uploadedFile.type || "image/jpeg"
          );
          if (sbUrl) {
            resolvedUrl = sbUrl;
          } else {
            const uploadDir = path.join(process.cwd(), "public", "talents", "uploads");
            fs.mkdirSync(uploadDir, { recursive: true });
            fs.writeFileSync(path.join(uploadDir, uniqueFile), buffer);
            resolvedUrl = `/talents/uploads/${uniqueFile}`;
          }
        } catch {
          // fallback
        }
      } else if (
        fileDataUrl &&
        typeof fileDataUrl === "string" &&
        (fileDataUrl.startsWith("data:image/") || fileDataUrl.startsWith("data:video/"))
      ) {
        try {
          const matches = fileDataUrl.match(/^data:(image|video)\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (matches) {
            const buffer = Buffer.from(matches[3], "base64");
            const uniqueFile = `${Date.now()}_${safeName}`;
            const sbUrl = await uploadToSupabaseGallery(
              `${existing.id}/${uniqueFile}`,
              buffer,
              `${matches[1]}/${matches[2]}`
            );
            if (sbUrl) {
              resolvedUrl = sbUrl;
            } else {
              try {
                const uploadDir = path.join(process.cwd(), "public", "talents", "uploads");
                fs.mkdirSync(uploadDir, { recursive: true });
                fs.writeFileSync(path.join(uploadDir, uniqueFile), buffer);
                resolvedUrl = `/talents/uploads/${uniqueFile}`;
              } catch {
                resolvedUrl = fileDataUrl;
              }
            }
          } else {
            resolvedUrl = fileDataUrl;
          }
        } catch {
          resolvedUrl = fileDataUrl;
        }
      }

      if (!resolvedUrl) {
        return NextResponse.json(
          {
            success: false,
            error: "Please select a photo/video file or provide a valid video URL.",
          },
          { status: 400 }
        );
      }

      const isVideoItem =
        (fileDataUrl && fileDataUrl.startsWith("data:video/")) ||
        /\.(mp4|webm|mov|m4v)(\?|$)/i.test(resolvedUrl) ||
        /\.(mp4|webm|mov|m4v)$/i.test(safeName) ||
        /youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com/i.test(resolvedUrl);

      const shouldBePrimary = Boolean(
        !isVideoItem && (setAsPrimary || existing.images.length === 0)
      );
      if (shouldBePrimary) {
        await prisma.talentImage.updateMany({
          where: { talentId: existing.id },
          data: { isPrimary: false },
        });
      }

      const createdImage = await prisma.talentImage.create({
        data: {
          talentId: existing.id,
          fileName: safeName,
          originalPath: resolvedUrl,
          publicUrl: resolvedUrl,
          isPrimary: shouldBePrimary,
          caption: caption || `Santa ${existing.displayName} Portrait`,
          approvedForClient:
            approvedForClient !== undefined
              ? Boolean(approvedForClient)
              : existing.approvedForPublicDisplay,
        },
      });

      const refreshed = await prisma.talent.findUnique({
        where: { id: existing.id },
        include: {
          images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
          aliases: true,
        },
      });

      return NextResponse.json({ success: true, image: createdImage, talent: refreshed });
    }

    if (action === "SET_PRIMARY_PHOTO" && imageId) {
      await prisma.talentImage.updateMany({
        where: { talentId: existing.id },
        data: { isPrimary: false },
      });
      await prisma.talentImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
      const refreshed = await prisma.talent.findUnique({
        where: { id: existing.id },
        include: {
          images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
          aliases: true,
        },
      });
      return NextResponse.json({ success: true, talent: refreshed });
    }

    if (action === "UPDATE_PHOTO" && imageId) {
      const imgUpdates: any = {};
      if (caption !== undefined) imgUpdates.caption = caption;
      if (approvedForClient !== undefined) imgUpdates.approvedForClient = Boolean(approvedForClient);
      await prisma.talentImage.update({
        where: { id: imageId },
        data: imgUpdates,
      });
      const refreshed = await prisma.talent.findUnique({
        where: { id: existing.id },
        include: {
          images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
          aliases: true,
        },
      });
      return NextResponse.json({ success: true, talent: refreshed });
    }

    if (action === "DELETE_PHOTO" && imageId) {
      const targetImg = existing.images.find((i) => i.id === imageId || i.publicUrl === imageId);
      await prisma.talentImage.deleteMany({
        where: {
          talentId: existing.id,
          OR: [{ id: imageId }, { publicUrl: imageId }],
        },
      });

      if (targetImg?.isPrimary) {
        const remaining = await prisma.talentImage.findMany({
          where: { talentId: existing.id },
          orderBy: { createdAt: "desc" },
        });
        if (remaining.length > 0) {
          await prisma.talentImage.update({
            where: { id: remaining[0].id },
            data: { isPrimary: true },
          });
        }
      }

      const refreshed = await prisma.talent.findUnique({
        where: { id: existing.id },
        include: {
          images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
          aliases: true,
        },
      });
      return NextResponse.json({ success: true, talent: refreshed });
    }

    if (action === "REORDER_PHOTOS" && Array.isArray(body.images)) {
      const reorderedList = body.images;
      const baseNow = Date.now();
      for (let idx = 0; idx < reorderedList.length; idx++) {
        const imgItem = reorderedList[idx];
        const matchCond: any[] = [];
        if (imgItem.id) matchCond.push({ id: imgItem.id });
        if (imgItem.publicUrl) matchCond.push({ publicUrl: imgItem.publicUrl });
        if (matchCond.length > 0) {
          await prisma.talentImage.updateMany({
            where: {
              talentId: existing.id,
              OR: matchCond,
            },
            data: {
              isPrimary: Boolean(imgItem.isPrimary),
              createdAt: new Date(baseNow - idx * 1000),
            },
          });
        }
      }

      const refreshed = await prisma.talent.findUnique({
        where: { id: existing.id },
        include: {
          images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
          aliases: true,
        },
      });
      return NextResponse.json({ success: true, talent: refreshed });
    }

    // 2. Standard Talent Profile & Rate Card Updates
    const updates: any = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (sourceName !== undefined) updates.sourceName = sourceName;
    if (talentType !== undefined) updates.talentType = talentType;
    if (status !== undefined) updates.status = status;
    if (age !== undefined) updates.age = age ? parseInt(String(age), 10) : null;
    if (height !== undefined) updates.height = height;
    if (nationality !== undefined) updates.nationality = nationality;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (baseTalentFee !== undefined) updates.baseTalentFee = Number(baseTalentFee);
    if (metroManilaRate !== undefined) updates.metroManilaRate = Number(metroManilaRate);
    if (provincialRate !== undefined) updates.provincialRate = Number(provincialRate);
    if (holidayRate !== undefined) updates.holidayRate = Number(holidayRate);
    if (specialRateNote !== undefined) updates.specialRateNote = specialRateNote;
    if (approvedForPublicDisplay !== undefined) {
      updates.approvedForPublicDisplay = Boolean(approvedForPublicDisplay);
    }

    // If pending photo was picked during profile edit, save it automatically
    const pendingMedia = body.pendingPhoto || (body.fileDataUrl ? {
      fileName: body.fileName,
      fileDataUrl: body.fileDataUrl,
      publicUrl: body.publicUrl,
      caption: body.caption,
      setAsPrimary: body.setAsPrimary,
      approvedForClient: body.approvedForClient
    } : null);

    if (pendingMedia && (pendingMedia.fileDataUrl || pendingMedia.publicUrl)) {
      let resolvedPendingUrl = pendingMedia.publicUrl || "";
      const safePendingName = (pendingMedia.fileName || `santa_${existing.displayName}_${Date.now()}.jpg`).replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );
      if (pendingMedia.fileDataUrl && typeof pendingMedia.fileDataUrl === "string" && pendingMedia.fileDataUrl.startsWith("data:")) {
        try {
          const matches = pendingMedia.fileDataUrl.match(/^data:(image|video)\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (matches) {
            const buffer = Buffer.from(matches[3], "base64");
            const uploadDir = path.join(process.cwd(), "public", "talents", "uploads");
            fs.mkdirSync(uploadDir, { recursive: true });
            const uniqueFile = `${Date.now()}_${safePendingName}`;
            fs.writeFileSync(path.join(uploadDir, uniqueFile), buffer);
            resolvedPendingUrl = `/talents/uploads/${uniqueFile}`;
          } else {
            resolvedPendingUrl = pendingMedia.fileDataUrl;
          }
        } catch {
          resolvedPendingUrl = pendingMedia.fileDataUrl;
        }
      }

      if (resolvedPendingUrl) {
        const isVideoItem =
          (pendingMedia.fileDataUrl && pendingMedia.fileDataUrl.startsWith("data:video/")) ||
          /\.(mp4|webm|mov|m4v)(\?|$)/i.test(resolvedPendingUrl) ||
          /\.(mp4|webm|mov|m4v)$/i.test(safePendingName);

        const shouldPrimary = Boolean(!isVideoItem && (pendingMedia.setAsPrimary || existing.images.length === 0));
        if (shouldPrimary) {
          await prisma.talentImage.updateMany({
            where: { talentId: existing.id },
            data: { isPrimary: false },
          });
        }

        await prisma.talentImage.create({
          data: {
            talentId: existing.id,
            fileName: safePendingName,
            originalPath: resolvedPendingUrl,
            publicUrl: resolvedPendingUrl,
            isPrimary: shouldPrimary,
            caption: pendingMedia.caption || `Santa ${existing.displayName} Portrait`,
            approvedForClient:
              pendingMedia.approvedForClient !== undefined
                ? Boolean(pendingMedia.approvedForClient)
                : existing.approvedForPublicDisplay,
          },
        });
      }
    }

    const updated = await prisma.talent.update({
      where: { id: existing.id },
      data: updates,
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
        aliases: true,
      },
    });

    await logAudit({
      action: "TALENT_UPDATE",
      entityType: "Talent",
      entityId: existing.id,
      actorName: actor,
      details: { updates },
    });

    return NextResponse.json({ success: true, talent: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: { id: string } }
) {
  return PATCH(req, ctx);
}
