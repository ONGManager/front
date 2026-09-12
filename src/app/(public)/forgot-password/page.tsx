"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, CircularProgress } from "@mui/material";
import { toast } from "sonner";
import LoginPadrao from "../../../components/Login";
import { forgotPasswordApi } from "../../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      toast.error("Por favor, informe um endereço de e-mail válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPasswordApi(email.trim());
      toast.success(response.message || "Link de recuperação enviado com sucesso!");
      setIsSubmitted(true);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao solicitar recuperação de senha. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen align-middle flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        <LoginPadrao
          Titulo="Esqueceu sua senha?"
          Subtitulo={
            isSubmitted
              ? "Verifique sua caixa de entrada e siga as instruções enviadas."
              : "Sem problemas. Informe o e-mail cadastrado e enviaremos as instruções para redefinir sua senha."
          }
        />

        <div className="flex flex-col items-center justify-center mt-6 mb-4 mx-auto w-full h-auto bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 md:p-8">
          {isSubmitted ? (
            <div className="w-full text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">
                E-mail enviado!
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Se o e-mail <strong className="text-[var(--text)]">{email}</strong> estiver cadastrado na plataforma, você receberá um link com validade de 1 hora para cadastrar uma nova senha.
              </p>
              <div className="pt-2">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="w-full border-purple-600! text-purple-600! hover:bg-purple-50! dark:hover:bg-purple-950/30"
                >
                  Tentar com outro e-mail
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full">
              <div className="w-full">
                <label className="block text-start text-[var(--text)] text-sm font-medium mb-1.5">
                  E-mail cadastrado
                </label>
                <div className="flex flex-col my-1 mb-6 w-full">
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full h-11 bg-[var(--input)] border-2 border-[var(--input-border)] text-[var(--text)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition-colors text-sm"
                  />
                </div>
              </div>

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
                    Enviando link...
                  </span>
                ) : (
                  "Enviar link de Recuperação"
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          <p className="SubTitulo mb-0!">Lembrou sua senha?</p>
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
