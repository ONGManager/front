import { api, getApiErrorMessage } from "./api";

export async function getMyOngsApi() {
  try {
    const { data } = await api.get("/ong");
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao buscar ONGs"));
  }
}

export async function createOngApi(name: string, description?: string, cnpj?: string) {
  try {
    const { data } = await api.post("/ong", { name, description, cnpj });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao criar ONG"));
  }
}

export async function getOngApi(ongId: string) {
  try {
    const { data } = await api.get(`/ong/${ongId}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao buscar ONG"));
  }
}

export async function getOngMembersApi(ongId: string) {
  try {
    const { data } = await api.get(`/ong/${ongId}/members`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao buscar membros"));
  }
}

export async function createVolunteerApi(
  ongId: string,
  data: { name: string; email: string; password: string },
) {
  try {
    const response = await api.post(`/ong/${ongId}/volunteers`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao criar voluntário"));
  }
}

export async function generateInviteApi(ongId: string): Promise<{ inviteUrl: string; token: string; createdAt: string }> {
  try {
    const { data } = await api.post(`/ong/${ongId}/invites`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao gerar link de convite"));
  }
}

export async function getInviteDetailsApi(token: string): Promise<{
  ong: { id: string; name: string; description?: string };
  token: string;
}> {
  try {
    const { data } = await api.get(`/ong/invites/${token}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao buscar detalhes do convite"));
  }
}

export async function acceptInviteApi(token: string): Promise<{ message: string; ongId: string }> {
  try {
    const { data } = await api.post(`/ong/invites/${token}/join`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao aceitar convite"));
  }
}

export async function updateMemberRoleApi(
  ongId: string,
  memberId: string,
  role: "admin" | "finance_manager" | "member"
) {
  try {
    const { data } = await api.patch(`/ong/${ongId}/members/${memberId}/role`, { role });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao atualizar cargo do membro"));
  }
}

export async function inactivateMemberApi(ongId: string, memberId: string): Promise<{ message: string }> {
  try {
    const { data } = await api.delete(`/ong/${ongId}/members/${memberId}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao inativar membro"));
  }
}

export interface DashboardStats {
  totalMembers: number;
  completedTasks: number;
  pendingTasks: number;
  totalTasks: number;
  activeEvents: number;
  financial: {
    totalReceitas: number;
    totalDespesas: number;
    balance: number;
    totalTransactions: number;
  };
}

export async function getDashboardStatsApi(ongId: string): Promise<DashboardStats> {
  try {
    const { data } = await api.get(`/ong/${ongId}/dashboard-stats`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao carregar estatísticas do dashboard"));
  }
}


