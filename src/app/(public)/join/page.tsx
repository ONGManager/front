"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { toast } from "sonner";
import { getInviteDetailsApi, acceptInviteApi } from "@/src/services/ongService";
import { getMeApi } from "@/src/services/authService";

interface InviteData {
  ong: {
    id: string;
    name: string;
    description?: string;
  };
  token: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMessage("Link de convite inválido ou ausente.");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [invite, user] = await Promise.all([
          getInviteDetailsApi(token!),
          getMeApi(),
        ]);
        setInviteData(invite);
        if (user?.id) {
          setCurrentUser(user);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Não foi possível validar este link de convite.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!token) return;

    setAccepting(true);
    try {
      const res = await acceptInviteApi(token);
      toast.success(res.message || "Convite aceito com sucesso!");
      localStorage.setItem("selectedOngId", res.ongId);
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao aceitar convite",
      );
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-4">
        <div className="flex flex-col items-center gap-3">
          <CircularProgress size={36} sx={{ color: "var(--accent)" }} />
          <p className="text-sm text-[var(--muted)]">Verificando convite...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !inviteData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-4">
        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-xl p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">Convite Inválido</h1>
            <p className="text-sm text-[var(--muted)] mt-2">
              {errorMessage || "O link acessado é inválido ou expirou."}
            </p>
          </div>
          <Button
            variant="contained"
            onClick={() => router.push("/")}
            className="w-full bg-purple-600! hover:bg-purple-700! text-white normal-case font-semibold py-2.5 rounded-lg"
          >
            Ir para a Página Inicial
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Banner superior com gradiente */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-8 py-8 text-white text-center relative">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-medium mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Convite Oficial</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Você foi convidado!
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            Faça parte da equipe e colabore com causas que impactam o mundo.
          </p>
        </div>

        {/* Detalhes da ONG e Ações */}
        <div className="p-8 space-y-6">
          <div className="bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-lg mx-auto mb-3 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              {inviteData.ong.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              {inviteData.ong.name}
            </h2>
            {inviteData.ong.description ? (
              <p className="text-xs text-[var(--muted)] mt-1 max-w-md mx-auto line-clamp-3">
                {inviteData.ong.description}
              </p>
            ) : (
              <p className="text-xs text-[var(--muted)] mt-1">
                Organização sem fins lucrativos
              </p>
            )}
            <div className="mt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800">
                Função: Voluntário
              </span>
            </div>
          </div>

          {currentUser ? (
            <div className="space-y-4">
              <div className="text-center text-xs text-[var(--muted)]">
                Conectado como <strong className="text-[var(--text)]">{currentUser.name}</strong> ({currentUser.email})
              </div>
              <Button
                variant="contained"
                onClick={handleAcceptInvite}
                disabled={accepting}
                className="w-full bg-purple-600! hover:bg-purple-700! text-white normal-case font-semibold py-3 rounded-lg shadow-md transition-all text-sm"
              >
                {accepting ? (
                  <div className="flex items-center justify-center gap-2">
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                    <span>Aceitando convite...</span>
                  </div>
                ) : (
                  "Aceitar Convite e Entrar na ONG"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-center text-[var(--muted)]">
                Para aceitar o convite, faça login com sua conta existente ou crie uma conta gratuita.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="contained"
                  onClick={() => router.push(`/?redirect=${encodeURIComponent(`/join?token=${token}`)}`)}
                  className="flex-1 bg-purple-600! hover:bg-purple-700! text-white normal-case font-semibold py-2.5 rounded-lg"
                >
                  Fazer Login
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push(`/register?redirect=${encodeURIComponent(`/join?token=${token}`)}`)}
                  className="flex-1 border-purple-600! text-purple-600! hover:bg-purple-50! dark:hover:bg-purple-950/30! normal-case font-semibold py-2.5 rounded-lg"
                >
                  Criar Conta
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
          <CircularProgress size={36} sx={{ color: "var(--accent)" }} />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
