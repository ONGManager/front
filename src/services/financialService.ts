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

export const financialService = {
  async list(
    ongId: string,
    skip?: number,
    take?: number,
    filter?: {
      type?: "receita" | "despesa";
      status?: "pendente" | "confirmado";
      category?: string;
    }
  ) {
    const response = await api.get(`/ong/${ongId}/financial`, {
      params: {
        skip: skip || 0,
        take: take || 10,
        ...filter,
      },
    });
    return response.data as {
      data: Financial[];
      total: number;
    };
  },

  async summary(ongId: string) {
    const response = await api.get(`/ong/${ongId}/financial/summary`);
    return response.data;
  },

  async create(ongId: string, data: Omit<Financial, "id" | "createdAt" | "updatedAt" | "ongId">) {
    const response = await api.post(`/ong/${ongId}/financial`, data);
    return response.data as Financial;
  },

  async update(ongId: string, id: string, data: Partial<Financial>) {
    const response = await api.put(`/ong/${ongId}/financial/${id}`, data);
    return response.data as Financial;
  },

  async delete(ongId: string, id: string) {
    const response = await api.delete(`/ong/${ongId}/financial/${id}`);
    return response.data;
  },
};
