"use client";

import React from "react";

export interface TemplateOption {
  id: "modern" | "warm" | "minimal";
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  previewClass: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "modern",
    name: "Modern Impact",
    tagline: "Visual noturno, glassmorphism e badges luminosas com contadores de impacto.",
    badge: "Recomendado",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
    previewClass: "bg-slate-950 border-slate-800",
  },
  {
    id: "warm",
    name: "Warm Community",
    tagline: "Orgânico, afável e humanizado, com foco na comunidade e missão da ONG.",
    badge: "Comunidade",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
    previewClass: "bg-amber-50/50 border-amber-200",
  },
  {
    id: "minimal",
    name: "Editorial Minimal",
    tagline: "Elegante e refinado estilo gala ou conferência com hero em split-screen.",
    badge: "Elegante",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    previewClass: "bg-zinc-900 border-zinc-700",
  },
];

interface TemplateSelectorProps {
  selectedTemplate: "modern" | "warm" | "minimal";
  onChange: (template: "modern" | "warm" | "minimal") => void;
  primaryColor?: string;
}

export default function TemplateSelector({
  selectedTemplate,
  onChange,
  primaryColor = "#7c3aed",
}: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          Escolha o Layout do Template
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          3 designs disponíveis
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onChange(tmpl.id)}
              className={`group text-left relative p-3 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
              }`}
            >
              {/* Miniatura Ilustrativa do Template */}
              <div
                className={`w-full h-24 rounded-xl mb-3 overflow-hidden border relative flex flex-col p-2 select-none pointer-events-none ${tmpl.previewClass}`}
              >
                {/* Visual diferenciado conforme o template */}
                {tmpl.id === "modern" && (
                  <div className="w-full h-full flex flex-col justify-between text-slate-300">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="w-10 h-1.5 bg-slate-800 rounded-full" />
                    </div>
                    <div className="space-y-1 my-auto">
                      <div className="w-3/4 h-2 bg-slate-200 rounded-full" />
                      <div className="w-1/2 h-1.5 bg-slate-700 rounded-full" />
                    </div>
                    <div
                      className="w-full h-4 rounded-md flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      CTA
                    </div>
                  </div>
                )}

                {tmpl.id === "warm" && (
                  <div className="w-full h-full flex flex-col justify-between text-slate-700">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="w-8 h-1.5 bg-amber-200 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex flex-col items-center justify-center text-[7px] font-bold text-amber-800">
                        <span>24</span>
                        <span className="text-[5px]">SET</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="w-full h-1.5 bg-slate-800 rounded-full" />
                        <div className="w-2/3 h-1.5 bg-amber-600 rounded-full" />
                      </div>
                    </div>
                    <div
                      className="w-full h-3 rounded-full text-white text-[7px] flex items-center justify-center font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Inscrever-se
                    </div>
                  </div>
                )}

                {tmpl.id === "minimal" && (
                  <div className="w-full h-full grid grid-cols-2 gap-1 p-0.5">
                    <div className="flex flex-col justify-between">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="space-y-0.5">
                        <div className="w-full h-1.5 bg-white rounded-full font-serif" />
                        <div className="w-4/5 h-1 bg-zinc-500 rounded-full" />
                      </div>
                      <div
                        className="w-12 h-2.5 rounded text-[6px] text-white flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Participar
                      </div>
                    </div>
                    <div className="h-full bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border border-zinc-600 opacity-60" />
                    </div>
                  </div>
                )}
              </div>

              {/* Informações do Template */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {tmpl.name}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tmpl.badgeColor}`}
                  >
                    {tmpl.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {tmpl.tagline}
                </p>
              </div>

              {/* Checkmark no canto superior direito */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full text-white flex items-center justify-center text-xs shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
