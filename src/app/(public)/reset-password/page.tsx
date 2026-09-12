"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, CircularProgress } from "@mui/material";
import { toast } from "sonner";
import LoginPadrao from "../../../components/Login";
import { resetPasswordApi } from "../../../services/authService";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen align-middle flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <LoginPadrao
            Titulo="Link Inválido"
            Subtitulo="Não foi possível identificar o token de recuperação."
          />
          <div className="flex flex-col items-center justify-center mt-6 mb-4 mx-auto w-full h-auto bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 md:p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)]">
              Token de recuperação ausente
            </h3>
            <p className="text-sm text-[var(--muted)]">
              O link de redefinição pode ter sido copiado incompleto ou está inválido. Por favor, solicite um novo link.
            </p>
            <div className="w-full pt-2">
              <Link href="/forgot-password" className="block w-full">
                <Button
                  variant="contained"
                  className="w-full h-11 bg-purple-600! hover:bg-purple-700! text-white"
                >
                  Solicitar novo link
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas informadas não conferem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPasswordApi(token, newPassword);
      toast.success(response.message || "Senha redefinida com sucesso!");
      router.push("/");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao redefinir a senha. O link pode ter expirado."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen align-middle flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        <LoginPadrao
          Titulo="Redefinir Senha"
          Subtitulo="Crie uma nova senha segura para acessar sua conta."
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center mt-6 mb-4 mx-auto w-full h-auto bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 md:p-8"
        >
          <div className="w-full space-y-4">
            {/* Nova Senha */}
            <div>
              <label className="block text-start text-[var(--text)] text-sm font-medium mb-1.5">
                Nova Senha
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[var(--input)] border-2 border-[var(--input-border)] text-[var(--text)] rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-0.72 1.62-1.83 3.06-3.2 4.2" />
                      <path d="M6.1 6.1C4.05 7.44 2.48 9.5 1 12c1.73 3.89 6 7 11 7 1.14 0 2.25-0.16 3.3-0.45" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-start text-[var(--text)] text-sm font-medium mb-1.5">
                Confirmar Nova Senha
              </label>
              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[var(--input)] border-2 border-[var(--input-border)] text-[var(--text)] rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-0.72 1.62-1.83 3.06-3.2 4.2" />
                      <path d="M6.1 6.1C4.05 7.44 2.48 9.5 1 12c1.73 3.89 6 7 11 7 1.14 0 2.25-0.16 3.3-0.45" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-purple-600! hover:bg-purple-700! text-white font-medium cursor-pointer shadow-md disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <CircularProgress size={18} color="inherit" />
                    Redefinindo senha...
                  </span>
                ) : (
                  "Salvar Nova Senha"
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          <p className="SubTitulo mb-0!">Lembrou sua senha antiga?</p>
          <Link
            href="/"
            className="text-base text-[var(--accent)] font-bold hover:opacity-80 transition-opacity"
          >
            Entrar na conta
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CircularProgress color="primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
