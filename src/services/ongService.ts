import { api, getApiErrorMessage } from "./api";

export async function getMyOngsApi() {
  try {
    const { data } = await api.get("/ong");
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao buscar ONGs"));
  }
}

export async function createOngApi(name: string, description?: string) {
  try {
    const { data } = await api.post("/ong", { name, description });
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
