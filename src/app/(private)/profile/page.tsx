"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getMeApi, updateProfileApi } from "@/src/services/authService";
import { getOngApi } from "@/src/services/ongService";
import LoadingScreen from "@/src/components/LoadingScreen";
import editProfileIcon from "../../../assets/editprofile.svg";
import { toast } from "sonner";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
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
            phone: loadedUser.phone || "",
            role: loadedUser.role || "",
          }));
        }

        const selectedOngId = localStorage.getItem("selectedOngId");
        if (selectedOngId) {
          const ongData = await getOngApi(selectedOngId);
          setFormData((prev) => ({
            ...prev,
            ongName: ongData.name || "",
            cnpj: ongData.cnpj || "",
            role: ongData.userRole || loadedUser?.role || "",
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

  const formatPhone = (val: string) => {
    const numbers = val.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
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
        phone?: string;
        oldPassword?: string;
        newPassword?: string;
      } = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
      };

      if (formData.oldPassword && formData.newPassword) {
        payload.oldPassword = formData.oldPassword;
        payload.newPassword = formData.newPassword;
      }

      const updatedUser = await updateProfileApi(payload);
      setUser(updatedUser);
      toast.success("Perfil atualizado com sucesso!");
      setStatusMessage("Perfil atualizado com sucesso.");
      setFormData((prev) => ({
        ...prev,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        role: updatedUser.role,
        oldPassword: "",
        newPassword: "",
      }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar o perfil.";
      toast.error(msg);
      setStatusMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "finance_manager":
        return "Gestor Financeiro";
      case "member":
      case "colaborador":
        return "Voluntário";
      default:
        return role || "Membro";
    }
  };

  if (loading) {
    return <LoadingScreen text="Carregando perfil..." />;
  }

  return (
    <div className="p-1 md:p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Perfil do Usuário</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Atualize seus dados pessoais, contato e senha em um só lugar.
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
                : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
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
        <div className="flex-1 bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-6 border-b border-[var(--surface-border)] mb-6">
            <Image src={editProfileIcon} alt="Editar Perfil" width={28} height={28} />
            <h2 className="text-[var(--text)] font-bold text-xl md:text-2xl">Dados Pessoais</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="hidden md:flex bg-[var(--bg)] border-2 border-[var(--surface-border)] rounded-xl w-36 h-36 shrink-0 items-center justify-center text-purple-600 font-bold text-3xl">
              {formData.name
                ? formData.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U"}
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
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Telefone / WhatsApp</span>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium text-[var(--text)] block mb-1">Cargo na ONG</span>
                  <input
                    type="text"
                    value={getRoleLabel(formData.role)}
                    readOnly
                    disabled
                    className="w-full max-w-[384px] h-10 bg-[var(--surface-hover)] text-[var(--muted)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 cursor-not-allowed opacity-80"
                  />
                </div>
                <div className="pt-2 border-t border-[var(--surface-border)]">
                  <span className="text-sm font-semibold text-[var(--text)] block mb-2">Alterar Senha</span>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[var(--muted)] block mb-1">Senha Atual</span>
                      <input
                        type="password"
                        value={formData.oldPassword}
                        onChange={(e) => handleFormChange("oldPassword", e.target.value)}
                        placeholder="Digite sua senha atual"
                        className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--muted)] block mb-1">Nova Senha</span>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleFormChange("newPassword", e.target.value)}
                        placeholder="Digite a nova senha"
                        className="w-full max-w-[384px] h-10 bg-[var(--input)] text-[var(--text)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-xl p-6 lg:w-[400px] shrink-0 h-fit shadow-xs">
          <div className="pb-6 border-b border-[var(--surface-border)] mb-6">
            <h2 className="text-[var(--text)] font-bold text-xl md:text-2xl">Instituição</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-sm font-medium text-[var(--text)] block mb-1">Nome da ONG</span>
              <input
                type="text"
                value={formData.ongName}
                readOnly
                disabled
                className="w-full max-w-[384px] h-10 bg-[var(--surface-hover)] text-[var(--muted)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 cursor-not-allowed opacity-80"
              />
            </div>
            <div>
              <span className="text-sm font-medium text-[var(--text)] block mb-1">CNPJ da ONG</span>
              <input
                type="text"
                value={formData.cnpj}
                readOnly
                disabled
                className="w-full max-w-[384px] h-10 bg-[var(--surface-hover)] text-[var(--muted)] rounded-md border-2 border-[var(--surface-border)] px-3 py-2 cursor-not-allowed opacity-80"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
