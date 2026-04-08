"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOngApi } from "@/src/services/ongService";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando...</p>
      </div>
    );
  }

  const isAdmin = ong?.userRole === "admin";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao {ong?.name}</p>
      </div>

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
              <h2 className="text-xl font-semibold ml-3">Tarefas</h2>
            </div>
            <p className="text-gray-600">
              Gerencie tarefas da sua ONG com quadro Kanban.
              {isAdmin
                ? " Crie e atribua tarefas para voluntários."
                : " Atualize o status das suas tarefas."}
            </p>
          </div>
        </Link>

        {/* Card Voluntários - só para admin */}
        {isAdmin && (
          <Link href="/members" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-600">
              <div className="flex items-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
                <h2 className="text-xl font-semibold ml-3">Voluntários</h2>
              </div>
              <p className="text-gray-600">
                Gerencie os voluntários da sua ONG. Cadastre novos membros.
              </p>
            </div>
          </Link>
        )}

        {/* Placeholder relatórios */}
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
    </div>
  );
}
