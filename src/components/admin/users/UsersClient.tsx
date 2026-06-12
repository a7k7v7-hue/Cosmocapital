"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/roles";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  brokerName: string | null;
  active: boolean;
  createdAt: string;
};

const ROLE_COLORS: Record<UserRole, string> = {
  HEAD: "bg-purple-100 text-purple-700",
  SENIOR_BROKER: "bg-blue-100 text-blue-700",
  BROKER: "bg-gray-100 text-gray-600",
  RESEARCH: "bg-amber-100 text-amber-700",
};

export default function UsersClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("BROKER");
  const [brokerName, setBrokerName] = useState("");
  const [pass, setPass] = useState("");

  function openCreate() {
    setEditingId(null);
    setEmail(""); setName(""); setRole("BROKER"); setBrokerName(""); setPass("");
    setError("");
    setShowForm(true);
  }

  function openEdit(u: UserRow) {
    setEditingId(u.id);
    setEmail(u.email); setName(u.name); setRole(u.role);
    setBrokerName(u.brokerName ?? ""); setPass("");
    setError("");
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setError(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name, role, brokerName: brokerName.trim() || null };
      if (pass) payload.pass = pass;
      if (!editingId) {
        payload.email = email;
        payload.pass = pass;
      }

      const url = editingId ? `/api/admin/users/${editingId}` : "/api/admin/users";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error ?? "Ошибка"); return; }

      if (editingId) {
        setUsers((prev) => prev.map((u) => u.id === editingId ? { ...u, ...data } : u));
      } else {
        setUsers((prev) => [...prev, data]);
      }
      closeForm();
    } catch { setError("Ошибка сети"); }
    finally { setSaving(false); }
  }

  async function toggleActive(u: UserRow) {
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, ...data } : x));
    }
  }

  async function handleDelete(u: UserRow) {
    if (!confirm(`Удалить пользователя «${u.name}»?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Все пользователи</h2>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Добавить
        </button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="border-b border-gray-100 px-5 py-5 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingId ? "Редактировать пользователя" : "Новый пользователь"}
          </h3>
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            {!editingId && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input
                  required type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="broker@company.ru"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Имя *</label>
              <input
                required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иванов Иван"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Роль *</label>
              <select
                value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
              >
                {(["HEAD", "SENIOR_BROKER", "BROKER", "RESEARCH"] as const).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Имя брокера <span className="text-gray-400">(для фильтрации сделок)</span>
              </label>
              <input
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                placeholder="Иванов Иван"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {editingId ? "Новый пароль (оставьте пустым чтобы не менять)" : "Пароль *"}
              </label>
              <input
                type="password"
                required={!editingId}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <button
                type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium"
              >
                {saving ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
              </button>
              <button
                type="button" onClick={closeForm}
                className="border border-gray-200 hover:border-gray-300 text-gray-700 px-5 py-2 rounded-xl text-sm"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Пользователь</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Роль</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Брокер-фильтр</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Статус</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.active ? "opacity-50" : ""}`}>
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {u.brokerName ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {u.active ? "Активен" : "Отключён"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-2.5 py-1 rounded-xl transition-colors"
                    >
                      Изменить
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => toggleActive(u)}
                        className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-2.5 py-1 rounded-xl transition-colors"
                      >
                        {u.active ? "Отключить" : "Включить"}
                      </button>
                    )}
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-xl transition-colors"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
