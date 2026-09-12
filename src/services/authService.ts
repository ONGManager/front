import { api, getApiErrorMessage } from "./api";

export async function loginApi(email: string, password: string) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao fazer login"));
  }
}

export async function sendVerificationCodeApi(email: string, ongName?: string): Promise<{ message: string; expiresInSeconds: number }> {
  try {
    const { data } = await api.post("/auth/send-verification-code", { email, ongName });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao enviar código de verificação"));
  }
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
  code: string,
  ongName?: string,
  ongCnpj?: string,
) {
  try {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      code,
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

export async function updateProfileApi(data: {
  name?: string;
  email?: string;
  phone?: string;
  oldPassword?: string;
  newPassword?: string;
}) {
  try {
    const { data: response } = await api.patch("/auth/me", data);
    return response;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao atualizar perfil"));
  }
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  try {
    const { data } = await api.post<{ message: string }>("/auth/forgot-password", { email });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao solicitar recuperação de senha"));
  }
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<{ message: string }> {
  try {
    const { data } = await api.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao redefinir senha"));
  }
}
