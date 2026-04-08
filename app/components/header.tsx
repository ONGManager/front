'use client';

import Notificacao from "../assets/notifications.svg";
import ModoClaro from "../assets/modo_claro.svg";
import ModoEscuro from "../assets/modo_escuro.svg";
import { useState } from "react";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between w-full">

      {/* Esquerda */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[15px] font-semibold text-purple-700 tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-700 opacity-40" />
          Painel Executivo
        </h1>
        <span className="text-xs text-gray-400 font-normal">
          Bem-vindo de volta, User
        </span>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-3">

        {/* Notificações */}
        <button className="relative w-[34px] h-[34px] rounded-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <img src={Notificacao} alt="Notificações" className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-600 border-2 border-white" />
        </button>

        {/* Alternar tema
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-[34px] h-[34px] rounded-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <img
            src={darkMode ? ModoEscuro : ModoClaro}
            alt="Alternar tema"
            className="w-4 h-4"
          />
        </button> */}

        <div className="w-px h-6 bg-gray-100" />

        {/* Perfil */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-medium text-gray-800">User</span>
            <span className="text-[11px] text-gray-400">Administrador</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-[11px] font-semibold text-purple-800 cursor-pointer hover:opacity-80 transition-opacity">
            US
          </div>
        </div>

      </div>
    </header>
  )
}