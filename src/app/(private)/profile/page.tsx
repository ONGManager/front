"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getMeApi } from "@/src/services/authService";
import { getOngApi } from "@/src/services/ongService";
import editProfileIcon from "../../../assets/editprofile.svg";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    ongName: "",
    cnpj: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const loadedUser = await getMeApi();
      if (loadedUser) {
        setUser(loadedUser);
        setFormData((prev) => ({
          ...prev,
          name: loadedUser.name || "",
          email: loadedUser.email || "",
          role: loadedUser.role || "",
        }));
      }

      const selectedOngId = localStorage.getItem("selectedOngId");
      if (selectedOngId) {
        try {
          const ongData = await getOngApi(selectedOngId);
          setFormData((prev) => ({
            ...prev,
            ongName: ongData.name || "",
            cnpj: ongData.description || "",
          }));
        } catch (err) {
          console.error("Erro ao carregar ONG", err);
        }
      }
    }

    loadProfile();
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-1 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Perfil do Usuário</h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-[var(--accent-soft)] px-4 py-2 rounded-lg text-[var(--accent)] hover:bg-[var(--surface-hover)] cursor-pointer text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button
            className="bg-[var(--accent)] px-4 py-2 rounded-lg text-white opacity-60 cursor-not-allowed text-sm font-medium"
            disabled
          >
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-[var(--muted)]">
        Obs: edição de perfil ainda depende de endpoint de atualização no backend.
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        <div className="flex-1 bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-lg p-6">
          <div className="flex items-center gap-3 pb-6 border-b border-[var(--surface-border)] mb-6">
            <Image src={editProfileIcon} alt="Editar Perfil" width={28} height={28} />
            <h2 className="text-[var(--text)] font-bold text-xl md:text-2xl">Dados Pessoais</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="hidden md:flex bg-[var(--bg)] border-2 border-[var(--surface-border)] rounded-md w-36 h-36 shrink-0 items-center justify-center text-[var(--muted)]">
              <svg className="w-12 h-12 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Nome Completo</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Email</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Telefone</span>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Cargo</span>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleFormChange("role", e.target.value)}
                    className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Link de Convite</span>
                  <input
                    type="url"
                    className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                    placeholder="Em breve"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-lg p-6 lg:w-[400px] shrink-0 h-fit">
          <div className="pb-6 border-b border-[var(--surface-border)] mb-6">
            <h2 className="text-[var(--text)] font-bold text-xl md:text-2xl">Instituição</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-sm font-medium text-[var(--text)] block mb-1">Nome da ONG</span>
              <input
                type="text"
                value={formData.ongName}
                onChange={(e) => handleFormChange("ongName", e.target.value)}
                className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--text)] block mb-1">CNPJ</span>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => handleFormChange("cnpj", e.target.value)}
                className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
