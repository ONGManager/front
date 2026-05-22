import { api } from "./api";

export interface Financial {
  id: string;
  ongId: string;
  type: "receita" | "despesa";
  amount: number;
  description: string;
  category: string;
  date: string;
  status: "pendente" | "confirmado";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialListFilters {
  type?: "receita" | "despesa";
  status?: "pendente" | "confirmado";
  category?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: "date" | "amount" | "createdAt";
  orderDir?: "asc" | "desc";
}

export interface FinancialListResponse {
  data: Financial[];
  pagination: {
    total: number;
    skip: number;
    take: number;
  };
}

export interface FinancialSummary {
  totalReceitas: number;
  receitaCount: number;
  totalDespesas: number;
  despesaCount: number;
  balance: number;
}

export interface CreateFinancialInput {
  type: Financial["type"];
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
}

export interface UpdateFinancialInput {
  type?: Financial["type"];
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  status?: Financial["status"];
  notes?: string;
}

export const financialService = {
  async list(
    ongId: string,
    skip?: number,
    take?: number,
    filter?: FinancialListFilters,
  ): Promise<FinancialListResponse> {
    const response = await api.get(`/ong/${ongId}/financial`, {
      params: {
        skip: skip || 0,
        take: take || 10,
        ...filter,
      },
    });
    return response.data as FinancialListResponse;
  },

  async summary(
    ongId: string,
    query?: Pick<FinancialListFilters, "startDate" | "endDate">,
  ): Promise<FinancialSummary> {
    const response = await api.get(`/ong/${ongId}/financial/summary`, {
      params: query,
    });
    return response.data as FinancialSummary;
  },

  async create(ongId: string, data: CreateFinancialInput): Promise<Financial> {
    const response = await api.post(`/ong/${ongId}/financial`, data);
    return response.data as Financial;
  },

  async update(
    ongId: string,
    id: string,
    data: UpdateFinancialInput,
  ): Promise<Financial> {
    const response = await api.put(`/ong/${ongId}/financial/${id}`, data);
    return response.data as Financial;
  },

  async delete(ongId: string, id: string): Promise<{ message: string }> {
    const response = await api.delete(`/ong/${ongId}/financial/${id}`);
    return response.data as { message: string };
  },
};
