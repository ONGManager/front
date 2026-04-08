"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { logoutApi } from "../services/authService";

interface SidebarProps {
  userRole?: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", adminOnly: false },
  { href: "/kanban", label: "Tarefas", adminOnly: false },
  { href: "/members", label: "Voluntários", adminOnly: true },
];

export default function Sidebar({ userRole = "colaborador" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = userRole === "admin";

  const handleLogout = async () => {
    await logoutApi();
    localStorage.removeItem("selectedOngId");
    router.push("/");
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col px-3 py-4 gap-0.5">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-purple-700 tracking-tight">
          ONG Manager
        </span>
      </div>

      {/* Role badge */}
      <div className="px-2 mb-3">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isAdmin
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isAdmin ? "Administrador" : "Voluntário"}
        </span>
      </div>

      {/* Nav principal */}
      {filteredNavItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors
              ${
                active
                  ? "bg-purple-50 text-purple-800 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
          >
            {item.label}
          </Link>
        );
      })}

      {/* Rodapé */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-0.5">
        <Link
          href="/OngSelector"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          Trocar ONG
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
