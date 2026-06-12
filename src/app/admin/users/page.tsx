import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { canManageUsers, ROLE_LABELS } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UsersClient from "@/components/admin/users/UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!canManageUsers(user.role)) redirect("/admin");

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, brokerName: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Панель
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-gray-900">Пользователи</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(
          [
            { role: "HEAD",          bg: "#faf5ff", border: "#e9d5ff", valColor: "#6b21a8" },
            { role: "SENIOR_BROKER", bg: "#eff6ff", border: "#bfdbfe", valColor: "#1e40af" },
            { role: "BROKER",        bg: "#f8fafc", border: "#e2e8f0", valColor: "#1e293b" },
            { role: "RESEARCH",      bg: "#fff7ed", border: "#fed7aa", valColor: "#9a3412" },
          ] as const
        ).map(({ role, bg, border, valColor }) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div
              key={role}
              className="rounded-xl border px-4 py-3"
              style={{ background: bg, borderColor: border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="text-xl font-bold" style={{ color: valColor }}>{count}</div>
              <div className="text-xs text-gray-500 mt-0.5">{ROLE_LABELS[role]}</div>
            </div>
          );
        })}
      </div>

      <UsersClient
        initialUsers={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
        currentUserId={user.id}
      />
    </div>
  );
}
