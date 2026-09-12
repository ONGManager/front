"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPadrao from "../../../components/Login";
import Button from "@mui/material/Button";
import { getMyOngsApi, createOngApi } from "../../../services/ongService";
import { toast } from "sonner";
import { aplicarMascaraCNPJ } from "@/schema";

interface Ong {
  id: string;
  name: string;
  description?: string;
  role: string;
}

export default function OngSelector() {
  const router = useRouter();
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [selectedOng, setSelectedOng] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal de Criação de ONG
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [nomeOng, setNomeOng] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [descricao, setDescricao] = useState("");

  const fetchOngs = async () => {
    try {
      setLoading(true);
      const data = await getMyOngsApi();
      setOngs(data);
      if (data.length === 1) {
        setSelectedOng(data[0].id);
      }
    } catch {
      toast.error("Erro ao carregar ONGs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngs();
  }, []);

  const handleEnter = () => {
    if (!selectedOng) {
      toast.error("Selecione uma ONG");
      return;
    }
    localStorage.setItem("selectedOngId", selectedOng);
    router.push("/dashboard");
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 14) {
      setCnpj(aplicarMascaraCNPJ(raw));
    }
  };

  const handleCreateOng = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeOng.trim()) {
      toast.error("O nome da ONG é obrigatório");
      return;
    }

    try {
      setCreateLoading(true);
      const cleanCnpj = cnpj.replace(/\D/g, "");
      const newOng = await createOngApi(
        nomeOng.trim(),
        descricao.trim() || undefined,
        cleanCnpj || undefined
      );

      toast.success(`ONG "${newOng.name}" criada com sucesso!`);
      localStorage.setItem("selectedOngId", newOng.id);
      setIsModalOpen(false);
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar ONG");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)] font-medium animate-pulse">Carregando suas organizações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen align-middle flex flex-col justify-center items-center px-4 py-8 relative">
      <div className="w-full max-w-[420px]">
        <LoginPadrao
          Titulo="Escolha a sua ONG"
          Subtitulo="Selecione qual você quer gerenciar ou crie uma nova!"
        />

        <div className="flex flex-col items-center justify-center mt-4 mb-4 mx-auto w-full min-h-[200px] bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 md:p-8">
          {ongs.length === 0 ? (
            <div className="text-center w-full">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-[var(--text)] font-semibold mb-1">Nenhuma ONG vinculada</p>
              <p className="text-[var(--muted)] mb-5 text-sm">
                Você ainda não faz parte de nenhuma ONG. Crie sua primeira organização agora mesmo!
              </p>
              <Button
                variant="contained"
                onClick={() => setIsModalOpen(true)}
                className="w-full h-11 bg-purple-600! hover:bg-purple-700! text-white font-bold cursor-pointer shadow-lg shadow-purple-600/30"
              >
                + Criar minha ONG
              </Button>
            </div>
          ) : (
            <>
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text)] text-sm font-medium">
                    Selecione a ONG
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {ongs.length} {ongs.length === 1 ? "disponível" : "disponíveis"}
                  </span>
                </div>
                <select
                  value={selectedOng}
                  onChange={(e) => setSelectedOng(e.target.value)}
                  className="w-full h-11 bg-[var(--input)] border-2 border-[var(--input-border)] text-[var(--text)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 mb-5 cursor-pointer text-sm font-medium transition"
                >
                  <option value="">-- Selecione uma organização --</option>
                  {ongs.map((ong) => (
                    <option key={ong.id} value={ong.id}>
                      {ong.name} ({ong.role === "admin" ? "Administrador" : ong.role === "finance_manager" ? "Gestor Financeiro" : "Voluntário"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full space-y-3">
                <Button
                  variant="contained"
                  onClick={handleEnter}
                  disabled={!selectedOng}
                  className="w-full h-11 bg-purple-600! hover:bg-purple-700! text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition"
                >
                  Acessar Painel
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-10 border-dashed border-2 border-purple-400! text-purple-700! hover:bg-purple-50! dark:hover:bg-purple-950/30 font-semibold cursor-pointer text-sm transition"
                >
                  + Cadastrar Nova ONG
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Criação de ONG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl w-full max-w-[480px] p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-[var(--text)]">Criar Nova ONG</h3>
                <p className="text-sm text-[var(--muted)]">Cadastre uma nova organização sob sua administração.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOng} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-1">
                  Nome da ONG <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Associação Esperança Viva"
                  value={nomeOng}
                  onChange={(e) => setNomeOng(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-1">
                  CNPJ <span className="text-xs font-normal text-[var(--muted)]">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={handleCnpjChange}
                  maxLength={18}
                  className="w-full h-10 px-3 rounded-lg bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-1">
                  Descrição ou Missão <span className="text-xs font-normal text-[var(--muted)]">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Breve descrição dos objetivos da organização..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createLoading}
                  className="flex-1 h-10 border-gray-300! text-[var(--text)]! hover:bg-gray-100! font-medium cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createLoading || !nomeOng.trim()}
                  className="flex-1 h-10 bg-purple-600! hover:bg-purple-700! text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {createLoading ? "Criando..." : "Criar ONG"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
