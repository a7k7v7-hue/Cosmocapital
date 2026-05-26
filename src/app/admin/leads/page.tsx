import { prisma } from "@/lib/prisma";
import LeadsTable from "@/components/admin/LeadsTable";

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
  const leads = await getLeads();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Заявки</h1>
        <a href="/api/admin/leads/export" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          ↓ Экспорт CSV
        </a>
      </div>
      <LeadsTable leads={leads} />
    </div>
  );
}
