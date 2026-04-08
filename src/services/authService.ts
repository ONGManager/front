import { api, getApiErrorMessage } from "./api";

export async function loginApi(email: string, password: string) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao fazer login"));
  }
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
  ongName?: string,
  ongCnpj?: string,
) {
  try {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      ongName,
      ongCnpj,
    });

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao criar conta"));
  }
}

export async function getMeApi() {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch {
    return null;
  }
}

export async function logoutApi() {
  await api.post("/auth/logout");
}
