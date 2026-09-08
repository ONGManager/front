"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getPublicLandingPageApi,
  registerPublicGuestApi,
  PublicEvent,
} from "@/src/services/eventService";
import TemplateRenderer from "@/src/components/landing-templates/TemplateRenderer";

export default function PublicEventLandingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{
    ticketCode: string;
    guestName: string;
    guestEmail: string;
    eventTitle: string;
    eventDate: string;
    eventLocation?: string | null;
    ongName: string;
  } | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const loadLandingPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicLandingPageApi(eventId);
        setEvent(data);
      } catch (err: any) {
        setError(err?.message || "Não foi possível carregar a página deste evento.");
      } finally {
        setLoading(false);
      }
    };

    loadLandingPage();
  }, [eventId]);

  const handleRegister = async (formData: { name: string; email: string; phone?: string }) => {
    if (!event || !event.inviteToken) {
      toast.error("Token de convite indisponível para este evento.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await registerPublicGuestApi(event.inviteToken, formData);
      toast.success("Inscrição confirmada com sucesso! Seu ingresso foi gerado.");
      setTicketResult({
        ticketCode: response.guest.ticketCode,
        guestName: response.guest.name,
        guestEmail: response.guest.email,
        eventTitle: response.event.title,
        eventDate: response.event.date,
        eventLocation: response.event.location,
        ongName: response.event.ongName,
      });
    } catch (err: any) {
      toast.error(err?.message || "Erro ao realizar inscrição. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-14 h-14 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Carregando experiência do evento...</h2>
        <p className="text-slate-400 text-sm mt-1">Aguarde um instante.</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-100">Página Indisponível</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {error || "O evento que você procura não possui uma landing page ativa ou não foi encontrado."}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors shadow-lg"
            >
              Ir para ONGManager
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen">
      <TemplateRenderer
        template={event.landingTemplate || "modern"}
        event={event}
        primaryColor={event.primaryColor || "#7c3aed"}
        ctaText={event.ctaText || "Garantir meu Ingresso"}
        onRegister={handleRegister}
        submitting={submitting}
        ticketResult={ticketResult}
      />
    </main>
  );
}
