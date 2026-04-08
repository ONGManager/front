"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@mui/material/Button";
import { getOngApi, logoutApi } from "../lib/api";
import { toast } from "sonner";

interface OngInfo {
  id: string;
  name: string;
  description?: string;
  userRole: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [ong, setOng] = useState<OngInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ongId = localStorage.getItem("selectedOngId");
    if (!ongId) {
      router.push("/OngSelector");
      return;
    }

    async function loadOng() {
      try {
        const data = await getOngApi(ongId!);
        setOng(data);
      } catch (err) {
        toast.error("Erro ao carregar ONG");
        router.push("/OngSelector");
      } finally {
        setLoading(false);
      }
    }
    loadOng();
  }, [router]);

  const handleLogout = async () => {
    await logoutApi();
    localStorage.removeItem("selectedOngId");
    router.push("/");
  };

  const handleChangeOng = () => {
    localStorage.removeItem("selectedOngId");
    router.push("/OngSelector");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-purple-600">{ong?.name}</h1>
            <p className="text-sm text-gray-500">
              Você é{" "}
              {ong?.userRole === "admin" ? "Administrador" : "Colaborador"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outlined" onClick={handleChangeOng}>
              Trocar ONG
            </Button>
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Kanban */}
          <Link href="/kanban" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-purple-600">
              <div className="flex items-center mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h2 className="text-xl font-semibold ml-3">Kanban</h2>
              </div>
              <p className="text-gray-600">
                Gerencie tarefas da sua ONG com quadro Kanban.
                {ong?.userRole === "admin"
                  ? " Crie e atribua tarefas para colaboradores."
                  : " Atualize o status das suas tarefas."}
              </p>
            </div>
          </Link>

          {/* Placeholder para outros módulos */}
          <div className="bg-white rounded-lg shadow p-6 opacity-50">
            <div className="flex items-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold ml-3 text-gray-400">
                Voluntários
              </h2>
            </div>
            <p className="text-gray-400">Em breve...</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 opacity-50">
            <div className="flex items-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h2 className="text-xl font-semibold ml-3 text-gray-400">
                Relatórios
              </h2>
            </div>
            <p className="text-gray-400">Em breve...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
