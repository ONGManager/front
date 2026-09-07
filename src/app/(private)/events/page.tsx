"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { toast } from "sonner";
import {
  getEventsApi,
  createEventApi,
  updateEventApi,
  deleteEventApi,
  getEventGuestsApi,
  updateGuestStatusApi,
  deleteGuestApi,
  EventItem,
  EventGuest,
} from "@/src/services/eventService";
import { getOngApi } from "@/src/services/ongService";

export default function EventsPage() {
  const router = useRouter();
  const [ongId, setOngId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("colaborador");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Modal de Criar/Editar Evento
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [maxTickets, setMaxTickets] = useState<number | "">(50);
  const [eventStatus, setEventStatus] = useState<"ativo" | "encerrado" | "cancelado">("ativo");
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Modal de Gestão de Convidados / Inscritos
  const [guestsModalOpen, setGuestsModalOpen] = useState(false);
  const [selectedEventForGuests, setSelectedEventForGuests] = useState<EventItem | null>(null);
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [guestSearch, setGuestSearch] = useState("");
  const [guestStatusFilter, setGuestStatusFilter] = useState<string>("todos");

  // Confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = userRole === "admin";

  useEffect(() => {
    const storedOngId = localStorage.getItem("selectedOngId");
    if (!storedOngId) {
      router.push("/OngSelector");
      return;
    }
    setOngId(storedOngId);
    loadInitialData(storedOngId);
  }, [router]);

  const loadInitialData = async (id: string) => {
    try {
      setLoading(true);
      const [eventsData, ongData] = await Promise.all([
        getEventsApi(id),
        getOngApi(id),
      ]);
      setEvents(eventsData);
      setUserRole(ongData.userRole);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar dados de eventos");
    } finally {
      setLoading(false);
    }
  };

  const reloadEvents = async () => {
    if (!ongId) return;
    try {
      const data = await getEventsApi(ongId);
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const activeEvents = events.filter((e) => e.status === "ativo").length;
    const totalTickets = events.reduce((acc, curr) => acc + curr.maxTickets, 0);
    const totalGuests = events.reduce((acc, curr) => acc + curr.totalGuests, 0);
    return { totalEvents, activeEvents, totalTickets, totalGuests };
  }, [events]);

  // Eventos Filtrados
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "todos"
          ? true
          : statusFilter === "esgotado"
          ? event.isSoldOut && event.status === "ativo"
          : event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  // Handlers para Modal de Evento
  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    // Default to tomorrow at 19:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);
    const formatted = tomorrow.toISOString().slice(0, 16);
    setDate(formatted);
    setLocation("");
    setMaxTickets(50);
    setEventStatus("ativo");
    setEventModalOpen(true);
  };

  const handleOpenEditModal = (event: EventItem) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || "");
    const dateObj = new Date(event.date);
    const formatted = !isNaN(dateObj.getTime())
      ? new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "";
    setDate(formatted);
    setLocation(event.location || "");
    setMaxTickets(event.maxTickets);
    setEventStatus(event.status);
    setEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!title.trim()) {
      toast.error("O título do evento é obrigatório.");
      return;
    }
    if (!date) {
      toast.error("A data e horário do evento são obrigatórios.");
      return;
    }
    if (!maxTickets || Number(maxTickets) < 1) {
      toast.error("A quantidade de ingressos deve ser de no mínimo 1.");
      return;
    }

    setSubmittingEvent(true);
    try {
      if (editingEventId) {
        await updateEventApi(ongId, editingEventId, {
          title: title.trim(),
          description: description.trim() || undefined,
          date: new Date(date).toISOString(),
          location: location.trim() || undefined,
          maxTickets: Number(maxTickets),
          status: eventStatus,
        });
        toast.success("Evento atualizado com sucesso!");
      } else {
        await createEventApi(ongId, {
          title: title.trim(),
          description: description.trim() || undefined,
          date: new Date(date).toISOString(),
          location: location.trim() || undefined,
          maxTickets: Number(maxTickets),
        });
        toast.success("Evento cadastrado com sucesso!");
      }
      setEventModalOpen(false);
      reloadEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar evento");
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      await deleteEventApi(ongId, eventToDelete.id);
      toast.success("Evento excluído com sucesso!");
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      reloadEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir evento");
    } finally {
      setDeleting(false);
    }
  };

  // Copiar link de convite
  const handleCopyInviteLink = (event: EventItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${origin}/events/invite/${event.inviteToken}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link de convite copiado para a área de transferência!");
  };

  // Abrir gestão de convidados
  const handleOpenGuestsModal = async (event: EventItem) => {
    setSelectedEventForGuests(event);
    setGuestSearch("");
    setGuestStatusFilter("todos");
    setGuestsModalOpen(true);
    await loadEventGuests(event.id);
  };

  const loadEventGuests = async (eventId: string) => {
    setLoadingGuests(true);
    try {
      const data = await getEventGuestsApi(ongId, eventId);
      setGuests(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar convidados");
    } finally {
      setLoadingGuests(false);
    }
  };

  // Check-in ou alternar status do convidado
  const handleToggleGuestPresence = async (guest: EventGuest) => {
    if (!selectedEventForGuests) return;
    const newStatus = guest.status === "presente" ? "confirmado" : "presente";
    try {
      await updateGuestStatusApi(ongId, selectedEventForGuests.id, guest.id, newStatus);
      toast.success(
        newStatus === "presente"
          ? `Presença confirmada para ${guest.name}!`
          : `Check-in desmarcado para ${guest.name}.`
      );
      // Atualiza lista local e eventos
      setGuests((prev) =>
        prev.map((g) => (g.id === guest.id ? { ...g, status: newStatus } : g))
      );
      reloadEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar presença");
    }
  };

  // Remover convidado (libera vaga)
  const handleDeleteGuest = async (guest: EventGuest) => {
    if (!selectedEventForGuests) return;
    if (!confirm(`Deseja realmente remover a inscrição de ${guest.name}? Isso liberará 1 ingresso.`)) {
      return;
    }
    try {
      await deleteGuestApi(ongId, selectedEventForGuests.id, guest.id);
      toast.success("Inscrição removida e ingresso liberado!");
      setGuests((prev) => prev.filter((g) => g.id !== guest.id));
      reloadEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover inscrição");
    }
  };

  // Exportar inscritos em CSV
  const handleExportGuestsCSV = () => {
    if (!selectedEventForGuests || guests.length === 0) {
      toast.error("Nenhum inscrito para exportar");
      return;
    }
    const headers = ["Nome", "Email", "Telefone", "Codigo do Ingresso", "Status", "Data de Inscricao"];
    const rows = guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.email}"`,
      `"${g.phone || "-"}"`,
      `"${g.ticketCode}"`,
      `"${g.status}"`,
      `"${new Date(g.createdAt).toLocaleString("pt-BR")}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inscritos-${selectedEventForGuests.title.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório de inscritos exportado em CSV!");
  };

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
        g.email.toLowerCase().includes(guestSearch.toLowerCase()) ||
        g.ticketCode.toLowerCase().includes(guestSearch.toLowerCase());
      const matchStatus = guestStatusFilter === "todos" ? true : g.status === guestStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [guests, guestSearch, guestStatusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <CircularProgress size={36} sx={{ color: "var(--accent)" }} />
        <p className="text-sm text-[var(--muted)] font-medium">Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Topo / Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] tracking-tight">
            Eventos da ONG
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Cadastre eventos, acompanhe a cota de ingressos e compartilhe links de convite públicos.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="contained"
            onClick={handleOpenCreateModal}
            className="!bg-[var(--accent)] hover:!opacity-90 !text-white !font-semibold !px-5 !py-2.5 !rounded-xl !shadow-sm !capitalize text-sm transition-all"
            startIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Novo Evento
          </Button>
        )}
      </div>

      {/* Cards de Métricas / KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Total de Eventos
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-[var(--text)] mt-3">
            {stats.totalEvents}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Eventos Ativos
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3">
            {stats.activeEvents}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Ingressos Ofertados
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-[var(--text)] mt-3">
            {stats.totalTickets}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Convidados Inscritos
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-[var(--accent)] mt-3">
            {stats.totalGuests}
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--surface-border)]">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--icon)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por título ou local do evento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] placeholder-[var(--icon)] focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)]"
          />
        </div>

        {/* Tabs de status */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "todos", label: "Todos" },
            { id: "ativo", label: "Ativos" },
            { id: "esgotado", label: "Esgotados" },
            { id: "encerrado", label: "Encerrados" },
            { id: "cancelado", label: "Cancelados" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de Eventos */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--surface)] rounded-2xl border border-[var(--surface-border)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)]">Nenhum evento encontrado</h3>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-md mx-auto">
            {searchTerm || statusFilter !== "todos"
              ? "Tente ajustar os filtros ou termos da sua busca."
              : "Comece cadastrando o primeiro evento da sua ONG para disponibilizar ingressos aos participantes."}
          </p>
          {isAdmin && !searchTerm && statusFilter === "todos" && (
            <Button
              variant="contained"
              onClick={handleOpenCreateModal}
              className="!mt-4 !bg-[var(--accent)] !text-white !capitalize !rounded-xl"
            >
              Cadastrar Primeiro Evento
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const occupancyPct = Math.min(
              100,
              Math.round((event.totalGuests / event.maxTickets) * 100)
            );
            const dateFormatted = new Date(event.date).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={event.id}
                className="bg-[var(--surface)] rounded-2xl border border-[var(--surface-border)] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  {/* Topo do Card: Status e Menu */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          event.status === "ativo"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : event.status === "encerrado"
                            ? "bg-gray-500/15 text-gray-600 dark:text-gray-400"
                            : "bg-red-500/15 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {event.status === "ativo"
                          ? "Ativo"
                          : event.status === "encerrado"
                          ? "Encerrado"
                          : "Cancelado"}
                      </span>

                      {event.isSoldOut && event.status === "ativo" && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          Esgotado
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <Tooltip title="Editar Evento">
                          <button
                            onClick={() => handleOpenEditModal(event)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--icon)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </Tooltip>

                        <Tooltip title="Excluir Evento">
                          <button
                            onClick={() => {
                              setEventToDelete(event);
                              setDeleteDialogOpen(true);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {/* Título e Descrição */}
                  <h3 className="text-lg font-bold text-[var(--text)] line-clamp-1 mb-1.5" title={event.title}>
                    {event.title}
                  </h3>
                  {event.description ? (
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mb-4 leading-relaxed">
                      {event.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--muted)]/60 italic mb-4">Sem descrição detalhada.</p>
                  )}

                  {/* Informações de Data e Local */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <svg className="w-4 h-4 text-[var(--icon)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-[var(--text)]">{dateFormatted}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <svg className="w-4 h-4 text-[var(--icon)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-1">{event.location || "Local a definir / Online"}</span>
                    </div>
                  </div>

                  {/* Barra de Progresso de Ingressos */}
                  <div className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-[var(--muted)]">Ocupação de Ingressos</span>
                      <span className="font-bold text-[var(--text)]">
                        {event.totalGuests} / {event.maxTickets} ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          occupancyPct >= 100
                            ? "bg-amber-500"
                            : occupancyPct >= 80
                            ? "bg-purple-600"
                            : "bg-[var(--accent)]"
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--muted)] mt-1.5">
                      <span>{event.remainingTickets} disponíveis</span>
                      <span>{event.checkedInGuests} presenças</span>
                    </div>
                  </div>
                </div>

                {/* Ações do Rodapé do Card */}
                <div className="p-3 bg-[var(--surface-hover)] border-t border-[var(--surface-border)] flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handleCopyInviteLink(event)}
                    variant="outlined"
                    size="small"
                    className="!text-xs !capitalize !font-medium !text-[var(--accent)] !border-[var(--accent-border)] hover:!bg-[var(--accent-soft)] !rounded-lg !py-1.5"
                    startIcon={
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    }
                  >
                    Copiar Convite
                  </Button>

                  <Button
                    onClick={() => handleOpenGuestsModal(event)}
                    variant="contained"
                    size="small"
                    className="!text-xs !capitalize !font-semibold !bg-[var(--accent)] hover:!opacity-90 !text-white !rounded-lg !py-1.5"
                    startIcon={
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                  >
                    Inscritos ({event.totalGuests})
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CRIAR OU EDITAR EVENTO                             */}
      {/* ======================================================== */}
      <Dialog
        open={eventModalOpen}
        onClose={() => !submittingEvent && setEventModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "var(--surface)",
            color: "var(--text)",
            borderRadius: 3,
            border: "1px solid var(--surface-border)",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "var(--text)", fontWeight: 700 }}>
          {editingEventId ? "Editar Evento" : "Cadastrar Novo Evento"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField
              label="Título do Evento *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              placeholder="Ex: Bazar Beneficente 2026, Palestra Comunitária..."
              sx={{
                "& .MuiInputLabel-root": { color: "var(--muted)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
                "& .MuiOutlinedInput-root": {
                  color: "var(--text)",
                  bgcolor: "var(--input)",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "var(--input-border)" },
                  "&:hover fieldset": { borderColor: "var(--input-hover)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                },
              }}
            />

            <TextField
              label="Descrição do Evento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Informações adicionais, programação, instruções aos convidados..."
              sx={{
                "& .MuiInputLabel-root": { color: "var(--muted)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
                "& .MuiOutlinedInput-root": {
                  color: "var(--text)",
                  bgcolor: "var(--input)",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "var(--input-border)" },
                  "&:hover fieldset": { borderColor: "var(--input-hover)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                },
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Data e Horário *"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiInputLabel-root": { color: "var(--muted)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "var(--input-border)" },
                    "&:hover fieldset": { borderColor: "var(--input-hover)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                  },
                }}
              />

              <TextField
                label="Quantidade de Ingressos *"
                type="number"
                value={maxTickets}
                onChange={(e) => setMaxTickets(e.target.value === "" ? "" : Number(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1 }}
                sx={{
                  "& .MuiInputLabel-root": { color: "var(--muted)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "var(--input-border)" },
                    "&:hover fieldset": { borderColor: "var(--input-hover)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                  },
                }}
              />
            </div>

            <TextField
              label="Local ou Link do Evento"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              placeholder="Ex: Rua das Flores, 123 ou meet.google.com/xyz"
              sx={{
                "& .MuiInputLabel-root": { color: "var(--muted)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
                "& .MuiOutlinedInput-root": {
                  color: "var(--text)",
                  bgcolor: "var(--input)",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "var(--input-border)" },
                  "&:hover fieldset": { borderColor: "var(--input-hover)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                },
              }}
            />

            {editingEventId && (
              <TextField
                select
                label="Status do Evento"
                value={eventStatus}
                onChange={(e) =>
                  setEventStatus(e.target.value as "ativo" | "encerrado" | "cancelado")
                }
                fullWidth
                sx={{
                  "& .MuiInputLabel-root": { color: "var(--muted)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "var(--input-border)" },
                    "&:hover fieldset": { borderColor: "var(--input-hover)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                  },
                }}
              >
                <MenuItem value="ativo">Ativo (Aceitando Inscrições)</MenuItem>
                <MenuItem value="encerrado">Encerrado</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
              </TextField>
            )}
          </div>
        </DialogContent>
        <DialogActions className="gap-2 px-6 pb-4">
          <Button
            onClick={() => setEventModalOpen(false)}
            disabled={submittingEvent}
            className="!text-sm !font-semibold !text-[var(--muted)] !capitalize"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEvent}
            variant="contained"
            disabled={submittingEvent}
            className="!bg-[var(--accent)] hover:!opacity-90 !text-white !font-semibold !px-5 !py-2 !rounded-xl !capitalize"
          >
            {submittingEvent ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : editingEventId ? (
              "Salvar Alterações"
            ) : (
              "Criar Evento"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL: GESTÃO DE CONVIDADOS / INSCRITOS                   */}
      {/* ======================================================== */}
      <Dialog
        open={guestsModalOpen}
        onClose={() => setGuestsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "var(--surface)",
            color: "var(--text)",
            borderRadius: 3,
            border: "1px solid var(--surface-border)",
            p: 1,
          },
        }}
      >
        <DialogTitle>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--surface-border)] pb-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">
                Inscritos no Evento
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {selectedEventForGuests?.title}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedEventForGuests && (
                <Button
                  onClick={() => handleCopyInviteLink(selectedEventForGuests)}
                  variant="outlined"
                  size="small"
                  className="!text-xs !capitalize !font-medium !text-[var(--accent)] !border-[var(--accent-border)] !rounded-lg"
                  startIcon={
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  }
                >
                  Copiar Convite
                </Button>
              )}

              <Button
                onClick={handleExportGuestsCSV}
                variant="contained"
                size="small"
                disabled={guests.length === 0}
                className="!text-xs !capitalize !font-semibold !bg-[var(--accent)] !text-white !rounded-lg"
                startIcon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              >
                Exportar CSV
              </Button>
            </div>
          </div>
        </DialogTitle>

        <DialogContent>
          {/* Métricas rápidas do evento selecionado */}
          <div className="grid grid-cols-3 gap-3 my-3">
            <div className="p-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Inscritos
              </span>
              <div className="text-lg font-bold text-[var(--text)]">
                {guests.filter((g) => g.status !== "cancelado").length} / {selectedEventForGuests?.maxTickets}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Presenças Confirmadas
              </span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {guests.filter((g) => g.status === "presente").length}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Vagas Restantes
              </span>
              <div className="text-lg font-bold text-[var(--accent)]">
                {Math.max(
                  0,
                  (selectedEventForGuests?.maxTickets || 0) -
                    guests.filter((g) => g.status !== "cancelado").length
                )}
              </div>
            </div>
          </div>

          {/* Filtro de busca de convidados */}
          <div className="flex flex-col sm:flex-row items-center gap-2 my-3">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou código do ingresso..."
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] placeholder-[var(--icon)] focus:outline-none focus:ring-1 focus:ring-[var(--input-ring)]"
            />

            <div className="flex items-center gap-1 shrink-0">
              {["todos", "confirmado", "presente", "cancelado"].map((st) => (
                <button
                  key={st}
                  onClick={() => setGuestStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all cursor-pointer ${
                    guestStatusFilter === st
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Tabela de Inscritos */}
          {loadingGuests ? (
            <div className="flex items-center justify-center py-12">
              <CircularProgress size={28} sx={{ color: "var(--accent)" }} />
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted)] text-sm">
              Nenhum participante encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--surface-border)] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-hover)] border-b border-[var(--surface-border)] text-[var(--muted)] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Convidado</th>
                    <th className="py-2.5 px-3">Telefone</th>
                    <th className="py-2.5 px-3">Ingresso</th>
                    <th className="py-2.5 px-3">Status</th>
                    {isAdmin && <th className="py-2.5 px-3 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--surface-border)]">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[var(--text)]">{guest.name}</div>
                        <div className="text-[11px] text-[var(--muted)]">{guest.email}</div>
                      </td>

                      <td className="py-2.5 px-3 text-[var(--muted)]">
                        {guest.phone || "-"}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text)]">
                          {guest.ticketCode}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            guest.status === "presente"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : guest.status === "confirmado"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                              : "bg-red-500/15 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {guest.status}
                        </span>
                      </td>

                      {isAdmin && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip title={guest.status === "presente" ? "Desmarcar Presença" : "Marcar Presença"}>
                              <button
                                onClick={() => handleToggleGuestPresence(guest)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                                  guest.status === "presente"
                                    ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                                    : "bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-80"
                                }`}
                              >
                                {guest.status === "presente" ? "Presente ✓" : "Check-in"}
                              </button>
                            </Tooltip>

                            <Tooltip title="Remover Inscrição (libera 1 vaga)">
                              <button
                                onClick={() => handleDeleteGuest(guest)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button
            onClick={() => setGuestsModalOpen(false)}
            variant="contained"
            className="!bg-[var(--accent)] !text-white !capitalize !rounded-xl text-xs"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* DIÁLOGO: CONFIRMAR EXCLUSÃO DE EVENTO                     */}
      {/* ======================================================== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "var(--surface)",
            color: "var(--text)",
            borderRadius: 3,
            border: "1px solid var(--surface-border)",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "var(--text)", fontWeight: 700 }}>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-[var(--muted)]">
            Tem certeza que deseja excluir o evento{" "}
            <strong className="text-[var(--text)]">{eventToDelete?.title}</strong>? Esta
            ação cancelará todas as inscrições registradas nele.
          </p>
        </DialogContent>
        <DialogActions className="gap-2 px-6 pb-4">
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            className="!text-xs !font-semibold !text-[var(--muted)] !capitalize"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteEvent}
            variant="contained"
            disabled={deleting}
            className="!bg-[var(--danger)] hover:!opacity-90 !text-white !font-semibold !px-4 !py-1.5 !rounded-xl !capitalize text-xs"
          >
            {deleting ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Excluir Evento"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
