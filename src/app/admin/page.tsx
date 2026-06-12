import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MigratePhotosButton from "@/components/admin/MigratePhotosButton";
import { getWeightedGci, isStuck, formatGci } from "@/lib/pipeline";
import { getSessionUser } from "@/lib/session";
import { canEdit as roleCanEdit, seeAllBrokers } from "@/lib/roles";

async function getStats(brokerFilter: Record<string, string>) {
  try {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [totalObjects, activeObjects, totalLeads, newLeads, activeDeals, closingSoon, reEngageSoon] =
      await Promise.all([
        prisma.object.count(),
        prisma.object.count({ where: { status: "ACTIVE" } }),
        prisma.lead.count(),
        prisma.lead.count({ where: { status: "NEW" } }),
        prisma.deal.findMany({
          where: { isLost: false, isClosed: false, ...brokerFilter },
          select: { stage: true, expectedGci: true, lastStageChangedAt: true, nextActionDate: true },
        }),
        prisma.deal.count({
          where: { isLost: false, isClosed: false, expectedCloseDate: { gte: now, lte: in30 }, ...brokerFilter },
        }),
        prisma.deal.count({
          where: { isLost: true, reEngagementDate: { gte: now, lte: in7 }, ...brokerFilter },
        }),
      ]);

    const pipelineWeighted = activeDeals.reduce((sum, d) => sum + getWeightedGci(d.expectedGci, d.stage), 0);
    const stuckDeals = activeDeals.filter((d) => isStuck(d.lastStageChangedAt)).length;
    const overdueActions = activeDeals.filter((d) => d.nextActionDate && new Date(d.nextActionDate) < now).length;

    return { totalObjects, activeObjects, totalLeads, newLeads, activeDeals: activeDeals.length, pipelineWeighted, stuckDeals, closingSoon, reEngageSoon, overdueActions };
  } catch {
    return { totalObjects: 0, activeObjects: 0, totalLeads: 0, newLeads: 0, activeDeals: 0, pipelineWeighted: 0, stuckDeals: 0, closingSoon: 0, reEngageSoon: 0, overdueActions: 0 };
  }
}

function StatCard({
  href, value, label, sub, accent, icon,
}: {
  href: string; value: string | number; label: string; sub: string;
  accent: "blue" | "red" | "orange" | "green" | "purple" | "slate";
  icon: React.ReactNode;
}) {
  const colors = {
    blue:   { bg: "#eff6ff", icon: "#3b82f6", val: "#1e40af", border: "#bfdbfe", iconBg: "#dbeafe" },
    red:    { bg: "#fef2f2", icon: "#ef4444", val: "#991b1b", border: "#fecaca", iconBg: "#fee2e2" },
    orange: { bg: "#fff7ed", icon: "#f97316", val: "#9a3412", border: "#fed7aa", iconBg: "#ffedd5" },
    green:  { bg: "#f0fdf4", icon: "#22c55e", val: "#166534", border: "#bbf7d0", iconBg: "#dcfce7" },
    purple: { bg: "#faf5ff", icon: "#a855f7", val: "#6b21a8", border: "#e9d5ff", iconBg: "#f3e8ff" },
    slate:  { bg: "#f8fafc", icon: "#64748b", val: "#1e293b", border: "#e2e8f0", iconBg: "#f1f5f9" },
  };
  const c = colors[accent];

  return (
    <Link
      href={href}
      className="group rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: c.bg, borderColor: c.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.iconBg }}>
          {icon}
        </div>
        <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight" style={{ color: c.val }}>{value}</div>
        <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const sessionUser = await getSessionUser();
  const userCanEdit = roleCanEdit(sessionUser?.role ?? "RESEARCH");
  const brokerFilter: Record<string, string> =
    !seeAllBrokers(sessionUser?.role ?? "RESEARCH") && sessionUser?.brokerName
      ? { brokerName: sessionUser.brokerName }
      : {};

  const s = await getStats(brokerFilter);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  const firstName = sessionUser?.name?.split(" ")[0] ?? "";

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard href="/admin/pipeline" value={s.activeDeals} label="Сделок в работе" sub={`${formatGci(s.pipelineWeighted)} взвеш. GCI`} accent="blue" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>} />
        <StatCard href="/admin/objects" value={s.totalObjects} label="Объектов" sub={`${s.activeObjects} активных`} accent="slate" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>} />
        <StatCard href="/admin/leads" value={s.totalLeads} label="Заявок" sub={`${s.newLeads} новых`} accent={s.newLeads > 0 ? "blue" : "slate"} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={s.newLeads > 0 ? "#3b82f6" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>} />
        {s.stuckDeals > 0
          ? <StatCard href="/admin/pipeline" value={s.stuckDeals} label="Зависших сделок" sub="более 30 дней без движения" accent="red" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
          : <StatCard href="/admin/pipeline/stats" value={s.closingSoon} label="Закрытий в 30 дней" sub="ожидаемое закрытие" accent="green" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>} />
        }
      </div>

      {/* Alerts row */}
      {(s.overdueActions > 0 || s.reEngageSoon > 0 || s.closingSoon > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {s.overdueActions > 0 && (
            <Link href="/admin/pipeline/planer" className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800 hover:bg-orange-100 transition-colors">
              <span className="text-lg">⏰</span>
              <span><strong>{s.overdueActions}</strong> просроченных шагов</span>
            </Link>
          )}
          {s.closingSoon > 0 && (
            <Link href="/admin/pipeline/planer" className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              <span><strong>{s.closingSoon}</strong> закрытий в этом месяце</span>
            </Link>
          )}
          {s.reEngageSoon > 0 && (
            <Link href="/admin/pipeline/planer" className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-medium text-purple-800 hover:bg-purple-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              <span><strong>{s.reEngageSoon}</strong> повторных контактов на неделе</span>
            </Link>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {userCanEdit && (
          <Link href="/admin/pipeline/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Новая сделка
          </Link>
        )}
        <Link href="/admin/pipeline" className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Пайплайн
        </Link>
        {userCanEdit && (
          <Link href="/admin/objects/new" className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Добавить объект
          </Link>
        )}
        <Link href="/admin/pipeline/stats" className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Аналитика
        </Link>
      </div>

      {sessionUser?.role === "HEAD" && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <MigratePhotosButton />
        </div>
      )}
    </div>
  );
}
