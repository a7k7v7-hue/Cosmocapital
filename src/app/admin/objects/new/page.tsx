import { redirect } from "next/navigation";
import ObjectForm from "@/components/admin/ObjectForm";
import { getSessionUser } from "@/lib/session";
import { canEdit } from "@/lib/roles";

export default async function NewObjectPage() {
  const user = await getSessionUser();
  if (!user || !canEdit(user.role)) redirect("/admin/objects");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Новый объект</h1>
      <ObjectForm />
    </div>
  );
}
