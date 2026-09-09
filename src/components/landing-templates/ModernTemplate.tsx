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

export default function ModernTemplate({
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

  const formattedDate = event.date
    ? new Date(event.date).toLocaleString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Data a definir";

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden"
      style={{ "--template-primary": primaryColor } as React.CSSProperties}
    >
      {/* Luz ambiente / Aurora Gradient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] opacity-30 blur-[130px] rounded-full pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Navbar Minimalista */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg font-bold text-sm shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            ★
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-200 truncate">
            {event.ong?.name || "ONG Organizadora"}
          </span>
        </div>

        <a
          href="#inscricao"
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-full text-white shadow-md hover:opacity-90 active:scale-95 transition-all shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {ctaText || "Participar"}
        </a>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-14 sm:pb-20 text-center">
        {/* Badge de status */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] sm:text-xs font-semibold backdrop-blur-md mb-5 sm:mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: primaryColor }} />
          <span className="text-slate-300">Evento Oficial da Comunidade</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 break-words">
          {event.title || "Título do Seu Evento Especial"}
        </h1>

        {/* Descrição curta */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed break-words">
          {event.description ||
            "Venha fazer parte deste grande momento. Conecte-se com pessoas, apoie causas transformadoras e viva uma experiência única."}
        </p>

        {/* Metadados: Data e Local */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md w-full sm:w-auto justify-center text-center">
            <svg className="w-4 h-4 shrink-0" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="capitalize break-words">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md w-full sm:w-auto justify-center text-center">
            <svg className="w-4 h-4 shrink-0" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-[220px]">{event.location || "Local a Definir / Online"}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md w-full sm:w-auto justify-center text-center">
            <svg className="w-4 h-4 shrink-0" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span>{event.remainingTickets ?? event.maxTickets ?? 50} ingressos disponíveis</span>
          </div>
        </div>

        {/* CTA Hero */}
        <div className="mt-8 sm:mt-10">
          <a
            href="#inscricao"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-xl hover:opacity-95 active:scale-98 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            <span>{ctaText || "Garantir meu Ingresso"}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Banner de Imagem (se houver) */}
      {event.bannerUrl && (
        <section className="max-w-5xl mx-auto px-6 mb-20 relative z-10">
          <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          </div>
        </section>
      )}

      {/* Destaques / Benefícios */}
      <section className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ingresso Digital Instantâneo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receba seu código de acesso exclusivo diretamente na tela com voucher para apresentar na entrada.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Apoio a Impacto Social</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toda a organização deste evento é realizada pela ONG com objetivo de fortalecer a comunidade local.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Vagas Limitadas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              As inscrições são controladas por cota para garantir a melhor acomodação de todos os participantes.
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Inscrição Integrada */}
      <section id="inscricao" className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <div className="p-5 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center">
          {ticketResult ? (
            <div className="space-y-4">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-2xl"
                style={{ backgroundColor: primaryColor }}
              >
                ✓
              </div>
              <h2 className="text-2xl font-black text-white">Ingresso Confirmado!</h2>
              <p className="text-xs text-slate-300">
                Seu voucher foi gerado. Apresente este código na recepção:
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xl font-black tracking-widest text-white">
                {ticketResult.guest?.ticketCode || "EVT-OK-1234"}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Garanta sua Participação
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Preencha os dados abaixo para reservar sua vaga gratuitamente no evento.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome e sobrenome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2"
                    style={{ outlineColor: primaryColor }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2"
                    style={{ outlineColor: primaryColor }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2"
                    style={{ outlineColor: primaryColor }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-2xl text-white font-extrabold text-sm shadow-xl hover:opacity-95 active:scale-98 transition-all cursor-pointer mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitting ? "Processando inscrição..." : ctaText || "Confirmar minha Inscrição"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500 relative z-10">
        <p>© {new Date().getFullYear()} {event.ong?.name || "ONG"}. Divulgação criada via ONGManager.</p>
      </footer>
    </div>
  );
}
