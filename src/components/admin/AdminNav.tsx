"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/admin/SignOutButton";
import type { UserRole } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/roles";

// Inline SVG icons — no external dependency
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  pipeline: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  objects: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  leads: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { href: "/admin", label: "Главная", icon: "dashboard" as const, exact: true },
  { href: "/admin/pipeline", label: "Пайплайн", icon: "pipeline" as const, exact: false },
  { href: "/admin/objects", label: "Объекты", icon: "objects" as const, exact: false },
  { href: "/admin/leads", label: "Заявки", icon: "leads" as const, exact: false },
];

const PIPELINE_SUB = [
  { href: "/admin/pipeline", label: "Активные", exact: true },
  { href: "/admin/pipeline?tab=closed", label: "Закрытые", exact: true },
  { href: "/admin/pipeline?tab=lost", label: "Проигранные", exact: true },
  { href: "/admin/pipeline/planer", label: "Планёрка", exact: false },
  { href: "/admin/pipeline/stats", label: "Аналитика", exact: false },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function AdminNav({
  overdueCount = 0,
  userRole,
  userName,
}: {
  overdueCount?: number;
  userRole?: UserRole;
  userName?: string;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const inPipeline = pathname.startsWith("/admin/pipeline");

  return (
    <aside className="w-60 shrink-0 flex flex-col" style={{ background: "#0f172a", minHeight: "100vh" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
            КК
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-tight">КосмоКапитал</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>CRM</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  background: active ? "rgba(59,130,246,0.2)" : "transparent",
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span style={{ color: active ? "#60a5fa" : "rgba(255,255,255,0.4)" }}>
                  {Icons[item.icon]}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.href === "/admin/pipeline" && overdueCount > 0 && (
                  <span className="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {overdueCount > 99 ? "99+" : overdueCount}
                  </span>
                )}
                {item.href === "/admin/pipeline" && (
                  <span style={{ color: "rgba(255,255,255,0.25)", transform: inPipeline ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
                    {Icons.chevron}
                  </span>
                )}
              </Link>

              {/* Pipeline sub-nav */}
              {item.href === "/admin/pipeline" && inPipeline && (
                <div className="ml-9 mt-1 mb-1 flex flex-col gap-0.5">
                  {PIPELINE_SUB.map((sub) => {
                    const subActive = sub.exact
                      ? pathname === sub.href.split("?")[0]
                      : pathname.startsWith(sub.href);
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="px-2 py-1.5 rounded-md text-xs transition-colors"
                        style={{
                          color: subActive ? "#93c5fd" : "rgba(255,255,255,0.35)",
                          background: subActive ? "rgba(59,130,246,0.15)" : "transparent",
                          fontWeight: subActive ? 500 : 400,
                        }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {userRole === "HEAD" && (
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
            style={{
              color: pathname.startsWith("/admin/users") ? "#fff" : "rgba(255,255,255,0.5)",
              background: pathname.startsWith("/admin/users") ? "rgba(59,130,246,0.2)" : "transparent",
            }}
          >
            <span style={{ color: pathname.startsWith("/admin/users") ? "#60a5fa" : "rgba(255,255,255,0.4)" }}>
              {Icons.users}
            </span>
            Пользователи
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {userName && (
          <Link href="/admin/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all duration-150 group"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff" }}>
              {getInitials(userName)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-white truncate">{userName}</div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                {userRole ? ROLE_LABELS[userRole] : ""}
              </div>
            </div>
          </Link>
        )}
        <SignOutButton />
      </div>
    </aside>
  );
}
