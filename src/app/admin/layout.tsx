import Link from "next/link";
import SignOutButton from "@/components/admin/SignOutButton";

const navItems = [
  { href: "/admin", label: "Главная", icon: "📊" },
  { href: "/admin/objects", label: "Объекты", icon: "🏢" },
  { href: "/admin/leads", label: "Заявки", icon: "📋" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="font-bold text-gray-900">
            Космо<span className="text-blue-600">капитал</span>
          </span>
          <div className="text-xs text-gray-400 mt-0.5">Панель управления</div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
