"use client";

import { ShieldCheck, UserCheck, Lock } from "lucide-react";

const seedStaff = [
  {
    name: "System Administrator",
    email: "admin@brilloevents.com",
    role: "ADMIN",
    scope: "All operational, financial, import, conflict resolution, and settings permissions.",
  },
  {
    name: "Operations Dispatcher",
    email: "ops@brilloevents.com",
    role: "OPS",
    scope: "Bookings, calendar, Santa & PA assignments, deployment readiness checklists.",
  },
  {
    name: "Finance Specialist",
    email: "finance@brilloevents.com",
    role: "FINANCE",
    scope: "Payment verification, receivables, expenses, Paluwal advances, talent payouts.",
  },
  {
    name: "Corporate Sales Lead",
    email: "sales@brilloevents.com",
    role: "SALES",
    scope: "Leads, client records, temporary holds, quotation drafting.",
  },
  {
    name: "Production Assistant (Handler)",
    email: "pa@brilloevents.com",
    role: "PA",
    scope: "Assigned event briefs, call times, and on-site execution checklists.",
  },
];

export default function UsersPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="pb-4 border-b border-[#E2DED4]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#B99A5B] font-bold">
          Role-Based Access Control (RBAC)
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#252824] tracking-tight mt-0.5">
          Users &amp; Staff Permissions Matrix
        </h1>
        <p className="text-xs text-[#6B706C] mt-1">
          Enforces least-privilege separation across Sales, Operations, Finance, PA/Crew, and Administration.
        </p>
      </div>

      <div className="bg-[#FFFEFB] border border-[#E2DED4] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F6F3EC] border-b border-[#E2DED4] text-[10px] font-mono uppercase tracking-wider text-[#6B706C]">
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Authorized Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DED4]/60">
            {seedStaff.map((u) => (
              <tr key={u.email} className="hover:bg-[#F6F3EC]/60">
                <td className="py-3 px-4 font-semibold text-[#252824]">{u.name}</td>
                <td className="py-3 px-4 font-mono text-[#6B706C]">{u.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-[#F6F3EC] border border-[#B99A5B]/40 text-[#8C6207] font-mono font-bold text-[10px]">
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#6B706C]">{u.scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
