import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin/AdminNav";
import { getSessionUser } from "@/lib/session";

async function getOverdueCount() {
  try {
    return await prisma.deal.count({
      where: { isLost: false, isClosed: false, nextActionDate: { lt: new Date() } },
    });
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [overdueCount, user] = await Promise.all([getOverdueCount(), getSessionUser()]);
  return (
    <div className="min-h-screen flex bg-gray-50" style={{ colorScheme: "light" }}>
      <AdminNav
        overdueCount={overdueCount}
        userRole={user?.role}
        userName={user?.name}
      />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
