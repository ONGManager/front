"use client";

import { useState, useEffect, useRef } from "react";
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
import { registerApi, sendVerificationCodeApi } from "../../../services/authService";
import { toast } from "sonner";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados da Validação por Código de 6 dígitos
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutos (600s)
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<RegisterOngFormData>({
    resolver: zodResolver(RegisterOngSchema),
    mode: "onBlur",
  });

  const password: string = watch("password");
  const emailValue = watch("email");
  const nomeOngValue = watch("nomeOng");
  const cnpjValue = watch("cnpj");
  const cnpjRegister = register("cnpj");

  // Timer de 10 minutos (600s) em tempo real
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (step === 3 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timeLeft]);

  // Cooldown de reenvio de código (60s)
  useEffect(() => {
    let cooldownTimer: NodeJS.Timeout | null = null;
    if (resendCooldown > 0) {
      cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  }, [resendCooldown]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

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

  // Avança para o Passo 2
  const handleNextStep = async () => {
    const isValid = await trigger(["nomeOng", "cnpj"]);
    if (isValid) {
      setStep(2);
    }
  };

  // Envia código de verificação e avança para o Passo 3
  const handleRequestVerificationCode = async () => {
    const isValid = await trigger(["nomeResponsavel", "email", "password", "confirmPassword"]);
    if (!isValid) return;

    try {
      setIsSendingCode(true);
      const email = getValues("email");
      const ong = getValues("nomeOng");

      await sendVerificationCodeApi(email, ong);

      setTimeLeft(600); // 10 minutos
      setResendCooldown(60); // 60s cooldown para reenviar
      setVerificationCode(["", "", "", "", "", ""]);
      setStep(3);
      toast.success(`Código de verificação enviado para ${email}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao enviar código de verificação. Verifique o e-mail informado.",
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  // Reenvio de código
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSendingCode) return;

    try {
      setIsSendingCode(true);
      const email = getValues("email");
      const ong = getValues("nomeOng");

      await sendVerificationCodeApi(email, ong);

      setTimeLeft(600); // reinicia os 10 minutos
      setResendCooldown(60); // 60s cooldown
      toast.success("Novo código enviado para seu e-mail!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao reenviar código.",
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  // Manipulação dos 6 dígitos OTP
  const handleCodeChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) {
      const updated = [...verificationCode];
      updated[index] = "";
      setVerificationCode(updated);
      return;
    }

    // Se colar múltiplos dígitos de uma vez (ex: "123456")
    if (numericValue.length > 1) {
      const digits = numericValue.slice(0, 6).split("");
      const updated = [...verificationCode];
      digits.forEach((digit, i) => {
        if (i < 6) updated[i] = digit;
      });
      setVerificationCode(updated);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const updated = [...verificationCode];
    updated[index] = numericValue.slice(-1);
    setVerificationCode(updated);

    // Auto-avanço para o próximo input
    if (index < 5 && numericValue) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submissão final: Valida código e efetiva cadastro da ONG e do usuário
  const onSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = verificationCode.join("");

    if (fullCode.length !== 6) {
      toast.error("Por favor, digite os 6 dígitos do código de verificação.");
      return;
    }

    if (timeLeft === 0) {
      toast.error("O código de verificação expirou. Solicite um novo código.");
      return;
    }

    try {
      setIsLoading(true);
      const data = getValues();

      await registerApi(
        data.nomeResponsavel,
        data.email,
        data.password,
        fullCode,
        data.nomeOng,
        data.cnpj,
      );

      toast.success("Conta e ONG cadastradas com sucesso! Faça login para começar.");
      window.location.href = "/";
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao validar código ou cadastrar conta.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-[440px]">
        <LoginPadrao
          Titulo="Crie sua Conta!"
          Subtitulo="Cadastre sua ONG e comece a gerenciar em minutos"
        />

        <div className="flex flex-col items-center justify-center mt-4 mb-2 mx-auto w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Stepper Superior */}
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 1
                    ? "bg-purple-600 text-white"
                    : "bg-[var(--surface-hover)] text-[var(--muted)]"
                }`}
                animate={{ scale: step === 1 ? 1.05 : 1 }}
              >
                1
              </motion.div>
              <div className="flex-1 h-1.5 mx-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-600"
                  animate={{
                    width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= 2
                    ? "bg-purple-600 text-white"
                    : "bg-[var(--surface-hover)] text-[var(--muted)]"
                }`}
                animate={{ scale: step === 2 ? 1.05 : 1 }}
              >
                2
              </motion.div>
              <div className="flex-1 h-1.5 mx-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-600"
                  animate={{
                    width: step === 3 ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === 3
                    ? "bg-purple-600 text-white"
                    : "bg-[var(--surface-hover)] text-[var(--muted)]"
                }`}
                animate={{ scale: step === 3 ? 1.05 : 1 }}
              >
                3
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)] font-medium px-1">
              <span>ONG</span>
              <span>Responsável</span>
              <span>Confirmação</span>
            </div>
          </div>

          {/* Form / Conteúdo dos Passos */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {/* PASSO 1: DADOS DA ONG */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 w-full"
                >
                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-[var(--text)]">
                      Nome da ONG <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Digite o nome da sua ONG"
                      {...register("nomeOng")}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        errors.nomeOng
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    {errors.nomeOng && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.nomeOng.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-[var(--text)]">
                      CNPJ <span className="text-red-500">*</span>
                    </label>
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
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        errors.cnpj
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    {errors.cnpj && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.cnpj.message}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="contained"
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-11 bg-purple-600! hover:bg-purple-700! text-white font-bold mt-2 cursor-pointer shadow-md"
                  >
                    Continuar
                  </Button>
                </motion.div>
              )}

              {/* PASSO 2: DADOS DO RESPONSÁVEL */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4 w-full"
                >
                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-[var(--text)]">
                      Nome do Responsável <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Digite o seu nome completo"
                      {...register("nomeResponsavel")}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        errors.nomeResponsavel
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    {errors.nomeResponsavel && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.nomeResponsavel.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 text-sm font-semibold text-[var(--text)]">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      {...register("email")}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        errors.email
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="relative w-full">
                    <label className="block mb-1.5 text-sm font-semibold text-[var(--text)]">
                      Senha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      {...register("password")}
                      onKeyDown={handleSenhaKeyDown}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        errors.password
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-[34px] text-[var(--muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                    {errors.password && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  <div className="relative w-full">
                    <label className="block mb-1.5 text-sm font-semibold text-[var(--text)]">
                      Confirmar Senha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita sua senha"
                      {...register("confirmPassword")}
                      className={`w-full h-10 bg-[var(--input)] text-[var(--text)] border-2 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-[var(--input-border)]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-[34px] text-[var(--muted)] hover:text-[var(--text)] text-sm cursor-pointer"
                    >
                      {showConfirmPassword ? "Ocultar" : "Mostrar"}
                    </button>
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-xs mt-1 block">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 mt-2">
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/2 h-11 border-purple-600! text-purple-700! hover:bg-purple-100! font-bold cursor-pointer"
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="contained"
                      type="button"
                      onClick={handleRequestVerificationCode}
                      disabled={isSendingCode}
                      className="w-1/2 h-11 bg-purple-600! hover:bg-purple-700! text-white font-bold cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {isSendingCode ? "Enviando..." : "Avançar"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* PASSO 3: VALIDAÇÃO DO CÓDIGO COM TIMER DE 10 MINUTOS */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center w-full text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mb-3 shadow-inner">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text)] mb-1">
                    Confirme seu E-mail
                  </h3>
                  <p className="text-xs text-[var(--muted)] mb-3">
                    Enviamos um código de 6 dígitos para{" "}
                    <strong className="text-[var(--text)]">{emailValue}</strong>
                  </p>

                  {/* Contador Regressivo em Tempo Real (10 minutos) */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 transition ${
                      timeLeft > 60
                        ? "bg-purple-500/10 text-purple-600 border border-purple-200 dark:border-purple-800"
                        : timeLeft > 0
                        ? "bg-amber-500/10 text-amber-600 border border-amber-300 animate-pulse"
                        : "bg-red-500/10 text-red-600 border border-red-300"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {timeLeft > 0 ? (
                        <>
                          Tempo restante: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </>
                      ) : (
                        "Código expirado"
                      )}
                    </span>
                  </div>

                  {/* 6 Caixas de Input OTP */}
                  <form onSubmit={onSubmitFinal} className="w-full">
                    <div className="flex justify-between gap-2 mb-5">
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-13 text-center text-xl font-bold bg-[var(--input)] text-[var(--text)] border-2 border-[var(--input-border)] rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition font-mono"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    <Button
                      variant="contained"
                      type="submit"
                      disabled={isLoading || verificationCode.join("").length !== 6 || timeLeft === 0}
                      className="w-full h-11 bg-purple-600! hover:bg-purple-700! text-white font-bold cursor-pointer disabled:opacity-50 shadow-md mb-3 transition"
                    >
                      {isLoading ? "Validando e Cadastrando..." : "Confirmar e Criar ONG"}
                    </Button>

                    <div className="flex justify-between items-center text-xs">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-[var(--muted)] hover:text-[var(--text)] transition cursor-pointer"
                      >
                        ← Alterar dados
                      </button>

                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0 || isSendingCode}
                        className="text-purple-600 font-semibold hover:underline disabled:text-[var(--muted)] disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isSendingCode
                          ? "Enviando..."
                          : resendCooldown > 0
                          ? `Reenviar código (${resendCooldown}s)`
                          : "Reenviar código"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
