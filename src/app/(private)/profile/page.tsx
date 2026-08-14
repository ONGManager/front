"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getMeApi, updateProfileApi } from "@/src/services/authService";
import { getOngApi } from "@/src/services/ongService";
import LoadingScreen from "@/src/components/LoadingScreen";
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
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      try {
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
          const ongData = await getOngApi(selectedOngId);
          setFormData((prev) => ({
            ...prev,
            ongName: ongData.name || "",
            cnpj: ongData.description || "",
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar perfil", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        role: user.role,
        oldPassword: "",
        newPassword: "",
      }));
      setStatusMessage(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const payload: {
        name?: string;
        email?: string;
        oldPassword?: string;
        newPassword?: string;
      } = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.oldPassword && formData.newPassword) {
        payload.oldPassword = formData.oldPassword;
        payload.newPassword = formData.newPassword;
      }

      const updatedUser = await updateProfileApi(payload);
      setUser(updatedUser);
      setStatusMessage("Perfil atualizado com sucesso.");
      setFormData((prev) => ({
        ...prev,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        oldPassword: "",
        newPassword: "",
      }));
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao salvar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen text="Carregando perfil..." />;
  }

  return (
    <div className="p-1 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Perfil do Usuário</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Atualize seus dados pessoais e senha em um só lugar.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-[var(--accent-soft)] px-4 py-2 rounded-lg text-[var(--accent)] hover:bg-[var(--surface-hover)] cursor-pointer text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
              saving
                ? "bg-[var(--accent-muted)] cursor-not-allowed"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] cursor-pointer"
            }`}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)]">
          {statusMessage}
        </div>
      ) : null}

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
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Senha Atual</span>
                  <input
                    type="password"
                    value={formData.oldPassword}
                    onChange={(e) => handleFormChange("oldPassword", e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Nova Senha</span>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleFormChange("newPassword", e.target.value)}
                    placeholder="Digite a nova senha"
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
