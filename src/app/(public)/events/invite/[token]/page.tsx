"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { toast } from "sonner";
import {
  getPublicEventApi,
  registerPublicGuestApi,
  PublicEvent,
  RegisterGuestResponse,
} from "@/src/services/eventService";

export default function PublicEventInvitePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form de Inscrição
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirmação de Inscrição (Ingresso Emitido)
  const [ticketResult, setTicketResult] = useState<RegisterGuestResponse | null>(null);

  useEffect(() => {
    if (!token) return;

    async function loadEvent() {
      try {
        setLoading(true);
        const data = await getPublicEventApi(token);
        setEvent(data);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Convite de evento não encontrado ou inativo."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [token]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);

    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    setPhone(val);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, preencha seu nome completo.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Por favor, informe um endereço de e-mail válido.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await registerPublicGuestApi(token, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
      });

      setTicketResult(response);
      toast.success("Inscrição confirmada com sucesso! Seu ingresso foi gerado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao realizar inscrição.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTicketCode = () => {
    if (!ticketResult) return;
    navigator.clipboard.writeText(ticketResult.guest.ticketCode);
    toast.success("Código do ingresso copiado!");
  };

  const handlePrintTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--text)] p-4">
        <CircularProgress size={44} sx={{ color: "var(--accent)" }} />
        <p className="mt-4 text-sm text-[var(--muted)] font-medium">Carregando convite do evento...</p>
      </div>
    );
  }

  if (errorMessage || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
        <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text)]">Convite Indisponível</h2>
          <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
            {errorMessage || "Este link de convite não é válido ou o evento foi cancelado."}
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Ir para Página Inicial
          </a>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-xl w-full">
        {/* Cabeçalho de Identificação */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Organizado por {event.ong.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            {event.title}
          </h1>
          {event.ong.description && (
            <p className="text-xs text-[var(--muted)] mt-1 max-w-md mx-auto">
              {event.ong.description}
            </p>
          )}
        </div>

        {/* Card Principal */}
        <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl shadow-xl overflow-hidden">
          {/* Se o ingresso já foi gerado (Confirmação) */}
          {ticketResult ? (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-[var(--text)]">Inscrição Confirmada!</h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Seu ingresso digital foi emitido com sucesso. Apresente este código na recepção.
                </p>
              </div>

              {/* Ingresso Digital / Voucher */}
              <div className="rounded-2xl border-2 border-dashed border-[var(--accent)] bg-[var(--surface-hover)] p-6 space-y-4 relative">
                <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider">
                      Ingresso Individual
                    </span>
                    <h3 className="text-base font-bold text-[var(--text)]">{ticketResult.event.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Confirmado
                  </span>
                </div>

                {/* Código em destaque */}
                <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--surface-border)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] font-medium uppercase">
                      Código do Ingresso
                    </span>
                    <div className="font-mono text-xl font-extrabold text-[var(--accent)] tracking-wider">
                      {ticketResult.guest.ticketCode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTicketCode}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    Copiar
                  </button>
                </div>

                {/* Detalhes do Participante e Evento */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--muted)]">Participante:</span>
                    <div className="font-semibold text-[var(--text)]">{ticketResult.guest.name}</div>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">E-mail:</span>
                    <div className="font-semibold text-[var(--text)] truncate">{ticketResult.guest.email}</div>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Data e Horário:</span>
                    <div className="font-semibold text-[var(--text)]">{formattedDate}</div>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Local:</span>
                    <div className="font-semibold text-[var(--text)]">
                      {ticketResult.event.location || "Online / A definir"}
                    </div>
                  </div>
                </div>

                {/* Código de barras ilustrativo */}
                <div className="pt-2 flex flex-col items-center justify-center opacity-70">
                  <div className="flex gap-1 h-8 items-end">
                    {[3, 1, 4, 2, 5, 2, 1, 4, 3, 2, 5, 1, 3, 4, 2, 3, 1, 4].map((h, i) => (
                      <div
                        key={i}
                        className="bg-[var(--text)] w-1 rounded-xs"
                        style={{ height: `${h * 6}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted)] mt-1">
                    {ticketResult.guest.ticketCode}
                  </span>
                </div>
              </div>

              {/* Ações de Impressão / Salvar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handlePrintTicket}
                  className="flex-1 py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-sm shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir / Salvar Ingresso
                </button>
              </div>
            </div>
          ) : (
            /* Formulário de Inscrição Normal */
            <div className="p-6 sm:p-8 space-y-6">
              {/* Informações Resumidas do Evento */}
              <div className="space-y-3 pb-5 border-b border-[var(--surface-border)]">
                {event.description && (
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {event.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--surface-hover)]">
                    <svg className="w-4 h-4 text-[var(--accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Data</div>
                      <div className="font-semibold text-[var(--text)] capitalize">{formattedDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--surface-hover)]">
                    <svg className="w-4 h-4 text-[var(--accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Local</div>
                      <div className="font-semibold text-[var(--text)] line-clamp-1">
                        {event.location || "Online / A definir"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge de Disponibilidade de Ingressos */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-xs">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <span className="font-medium text-[var(--muted)]">Capacidade</span>
                  </div>
                  <div>
                    {event.isSoldOut ? (
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        Ingressos Esgotados!
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Restam {event.remainingTickets} ingressos disponíveis
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Se o evento estiver encerrado ou cancelado */}
              {event.status !== "ativo" ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    As inscrições para este evento foram {event.status === "encerrado" ? "encerradas" : "canceladas"}.
                  </p>
                </div>
              ) : event.isSoldOut ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    Todas as vagas foram preenchidas! Os ingressos estão esgotados.
                  </p>
                </div>
              ) : (
                /* Formulário de Inscrição */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Como gostaria de ser chamado(a)?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] placeholder-[var(--icon)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                      Seu E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="exemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] placeholder-[var(--icon)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)]"
                    />
                    <span className="text-[11px] text-[var(--muted)] mt-1 block">
                      Enviaremos a confirmação e o ingresso para este e-mail.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                      Telefone / WhatsApp (Opcional)
                    </label>
                    <input
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] placeholder-[var(--icon)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {submitting ? (
                      <CircularProgress size={20} sx={{ color: "white" }} />
                    ) : (
                      <>
                        <span>Garantir Meu Ingresso Gratuito</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Rodapé institucional */}
        <div className="mt-8 text-center text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} ONGManager. Plataforma para gestão de impacto social.</p>
        </div>
      </div>
    </div>
  );
}
