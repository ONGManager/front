"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeApi, logoutApi } from "../services/authService";
import { getOngApi } from "../services/ongService";

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  const router = useRouter();
  const [userName, setUserName] = useState("Usuário");
  const [userRole, setUserRole] = useState("colaborador");
  const [userInitials, setUserInitials] = useState("US");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getMeApi();
        if (user) {
          setUserName(user.name);
          const initials = user.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          setUserInitials(initials || "US");
        }

        const ongId = localStorage.getItem("selectedOngId");
        if (ongId) {
          const ong = await getOngApi(ongId);
          setUserRole(ong.userRole);
        }
      } catch (err) {
        console.error("Erro ao carregar usuário", err);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      return;
    }

    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = prefersDark ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Erro ao sair", error);
    }
    localStorage.removeItem("selectedOngId");
    router.push("/");
  };

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--surface-border)] px-4 md:px-6 h-16 flex items-center justify-between w-full shrink-0">
      {/* Esquerda */}
      <div className="flex items-center gap-3">
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden w-8 h-8 rounded-lg border border-[var(--surface-border)] flex items-center justify-center text-[var(--icon)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            aria-label="Abrir menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[14px] md:text-[15px] font-semibold text-[var(--accent)] tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-40" />
            Painel Executivo
          </h1>
          <span className="text-[10px] md:text-xs text-[var(--muted)] font-normal truncate max-w-[150px] md:max-w-none">
            Bem-vindo, {userName}
          </span>
        </div>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notificações */}
        <button className="relative w-[34px] h-[34px] rounded-lg border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors cursor-pointer">
          <svg
            className="w-4 h-4 text-[var(--icon)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* Tema */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="relative w-[34px] h-[34px] rounded-lg border border-[var(--surface-border)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <svg
              className="w-4 h-4 text-[var(--icon)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1.5m0 15V21m9-9h-1.5M4.5 12H3m14.95-7.95l-1.06 1.06M6.11 17.89l-1.06 1.06m12.02 0-1.06-1.06M6.11 6.11L5.05 5.05M12 7a5 5 0 100 10 5 5 0 000-10z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-[var(--icon)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
              />
            </svg>
          )}
        </button>

        <div className="w-px h-6 bg-[var(--divider)]" />

        {/* Perfil */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[13px] font-medium text-[var(--text)] max-w-[120px] truncate">
              {userName}
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              {userRole === "admin" ? "Administrador" : "Voluntário"}
            </span>
          </div>
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu((current) => !current)}
              className="w-8 h-8 rounded-full bg-[var(--accent-soft)] border-2 border-[var(--accent-border)] flex items-center justify-center text-[11px] font-semibold text-[var(--accent)] cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="Abrir menu do perfil"
            >
              {userInitials}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 min-w-[180px] bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl shadow-xl overflow-hidden z-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left px-4 py-3 text-[var(--text)] hover:bg-[var(--surface-hover)]"
                >
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/OngSelector");
                  }}
                  className="w-full text-left px-4 py-3 text-[var(--text)] hover:bg-[var(--surface-hover)]"
                >
                  Trocar ONG
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
