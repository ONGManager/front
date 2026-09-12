"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOngApi, getDashboardStatsApi, DashboardStats } from "@/src/services/ongService";
import { toast } from "sonner";
import Grafico1 from "@/src/components/Grafico1";

interface OngInfo {
  id: string;
  name: string;
  description?: string;
  userRole: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [ong, setOng] = useState<OngInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ongId = localStorage.getItem("selectedOngId");
    if (!ongId) {
      router.push("/OngSelector");
      return;
    }

    async function loadData() {
      try {
        const [ongData, statsData] = await Promise.all([
          getOngApi(ongId!),
          getDashboardStatsApi(ongId!).catch(() => null),
        ]);
        setOng(ongData);
        setStats(statsData);
      } catch (err) {
        toast.error("Erro ao carregar dados do dashboard");
        router.push("/OngSelector");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-3">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-[var(--muted)]">Carregando métricas da ONG...</p>
      </div>
    );
  }

  const isAdmin = ong?.userRole === "admin";
  const isFinanceManager = ong?.userRole === "finance_manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Visão geral e indicadores de <strong className="text-[var(--text)]">{ong?.name}</strong>
          </p>
        </div>
      </div>

      {/* Cards de Métricas em Destaque (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Membros */}
        <div className="bg-[var(--surface)] border border-[var(--card-border)] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
              Membros Ativos
            </span>
            <p className="text-2xl font-bold text-[var(--text)] mt-1">
              {stats?.totalMembers ?? 0}
            </p>
            <span className="text-[11px] text-[var(--muted)] mt-0.5 block">
              Voluntários e admins
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Tarefas Concluídas */}
        <div className="bg-[var(--surface)] border border-[var(--card-border)] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
              Tarefas Concluídas
            </span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {stats?.completedTasks ?? 0}
            </p>
            <span className="text-[11px] text-[var(--muted)] mt-0.5 block">
              de {stats?.totalTasks ?? 0} atividades totais
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Saldo Financeiro */}
        <div className="bg-[var(--surface)] border border-[var(--card-border)] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
              Saldo em Caixa
            </span>
            <p className={`text-2xl font-bold mt-1 ${
              (stats?.financial.balance ?? 0) < 0 ? "text-red-600" : "text-emerald-600"
            }`}>
              {stats ? formatCurrency(stats.financial.balance) : "R$ 0,00"}
            </p>
            <span className="text-[11px] text-[var(--muted)] mt-0.5 block">
              {stats?.financial.totalTransactions ?? 0} lançamentos
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Eventos Ativos */}
        <div className="bg-[var(--surface)] border border-[var(--card-border)] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
              Eventos Ativos
            </span>
            <p className="text-2xl font-bold text-[var(--text)] mt-1">
              {stats?.activeEvents ?? 0}
            </p>
            <span className="text-[11px] text-[var(--muted)] mt-0.5 block">
              Com inscrições abertas
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Acessos Rápidos aos Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Kanban */}
        <Link href="/kanban" className="block group">
          <div className="bg-[var(--surface)] rounded-xl shadow-xs border border-[var(--card-border)] p-6 hover:border-purple-500 transition-all cursor-pointer h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[var(--text)] group-hover:text-purple-600 transition-colors">
                  Quadro de Tarefas
                </h2>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Acompanhe o fluxo de trabalho da ONG em colunas Kanban, atribua prazos e voluntários responsáveis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center justify-between text-xs text-purple-600 font-semibold">
              <span>Acessar Kanban</span>
              <span>→</span>
            </div>
          </div>
        </Link>

        {/* Card Financeiro */}
        <Link href="/bill" className="block group">
          <div className="bg-[var(--surface)] rounded-xl shadow-xs border border-[var(--card-border)] p-6 hover:border-emerald-500 transition-all cursor-pointer h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[var(--text)] group-hover:text-emerald-600 transition-colors">
                  Gestão Financeira
                </h2>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Controle receitas, despesas, saldos e exporte relatórios consolidados em planilhas CSV e documentos PDF.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span>Acessar Financeiro</span>
              <span>→</span>
            </div>
          </div>
        </Link>

        {/* Card Membros (Admin) ou Eventos */}
        {isAdmin ? (
          <Link href="/members" className="block group">
            <div className="bg-[var(--surface)] rounded-xl shadow-xs border border-[var(--card-border)] p-6 hover:border-blue-500 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text)] group-hover:text-blue-600 transition-colors">
                    Gestão de Membros
                  </h2>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Gere links de convite públicos, altere cargos (gestor financeiro, voluntário) e gerencie permissões da equipe.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>Gerenciar Equipe</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/events" className="block group">
            <div className="bg-[var(--surface)] rounded-xl shadow-xs border border-[var(--card-border)] p-6 hover:border-amber-500 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text)] group-hover:text-amber-600 transition-colors">
                    Eventos da ONG
                  </h2>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Consulte os eventos em andamento, inscrições de convidados e ingressos emitidos.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center justify-between text-xs text-amber-600 font-semibold">
                <span>Ver Eventos</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Gráfico Financeiro */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] p-6 shadow-xs overflow-x-auto">
        <div className="min-w-[500px] md:min-w-0">
          <Grafico1 ongId={ong?.id ?? ""} />
        </div>
      </div>
    </div>
  );
}
