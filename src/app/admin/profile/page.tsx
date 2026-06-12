import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/roles";
import ProfileClient from "@/components/admin/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Профиль</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-3 text-sm">
        <Row label="Имя" value={user.name} />
        <Row label="Email" value={user.email} />
        <Row label="Роль" value={ROLE_LABELS[user.role]} />
        {user.brokerName && <Row label="Брокер" value={user.brokerName} />}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Изменить пароль</h2>
        <ProfileClient />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
