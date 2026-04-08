"use client";

import { useEffect, useState } from "react";
import { getMeApi } from "../services/authService";
import { getOngApi } from "../services/ongService";

export default function Header() {
  const [userName, setUserName] = useState("Usuário");
  const [userRole, setUserRole] = useState("colaborador");
  const [userInitials, setUserInitials] = useState("US");

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

  return (
    <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between w-full">
      {/* Esquerda */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[15px] font-semibold text-purple-700 tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-700 opacity-40" />
          Painel Executivo
        </h1>
        <span className="text-xs text-gray-400 font-normal">
          Bem-vindo de volta, {userName}
        </span>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button className="relative w-[34px] h-[34px] rounded-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <svg
            className="w-4 h-4 text-gray-500"
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

        <div className="w-px h-6 bg-gray-100" />

        {/* Perfil */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-medium text-gray-800">
              {userName}
            </span>
            <span className="text-[11px] text-gray-400">
              {userRole === "admin" ? "Administrador" : "Voluntário"}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-[11px] font-semibold text-purple-800 cursor-pointer hover:opacity-80 transition-opacity">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
