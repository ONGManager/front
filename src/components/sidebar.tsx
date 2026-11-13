"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { logoutApi } from "../services/authService";
import Logo from "../assets/Logo.png";

interface SidebarProps {
  userRole?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", adminOnly: false },
  { href: "/kanban", label: "Tarefas", adminOnly: false },  
  { href: "/bill", label: "Financeiro", adminOnly: false },
  { href: "/events", label: "Eventos", adminOnly: false },
  { href: "/members", label: "Membros", adminOnly: true },
];

export default function Sidebar({ userRole = "colaborador", isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = userRole === "admin";

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "finance_manager":
        return "Gestor Financeiro";
      case "member":
      default:
        return "Voluntário";
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    localStorage.removeItem("selectedOngId");
    if (onClose) onClose();
    router.push("/");
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] min-w-[220px] h-screen bg-[var(--surface)] border-r border-[var(--surface-border)] flex flex-col px-3 py-4 gap-0.5 overflow-y-auto transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-2 pb-4 mb-2 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-2">
            {/* Símbolo da logo: recorte da parte esquerda de Logo.png, em fundo branco para ler bem nos dois temas */}
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
              <div className="w-[30px] h-[30px] overflow-hidden">
                <Image
                  src={Logo}
                  alt="Logo ONG Manager"
                  priority
                  className="h-[30px] w-auto max-w-none"
                />
              </div>
            </div>
            <span className="text-[18px] font-semibold text-[var(--accent)] tracking-tight">
              ONG Manager
            </span>
          </div>

          {/* Botão fechar no mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--surface-hover)] text-[var(--icon)] cursor-pointer"
              aria-label="Fechar menu"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Role badge */}
        <div className="px-2 mb-3">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isAdmin
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "bg-[var(--surface-hover)] text-[var(--muted)]"
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
              onClick={onClose}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors
                ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--surdfa)] font-medium"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                }`}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Rodapé */}
        <div className="mt-auto pt-3 border-t border-[var(--surface-border)] flex flex-col gap-0.5">
          <Link
            href="/OngSelector"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
          >
            Trocar ONG
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[var(--muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] transition-colors w-full text-left cursor-pointer"
          >
            Sair
          </button>

          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
          >
            Perfil
          </Link>
        </div>
      </aside>
    </>
  );
}
