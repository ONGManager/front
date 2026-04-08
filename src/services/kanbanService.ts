import { api, getApiErrorMessage } from "./api";

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority: "baixa" | "media" | "alta" | "urgente";
  status: "a_fazer" | "em_andamento" | "aguardando_aprovacao" | "concluido";
  deadline?: string;
  assignedTo?: { id: string; name: string; email: string };
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export async function getKanbanTasksApi(ongId: string): Promise<KanbanTask[]> {
  try {
    const { data } = await api.get(`/ong/${ongId}/kanban`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao buscar tarefas"));
  }
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
  try {
    console.log("[KANBAN_SERVICE][CREATE] ongId:", ongId);
    console.log("[KANBAN_SERVICE][CREATE] payload:", data);
    console.log("[KANBAN_SERVICE][CREATE] payload typeof:", typeof data);

    const response = await api.post(`/ong/${ongId}/kanban`, data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("[KANBAN_SERVICE][CREATE] response status:", response.status);
    console.log("[KANBAN_SERVICE][CREATE] response data:", response.data);

    return response.data;
  } catch (error) {
    console.log("[KANBAN_SERVICE][CREATE] error:", error);
    throw new Error(getApiErrorMessage(error, "Erro ao criar tarefa"));
  }
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
  try {
    const response = await api.patch(`/ong/${ongId}/kanban/${taskId}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao atualizar tarefa"));
  }
}

export async function updateTaskStatusApi(
  ongId: string,
  taskId: string,
  status: "a_fazer" | "em_andamento" | "aguardando_aprovacao" | "concluido",
): Promise<KanbanTask> {
  try {
    const response = await api.patch(`/ong/${ongId}/kanban/${taskId}/status`, {
      status,
    });

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao atualizar status"));
  }
}

export async function deleteKanbanTaskApi(ongId: string, taskId: string) {
  try {
    const { data } = await api.delete(`/ong/${ongId}/kanban/${taskId}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Erro ao excluir tarefa"));
  }
}
