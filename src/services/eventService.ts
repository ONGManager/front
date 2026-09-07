import { api, getApiErrorMessage } from "./api";

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  location?: string | null;
  maxTickets: number;
  status: "ativo" | "encerrado" | "cancelado";
  inviteToken: string;
  hasLandingPage: boolean;
  landingTemplate?: "modern" | "warm" | "minimal" | null;
  primaryColor?: string | null;
  bannerUrl?: string | null;
  ctaText?: string | null;
  landingPageUrl?: string | null;
  ongId: string;
  totalGuests: number;
  checkedInGuests: number;
  remainingTickets: number;
  isSoldOut: boolean;
  inviteUrl: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EventGuest {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string | null;
  ticketCode: string;
  status: "confirmado" | "presente" | "cancelado";
  createdAt: string;
  updatedAt: string;
}

export interface PublicEvent {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  location?: string | null;
  maxTickets: number;
  totalGuests: number;
  remainingTickets: number;
  isSoldOut: boolean;
  status: "ativo" | "encerrado" | "cancelado";
  inviteToken: string;
  hasLandingPage?: boolean;
  landingTemplate?: "modern" | "warm" | "minimal" | null;
  primaryColor?: string | null;
  bannerUrl?: string | null;
  ctaText?: string | null;
  ong: {
    id: string;
    name: string;
    description?: string | null;
  };
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxTickets: number;
  hasLandingPage?: boolean;
  landingTemplate?: "modern" | "warm" | "minimal";
  primaryColor?: string;
  bannerUrl?: string;
  ctaText?: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  maxTickets?: number;
  status?: "ativo" | "encerrado" | "cancelado";
  hasLandingPage?: boolean;
  landingTemplate?: "modern" | "warm" | "minimal";
  primaryColor?: string;
  bannerUrl?: string;
  ctaText?: string;
}

export interface RegisterGuestPayload {
  name: string;
  email: string;
  phone?: string;
}

export interface RegisterGuestResponse {
  guest: EventGuest;
  event: {
    id: string;
    title: string;
    date: string;
    location?: string | null;
    ongName: string;
  };
}

export async function getEventsApi(ongId: string): Promise<EventItem[]> {
  try {
    const response = await api.get<EventItem[]>(`/ong/${ongId}/events`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao carregar eventos"));
  }
}

export async function getEventByIdApi(ongId: string, eventId: string): Promise<EventItem> {
  try {
    const response = await api.get<EventItem>(`/ong/${ongId}/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao buscar evento"));
  }
}

export async function createEventApi(ongId: string, data: CreateEventPayload): Promise<EventItem> {
  try {
    const response = await api.post<EventItem>(`/ong/${ongId}/events`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao cadastrar evento"));
  }
}

export async function updateEventApi(
  ongId: string,
  eventId: string,
  data: UpdateEventPayload
): Promise<EventItem> {
  try {
    const response = await api.put<EventItem>(`/ong/${ongId}/events/${eventId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao atualizar evento"));
  }
}

export async function deleteEventApi(ongId: string, eventId: string): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`/ong/${ongId}/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao excluir evento"));
  }
}

export async function getEventGuestsApi(
  ongId: string,
  eventId: string,
  params?: { search?: string; status?: string }
): Promise<EventGuest[]> {
  try {
    const response = await api.get<EventGuest[]>(`/ong/${ongId}/events/${eventId}/guests`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao carregar lista de convidados"));
  }
}

export async function updateGuestStatusApi(
  ongId: string,
  eventId: string,
  guestId: string,
  status: "confirmado" | "presente" | "cancelado"
): Promise<EventGuest> {
  try {
    const response = await api.patch<EventGuest>(
      `/ong/${ongId}/events/${eventId}/guests/${guestId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao atualizar status do convidado"));
  }
}

export async function deleteGuestApi(
  ongId: string,
  eventId: string,
  guestId: string
): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(
      `/ong/${ongId}/events/${eventId}/guests/${guestId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao remover convidado"));
  }
}

// ============================================
// SERVIÇOS PÚBLICOS (Para convidados / participantes / Landing Page)
// ============================================

export async function getPublicEventApi(token: string): Promise<PublicEvent> {
  try {
    const response = await api.get<PublicEvent>(`/events/public/${token}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao carregar dados do convite de evento"));
  }
}

export async function getPublicLandingPageApi(eventId: string): Promise<PublicEvent> {
  try {
    const response = await api.get<PublicEvent>(`/events/public/landing/${eventId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao carregar Landing Page do evento"));
  }
}

export async function registerPublicGuestApi(
  token: string,
  data: RegisterGuestPayload
): Promise<RegisterGuestResponse> {
  try {
    const response = await api.post<RegisterGuestResponse>(`/events/public/${token}/register`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao realizar inscrição no evento"));
  }
}
