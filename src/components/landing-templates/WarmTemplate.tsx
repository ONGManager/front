"use client";

import React, { useState } from "react";
import { PublicEvent } from "@/src/services/eventService";

interface TemplateProps {
  event: Partial<PublicEvent>;
  primaryColor: string;
  ctaText: string;
  onRegister?: (data: { name: string; email: string; phone?: string }) => Promise<void>;
  submitting?: boolean;
  ticketResult?: any;
}

export default function WarmTemplate({
  event,
  primaryColor,
  ctaText,
  onRegister,
  submitting = false,
  ticketResult,
}: TemplateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRegister) {
      onRegister({ name, email, phone });
    }
  };

  const eventDateObj = event.date ? new Date(event.date) : null;
  const day = eventDateObj ? eventDateObj.getDate() : "--";
  const month = eventDateObj
    ? eventDateObj.toLocaleString("pt-BR", { month: "short" }).toUpperCase()
    : "---";
  const time = eventDateObj
    ? eventDateObj.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans selection:bg-amber-100">
      {/* Faixa Superior Acolhedora */}
      <div
        className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white tracking-wide"
        style={{ backgroundColor: primaryColor }}
      >
        ❤️ Iniciativa comunitária promovida por {event.ong?.name || "Nossa ONG"}
      </div>

      {/* Header */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-xs shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            🤝
          </div>
          <div className="min-w-0">
            <span className="block font-extrabold text-xs sm:text-sm text-stone-900 leading-tight truncate">
              {event.ong?.name || "ONG Beneficente"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-stone-500 truncate block">Unindo pessoas por um propósito</span>
          </div>
        </div>

        <a
          href="#inscricao"
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-xs text-white shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {ctaText || "Fazer Inscrição"}
        </a>
      </header>

      {/* Hero Acolhedor */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-12 sm:pb-16 text-center">
        <span
          className="inline-block px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold mb-4"
          style={{
            backgroundColor: `${primaryColor}18`,
            color: primaryColor,
          }}
        >
          Encontro Aberto à Comunidade
        </span>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight break-words">
          {event.title || "Um Encontro Especial para Fazer a Diferença"}
        </h1>

        <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed break-words">
          {event.description ||
            "Estamos preparando um espaço acolhedor repleto de troca, apoio mútuo e solidariedade. Sua presença é fundamental para tornar este momento inesquecível."}
        </p>

        {/* Bloco de Data e Local Estilo Calendário */}
        <div className="mt-10 max-w-xl mx-auto bg-white rounded-3xl p-5 border border-stone-200/80 shadow-md flex flex-col sm:flex-row items-center justify-around gap-4">
          <div className="flex items-center gap-3 text-left">
            <div
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black leading-none shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-xs uppercase opacity-90">{month}</span>
              <span className="text-xl">{day}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Horário</div>
              <div className="text-xs text-stone-500">{time} Horas</div>
            </div>
          </div>

          <div className="h-8 w-px bg-stone-200 hidden sm:block" />

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 text-lg">
              📍
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Onde acontecerá</div>
              <div className="text-xs text-stone-500 max-w-[160px] truncate">
                {event.location || "Presencial / A definir"}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-stone-200 hidden sm:block" />

          <div className="text-center sm:text-right">
            <div className="text-xs font-bold text-stone-900">Vagas</div>
            <div className="text-xs font-extrabold" style={{ color: primaryColor }}>
              {event.remainingTickets ?? event.maxTickets ?? 50} restantes
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="#inscricao"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-extrabold text-sm shadow-md hover:opacity-95 active:scale-95 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            <span>{ctaText || "Quero Participar"}</span>
            <span>→</span>
          </a>
        </div>
      </section>

      {/* Banner Opcional */}
      {event.bannerUrl && (
        <section className="max-w-4xl mx-auto px-6 mb-16">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-stone-200 h-64 sm:h-80">
            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
        </section>
      )}

      {/* Seção de Propósito Comunitário */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center">
          <h3 className="text-xl font-black text-stone-900">Por que sua participação importa?</h3>
          <p className="mt-3 text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Cada voluntário, apoiador e participante fortalece a nossa missão de construir um futuro com mais oportunidades e compaixão. Participe e compartilhe com quem você ama.
          </p>
        </div>
      </section>

      {/* Formulário de Inscrição */}
      <section id="inscricao" className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center">
          {ticketResult ? (
            <div className="space-y-4">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-2xl"
                style={{ backgroundColor: primaryColor }}
              >
                ✓
              </div>
              <h2 className="text-2xl font-black text-stone-900">Presença Confirmada!</h2>
              <p className="text-xs text-stone-600">
                Seu código de acesso gratuito foi emitido:
              </p>
              <div
                className="p-3 rounded-2xl font-mono text-xl font-black tracking-widest"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                {ticketResult.guest?.ticketCode || "EVT-WARM-1234"}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                Faça Parte Deste Encontro
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Preencha seus dados para receber o convite digital oficial.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome e Sobrenome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Seu E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs focus:outline-none focus:ring-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-full text-white font-extrabold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer mt-3 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitting ? "Confirmando..." : ctaText || "Garantir minha vaga"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Rodapé Acolhedor */}
      <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-500">
        <p>Desenvolvido com carinho por {event.ong?.name || "ONG"} • Plataforma ONGManager</p>
      </footer>
    </div>
  );
}
