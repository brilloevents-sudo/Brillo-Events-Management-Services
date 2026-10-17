import prisma from "./prisma";

export async function logAudit(params: {
  action: string;
  entityType: string;
  entityId?: string;
  actorName?: string;
  userId?: string;
  details?: Record<string, any>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        actorName: params.actorName || "STAFF_USER",
        userId: params.userId,
        detailsJson: params.details ? JSON.stringify(params.details) : undefined,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
