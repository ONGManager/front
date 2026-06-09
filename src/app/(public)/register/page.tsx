"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterOngSchema,
  type RegisterOngFormData,
  aplicarMascaraCNPJ,
} from "@/schema";
import LoginPadrao from "../../../components/Login";
import Button from "@mui/material/Button";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { registerApi } from "../../../services/authService";
import { toast } from "sonner";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<RegisterOngFormData>({
    resolver: zodResolver(RegisterOngSchema),
    mode: "onBlur", // Valida quando sai do campo
  });

  const password: string = watch("password");
  const cnpjValue = watch("cnpj");
  const cnpjRegister = register("cnpj");

  // Bloqueia tentativa de copiar senha (Ctrl+C)
  const handleSenhaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      e.preventDefault();
      alert("Cópia de senhas não é permitida por segurança");
    }
  };

  // Aplica máscara de CNPJ enquanto digita
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const numerosSomente = valor.replace(/\D/g, "");

    if (numerosSomente.length <= 14) {
      const cnpjMascarado =
        numerosSomente.length > 0
          ? aplicarMascaraCNPJ(numerosSomente)
          : numerosSomente;

      setValue("cnpj", cnpjMascarado, { shouldValidate: false });
    }
  };

  const onSubmit = async (data: RegisterOngFormData) => {
    try {
      setIsLoading(true);

      await registerApi(
        data.nomeResponsavel,
        data.email,
        data.password,
        data.nomeOng,
        data.cnpj,
      );

      toast.success("Conta criada com sucesso! Faça login para continuar.");
      window.location.href = "/";
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger(["nomeOng", "cnpj"]);
    if (isValid) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-[420px]">
        <LoginPadrao
          Titulo="Crie sua Conta!"
          Subtitulo="Cadastre sua ONG e comece a gerenciar em minutos"
        />

        <div className="flex flex-col items-center justify-center mt-4 mb-2 mx-auto w-full bg-[var(--surface)] rounded-2xl shadow-2xl p-6">
          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-2">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 1
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface-hover)] text-[var(--muted)]"
                }`}
                initial={false}
                animate={{ scale: step >= 1 ? 1 : 0.95 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
              >
                1
              </motion.div>
              <div className="flex-1 h-1 mx-3 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--accent)]"
                  initial={false}
                  animate={{ width: step === 1 ? "50%" : "100%" }}
                  transition={{ type: "spring", stiffness: 160, damping: 22 }}
                />
              </div>
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 2
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface-hover)] text-[var(--muted)]"
                }`}
                initial={false}
                animate={{ scale: step >= 2 ? 1 : 0.95 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
              >
                2
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)] px-1">
              <span>ONG</span>
              <span>Conta</span>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
          >
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 w-full"
                >
                  {/* Nome da ONG */}
                  <div>
                    <label className="spanLogin block mb-2 text-sm font-medium text-[var(--text)]">Nome da ONG</label>
                    <input
                      type="text"
                      placeholder="Digite o nome da sua ONG"
                      {...register("nomeOng")}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition ${
                        errors.nomeOng
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    {errors.nomeOng && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.nomeOng.message}
                      </span>
                    )}
                  </div>

                  {/* CNPJ com Máscara */}
                  <div>
                    <label className="spanLogin block mb-2 text-sm font-medium text-[var(--text)]">CNPJ</label>
                    <input
                      type="text"
                      placeholder="XX.XXX.XXX/XXXX-XX"
                      {...cnpjRegister}
                      value={cnpjValue || ""}
                      onChange={(e) => {
                        cnpjRegister.onChange(e);
                        handleCNPJChange(e);
                      }}
                      maxLength={18}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition ${
                        errors.cnpj
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    {errors.cnpj && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.cnpj.message}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="contained"
                    color="primary"
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-10 bg-purple-600! hover:bg-purple-700! text-white font-bold mt-4 cursor-pointer"
                  >
                    Continuar
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 w-full"
                >
                  {/* Nome do Responsável */}
                  <div>
                    <label className="spanLogin block mb-2 text-sm font-medium text-[var(--text)]">
                      Nome do Responsável
                    </label>
                    <input
                      type="text"
                      placeholder="Digite o nome completo"
                      {...register("nomeResponsavel")}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition ${
                        errors.nomeResponsavel
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    {errors.nomeResponsavel && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.nomeResponsavel.message}
                      </span>
                    )}
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="spanLogin block mb-2 text-sm font-medium text-[var(--text)]">E-mail</label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      {...register("email")}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition ${
                        errors.email
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  {/* Senha com Proteção Ctrl+C */}
                  <div className="relative w-full">
                    <label className="spanLogin block mb-2 text-sm font-medium text-[var(--text)]">Senha</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      {...register("password")}
                      onKeyDown={handleSenhaKeyDown}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition ${
                        errors.password
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-[38px] text-[var(--muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                          <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-0.72 1.62-1.83 3.06-3.2 4.2" />
                          <path d="M6.1 6.1C4.05 7.44 2.48 9.5 1 12c1.73 3.89 6 7 11 7 1.14 0 2.25-0.16 3.3-0.45" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                    {errors.password && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  {/* Confirmar Senha */}
                  <div className="relative w-full">
                    <label className="spanLogin block mb-2 text-sm font-medium text-[var(--text)]">
                      Confirmar Senha
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita sua senha"
                      {...register("confirmPassword")}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-md pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] transition ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-[38px] text-[var(--muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                      aria-label={
                        showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                          <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7-0.72 1.62-1.83 3.06-3.2 4.2" />
                          <path d="M6.1 6.1C4.05 7.44 2.48 9.5 1 12c1.73 3.89 6 7 11 7 1.14 0 2.25-0.16 3.3-0.45" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 mt-2">
                    <Button
                      variant="outlined"
                      color="primary"
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/2 h-10 border-purple-600! text-purple-700! hover:bg-purple-100! font-bold cursor-pointer"
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isLoading}
                      className="w-1/2 h-10 bg-purple-600! hover:bg-purple-700! text-white font-bold cursor-pointer"
                    >
                      {isLoading ? "Criando..." : "Criar Conta"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 mt-4">
          <p className="SubTitulo mb-0!">Já tem alguma ONG cadastrada?</p>
          <Link
            href="/"
            className="text-[var(--accent)] font-bold hover:opacity-80 text-base md:text-xl"
          >
            Entrar na conta
          </Link>
        </div>
      </div>
    </div>
  );
}
