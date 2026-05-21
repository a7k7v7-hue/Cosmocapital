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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Заявки</h1>
      <LeadsTable leads={leads} />
    </div>
  );
}
