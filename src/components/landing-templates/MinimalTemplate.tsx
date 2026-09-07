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

export default function MinimalTemplate({
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
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Data a confirmar";

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100">
      {/* Barra de Linha Superior com Cor de Destaque */}
      <div className="w-full h-1" style={{ backgroundColor: primaryColor }} />

      {/* Header Minimalista */}
      <header className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <span className="font-semibold text-xs tracking-widest uppercase text-zinc-800">
            {event.ong?.name || "Organização"}
          </span>
        </div>

        <a
          href="#inscricao"
          className="text-xs font-semibold uppercase tracking-wider transition-colors hover:opacity-80"
          style={{ color: primaryColor }}
        >
          {ctaText || "Inscrição"} ↗
        </a>
      </header>

      {/* Hero Editorial */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                Edição Especial
              </span>
              <span className="text-zinc-300">•</span>
              <span
                className="text-[11px] font-mono uppercase tracking-widest font-semibold"
                style={{ color: primaryColor }}
              >
                {event.remainingTickets ?? event.maxTickets ?? 50} Vagas
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-light text-zinc-900 leading-[1.1] tracking-tight">
              {event.title || "Um Encontro Dedicado ao Futuro"}
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-lg">
              {event.description ||
                "Uma conferência pensada para conectar propósitos e pessoas comprometidas com a transformação social e sustentabilidade."}
            </p>

            <div className="pt-4 flex items-center gap-6">
              <a
                href="#inscricao"
                className="px-6 py-3 rounded-none text-white text-xs font-semibold tracking-wider uppercase shadow-xs hover:opacity-90 active:scale-95 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                {ctaText || "Confirmar Presença"}
              </a>
              <span className="text-xs text-zinc-400 font-mono">Entrada Franca</span>
            </div>
          </div>

          {/* Card Lateral de Dados Práticos */}
          <div className="lg:col-span-5 bg-zinc-50 p-8 border border-zinc-200/60 rounded-none space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-3">
              Informações do Evento
            </h3>

            <div>
              <span className="block text-[11px] text-zinc-400 font-mono uppercase">Data & Horário</span>
              <span className="block text-sm font-medium text-zinc-800 mt-1 capitalize">
                {formattedDate}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-zinc-400 font-mono uppercase">Localização</span>
              <span className="block text-sm font-medium text-zinc-800 mt-1">
                {event.location || "Presencial / A informar"}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-zinc-400 font-mono uppercase">Realização</span>
              <span className="block text-sm font-medium text-zinc-800 mt-1">
                {event.ong?.name || "ONG Organizadora"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Imagem (se houver) */}
      {event.bannerUrl && (
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <div className="w-full h-80 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
        </section>
      )}

      {/* Linha do Tempo / Agenda */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-100">
        <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-8">
          Programação Geral
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="border-l-2 pl-4 space-y-1" style={{ borderColor: primaryColor }}>
            <span className="font-mono text-zinc-400">01</span>
            <div className="font-semibold text-zinc-900 text-sm">Recepção & Acolhimento</div>
            <p className="text-zinc-500 leading-relaxed">
              Check-in com apresentação do voucher digital e boas-vindas da equipe da ONG.
            </p>
          </div>

          <div className="border-l-2 pl-4 space-y-1" style={{ borderColor: primaryColor }}>
            <span className="font-mono text-zinc-400">02</span>
            <div className="font-semibold text-zinc-900 text-sm">Apresentações & Diálogo</div>
            <p className="text-zinc-500 leading-relaxed">
              Momento dedicado aos temas principais, testemunhos de impacto e propostas da organização.
            </p>
          </div>

          <div className="border-l-2 pl-4 space-y-1" style={{ borderColor: primaryColor }}>
            <span className="font-mono text-zinc-400">03</span>
            <div className="font-semibold text-zinc-900 text-sm">Confraternização & Networking</div>
            <p className="text-zinc-500 leading-relaxed">
              Espaço livre para conexão entre voluntários, parceiros e a comunidade.
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Formulário de Inscrição */}
      <section id="inscricao" className="max-w-md mx-auto px-6 py-20 border-t border-zinc-100">
        {ticketResult ? (
          <div className="p-8 border border-zinc-200 text-center space-y-4">
            <span className="text-xs font-mono uppercase text-emerald-600 font-bold tracking-widest">
              [ Inscrição Confirmada ]
            </span>
            <h2 className="text-2xl font-serif text-zinc-900">Seu Acesso Está Garantido</h2>
            <p className="text-xs text-zinc-500">
              Apresente este identificador único na portaria:
            </p>
            <div className="p-4 bg-zinc-50 border border-zinc-200 font-mono text-lg font-bold tracking-widest text-zinc-900">
              {ticketResult.guest?.ticketCode || "EVT-MIN-1234"}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Acesso Individual
              </span>
              <h2 className="text-2xl font-serif text-zinc-900 mt-1">Registrar Participação</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 text-white text-xs font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? "Processando..." : ctaText || "Emitir Convite"}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Footer Minimalista */}
      <footer className="border-t border-zinc-100 py-8 text-center text-[11px] font-mono text-zinc-400">
        <p>© {new Date().getFullYear()} {event.ong?.name || "ONG"}. ONGManager Platform.</p>
      </footer>
    </div>
  );
}
