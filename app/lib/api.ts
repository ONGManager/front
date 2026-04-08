const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message ?? "Erro ao fazer login");

  return data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
  ongName?: string,
  ongCnpj?: string,
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password, ongName, ongCnpj }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message ?? "Erro ao criar conta");

  return data;
}

export async function getMeApi() {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) return null;

  return res.json();
}

export async function logoutApi() {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

// ONG APIs
export async function getMyOngsApi() {
  const res = await fetch(`${API_URL}/ong`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Erro ao buscar ONGs");

  return res.json();
}

export async function createOngApi(name: string, description?: string) {
  const res = await fetch(`${API_URL}/ong`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, description }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message ?? "Erro ao criar ONG");

  return data;
}

export async function getOngApi(ongId: string) {
  const res = await fetch(`${API_URL}/ong/${ongId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Erro ao buscar ONG");

  return res.json();
}

export async function getOngMembersApi(ongId: string) {
  const res = await fetch(`${API_URL}/ong/${ongId}/members`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Erro ao buscar membros");

  return res.json();
}

// Kanban APIs
export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "a_fazer" | "em_andamento" | "concluido";
  deadline?: string;
  assignedTo?: { id: string; name: string; email: string };
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export async function getKanbanTasksApi(ongId: string): Promise<KanbanTask[]> {
  const res = await fetch(`${API_URL}/ong/${ongId}/kanban`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Erro ao buscar tarefas");

  return res.json();
}

export async function createKanbanTaskApi(
  ongId: string,
  data: {
    title: string;
    description?: string;
    priority?: string;
    deadline?: string;
    assignedToId?: string;
  },
): Promise<KanbanTask> {
  const res = await fetch(`${API_URL}/ong/${ongId}/kanban`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result.message ?? "Erro ao criar tarefa");

  return result;
}

export async function updateKanbanTaskApi(
  ongId: string,
  taskId: string,
  data: Partial<{
    title: string;
    description: string;
    priority: string;
    status: string;
    deadline: string;
    assignedToId: string;
  }>,
): Promise<KanbanTask> {
  const res = await fetch(`${API_URL}/ong/${ongId}/kanban/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result.message ?? "Erro ao atualizar tarefa");

  return result;
}

export async function updateTaskStatusApi(
  ongId: string,
  taskId: string,
  status: "a_fazer" | "em_andamento" | "concluido",
): Promise<KanbanTask> {
  const res = await fetch(`${API_URL}/ong/${ongId}/kanban/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result.message ?? "Erro ao atualizar status");

  return result;
}

export async function deleteKanbanTaskApi(ongId: string, taskId: string) {
  const res = await fetch(`${API_URL}/ong/${ongId}/kanban/${taskId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Erro ao excluir tarefa");

  return res.json();
}
