"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { QuickActionsDrawer } from "@/components/quick-actions-drawer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  return (
    <div className="flex h-screen bg-obsidian-950 text-slate-100 overflow-hidden">
      <AdminNav onOpenQuickAction={() => setQuickActionOpen(true)} />
      <main className="flex-1 overflow-y-auto bg-obsidian-950 flex flex-col">
        {children}
      </main>
      <QuickActionsDrawer
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onActionComplete={() => {
          setQuickActionOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
