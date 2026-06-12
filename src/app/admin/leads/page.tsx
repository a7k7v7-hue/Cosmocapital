import { prisma } from "@/lib/prisma";
import LeadsTable from "@/components/admin/LeadsTable";
import { getSessionUser } from "@/lib/session";
import { canEdit as roleCanEdit } from "@/lib/roles";

export const dynamic = "force-dynamic";

async function getLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { object: { select: { title: true } } },
    });
  } catch {
    return [];
  }
}

export default async function AdminLeadsPage() {
  const [sessionUser, leads] = await Promise.all([getSessionUser(), getLeads()]);
  const userCanEdit = roleCanEdit(sessionUser?.role ?? "RESEARCH");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Заявки</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/leads/export" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Экспорт CSV
        </a>
      </div>
      <LeadsTable leads={leads} canEdit={userCanEdit} />
    </div>
  );
}
