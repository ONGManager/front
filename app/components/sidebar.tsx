"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/dashboard",       label: "Dashboard"       },
  { href: "/tarefas",         label: "Tarefas"         },
  { href: "/contas-a-pagar",  label: "Contas a pagar"  },
  { href: "/doacoes",         label: "Doações"         },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col px-3 py-4 gap-0.5">

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
          {/* <LogoIcon /> */}
        </div>
        <span className="text-[13px] font-semibold text-purple-700 tracking-tight">
          ONG Manager
        </span>
      </div>

      {/* Nav principal */}
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors
              ${active
                ? "bg-purple-50 text-purple-800 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
          >
            {/* <NavIcon name={item.label} active={active} /> */}
            {item.label}
          </Link>
        );
      })}

      {/* Rodapé */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-0.5">
        <Link
          href="/perfil"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors
            ${pathname === "/perfil"
              ? "bg-purple-50 text-purple-800 font-medium"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
        >
          {/* <PerfilIcon active={pathname === "/perfil"} /> */}
          Perfil
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
        >
          {/* <LogoutIcon /> */}
          Sair
        </Link>
      </div>

    </aside>
  );
}