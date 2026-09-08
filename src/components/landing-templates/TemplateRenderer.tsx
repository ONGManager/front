"use client";

import React from "react";
import { PublicEvent } from "@/src/services/eventService";
import ModernTemplate from "./ModernTemplate";
import WarmTemplate from "./WarmTemplate";
import MinimalTemplate from "./MinimalTemplate";

export interface TemplateRendererProps {
  template?: "modern" | "warm" | "minimal" | string | null;
  event: Partial<PublicEvent>;
  primaryColor?: string | null;
  ctaText?: string | null;
  onRegister?: (data: { name: string; email: string; phone?: string }) => Promise<void>;
  submitting?: boolean;
  ticketResult?: {
    ticketCode: string;
    guestName: string;
    guestEmail: string;
    eventTitle: string;
    eventDate: string;
    eventLocation?: string | null;
    ongName: string;
  } | null;
}

export default function TemplateRenderer({
  template = "modern",
  event,
  primaryColor = "#7c3aed",
  ctaText = "Garantir meu Ingresso",
  onRegister,
  submitting = false,
  ticketResult = null,
}: TemplateRendererProps) {
  const activeColor = primaryColor || "#7c3aed";
  const activeCta = ctaText || "Garantir meu Ingresso";

  const templateComponent = () => {
    switch (template) {
      case "warm":
        return (
          <WarmTemplate
            event={event}
            primaryColor={activeColor}
            ctaText={activeCta}
            onRegister={onRegister}
            submitting={submitting}
            ticketResult={ticketResult}
          />
        );
      case "minimal":
        return (
          <MinimalTemplate
            event={event}
            primaryColor={activeColor}
            ctaText={activeCta}
            onRegister={onRegister}
            submitting={submitting}
            ticketResult={ticketResult}
          />
        );
      case "modern":
      default:
        return (
          <ModernTemplate
            event={event}
            primaryColor={activeColor}
            ctaText={activeCta}
            onRegister={onRegister}
            submitting={submitting}
            ticketResult={ticketResult}
          />
        );
    }
  };

  return (
    <div
      style={
        {
          "--primary-color": activeColor,
        } as React.CSSProperties
      }
      className="w-full h-full"
    >
      {templateComponent()}
    </div>
  );
}
