import { redirect } from "next/navigation";
import Link from "next/link";
import DealForm from "@/components/admin/pipeline/DealForm";
import { getSessionUser } from "@/lib/session";
import { canEdit } from "@/lib/roles";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: Promise<{ clientName?: string; lprContact?: string; leadSource?: string }>;
}) {
  const [user, sp] = await Promise.all([getSessionUser(), searchParams]);
  if (!user || !canEdit(user.role)) redirect("/admin/pipeline");

  const prefill = sp.clientName
    ? { clientName: sp.clientName, lprContact: sp.lprContact ?? "", leadSource: sp.leadSource ?? "" }
    : undefined;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/pipeline"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Пайплайн
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="text-xl font-bold text-gray-900">Новая сделка</h1>
      </div>
      <DealForm mode="create" prefill={prefill} />
    </div>
  );
}
