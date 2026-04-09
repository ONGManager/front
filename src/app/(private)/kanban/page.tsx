"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { toast } from "sonner";
import {
  getKanbanTasksApi,
  getKanbanTaskDetailsApi,
  createKanbanTaskApi,
  updateTaskStatusApi,
  deleteKanbanTaskApi,
  updateKanbanTaskApi,
  KanbanTask,
  KanbanTaskDetails,
} from "@/src/services/kanbanService";
import { getOngMembersApi, getOngApi } from "@/src/services/ongService";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

const statusLabels: Record<string, string> = {
  a_fazer: "A Fazer",
  em_andamento: "Em Andamento",
  aguardando_aprovacao: "Aguardando Aprovação",
  concluido: "Concluído",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const priorityColors: Record<string, string> = {
  baixa: "bg-gray-200 text-gray-700",
  media: "bg-blue-200 text-blue-700",
  alta: "bg-orange-200 text-orange-700",
  urgente: "bg-red-200 text-red-700",
};

const historyActionLabels: Record<string, string> = {
  created: "criada",
  updated: "atualizada",
  status_changed: "status alterado",
};

export default function KanbanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [ongId, setOngId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] =
    useState<KanbanTaskDetails | null>(null);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("media");
  const [deadline, setDeadline] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  useEffect(() => {
    const storedOngId = localStorage.getItem("selectedOngId");
    if (!storedOngId) {
      router.push("/OngSelector");
      return;
    }
    setOngId(storedOngId);
    loadData(storedOngId);
  }, [router]);

  const loadData = async (ongId: string) => {
    try {
      const [tasksData, ongData, membersData] = await Promise.all([
        getKanbanTasksApi(ongId),
        getOngApi(ongId),
        getOngMembersApi(ongId),
      ]);
      setTasks(tasksData);
      setUserRole(ongData.userRole);
      setMembers(membersData);
    } catch (err) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userRole === "admin";

  const isTaskOverdue = (task: KanbanTask) => {
    if (!task.deadline || task.status === "concluido") {
      return false;
    }

    const nowInSaoPaulo = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    );
    const deadlineDate = new Date(task.deadline);

    return deadlineDate.getTime() < nowInSaoPaulo.getTime();
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("media");
    setDeadline("");
    setAssignedToId("");
    setModalOpen(true);
  };

  const openEditModal = (task: KanbanTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDeadline(task.deadline ? task.deadline.split("T")[0] : "");
    setAssignedToId(task.assignedTo?.id || "");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    try {
      if (editingTask) {
        const payload = {
          title,
          description,
          priority,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
          assignedToId: assignedToId || undefined,
        };
        console.log("[KANBAN_FORM][UPDATE] payload:", payload);
        console.log("[KANBAN_FORM][UPDATE] payload typeof:", typeof payload);

        const updated = await updateKanbanTaskApi(ongId, editingTask.id, {
          ...payload,
        });
        setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
        toast.success("Tarefa atualizada!");
      } else {
        const payload = {
          title,
          description,
          priority,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
          assignedToId: assignedToId || undefined,
        };
        console.log("[KANBAN_FORM][CREATE] payload:", payload);
        console.log("[KANBAN_FORM][CREATE] payload typeof:", typeof payload);

        const newTask = await createKanbanTaskApi(ongId, payload);
        setTasks([...tasks, newTask]);
        toast.success("Tarefa criada!");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar tarefa");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    try {
      await deleteKanbanTaskApi(ongId, taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success("Tarefa excluída!");
    } catch (err) {
      toast.error("Erro ao excluir tarefa");
    }
  };

  const handleDragStart = (task: KanbanTask) => {
    setDraggedTask(task);
  };

  const handleOpenDetails = async (taskId: string) => {
    try {
      setDetailsLoading(true);
      setDetailsModalOpen(true);

      const details = await getKanbanTaskDetailsApi(ongId, taskId);
      setSelectedTaskDetails(details);
    } catch (err) {
      setDetailsModalOpen(false);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao carregar detalhes da tarefa",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (
    status: "a_fazer" | "em_andamento" | "aguardando_aprovacao" | "concluido",
  ) => {
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    // Voluntário não pode mover para concluído ou a_fazer
    if (!isAdmin) {
      if (status === "concluido") {
        toast.error("Apenas admins podem marcar como concluído");
        setDraggedTask(null);
        return;
      }
      if (status === "a_fazer") {
        toast.error("Voluntários não podem mover tarefas para A Fazer");
        setDraggedTask(null);
        return;
      }
    }

    try {
      const updated = await updateTaskStatusApi(ongId, draggedTask.id, status);
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      toast.success("Status atualizado!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao atualizar status",
      );
    } finally {
      setDraggedTask(null);
    }
  };

  const columns: {
    key: "a_fazer" | "em_andamento" | "aguardando_aprovacao" | "concluido";
    color: string;
  }[] = [
    { key: "a_fazer", color: "border-gray-400" },
    { key: "em_andamento", color: "border-blue-400" },
    { key: "aguardando_aprovacao", color: "border-yellow-400" },
    { key: "concluido", color: "border-green-400" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Tarefas</h1>
          <p className="text-[var(--muted)]">
            Gerencie as tarefas da sua ONG
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="contained"
            onClick={openCreateModal}
            className="bg-purple-600! hover:bg-purple-700!"
          >
            Nova Tarefa
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(({ key, color }) => (
          <div
            key={key}
            className={`bg-[var(--surface)] rounded-lg shadow p-4 border-t-4 ${color}`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(key)}
          >
            <h2 className="font-semibold text-lg mb-4 text-[var(--text)]">
              {statusLabels[key]}
              <span className="ml-2 text-sm text-[var(--muted)]">
                ({tasks.filter((t) => t.status === key).length})
              </span>
            </h2>
            <div className="space-y-3 min-h-[200px]">
              {tasks
                .filter((t) => t.status === key)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => handleOpenDetails(task.id)}
                    className={`rounded-lg p-3 border cursor-move hover:shadow-md transition-shadow ${
                      isTaskOverdue(task)
                        ? "bg-[var(--danger-soft)] border-[var(--danger)]"
                        : "bg-[var(--surface-hover)] border-[var(--surface-border)]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-[var(--text)]">
                        {task.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}
                      >
                        {priorityLabels[task.priority]}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-[var(--muted)] mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-xs text-[var(--muted)]">
                      <div>
                        {task.assignedTo && (
                          <span className="bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-1 rounded">
                            {task.assignedTo.name}
                          </span>
                        )}
                        {isTaskOverdue(task) && (
                          <span className="ml-2 bg-[var(--danger-soft)] text-[var(--danger)] px-2 py-1 rounded font-semibold">
                            Atrasada
                          </span>
                        )}
                      </div>
                      {task.deadline && (
                        <span className="text-[var(--muted)]">
                          {new Date(task.deadline).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex justify-end gap-1 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(task);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm border-2 p-2 border-blue-600 hover:bg-blue-200 rounded-xl bg-blue-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm ml-2 border-2 p-2 border-red-600 hover:bg-red-200 rounded-xl bg-red-200"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de criar/editar tarefa */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Prioridade"
              >
                <MenuItem value="baixa">Baixa</MenuItem>
                <MenuItem value="media">Média</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="urgente">Urgente</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Prazo"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Atribuir para</InputLabel>
              <Select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                label="Atribuir para"
              >
                <MenuItem value="">Ninguém</MenuItem>
                {members.map((m) => (
                  <MenuItem key={m.user.id} value={m.user.id}>
                    {m.user.name} ({m.role === "admin" ? "Admin" : "Voluntário"}
                    )
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            className="bg-purple-600! hover:bg-purple-700!"
          >
            {editingTask ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhes da Tarefa</DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <p>Carregando detalhes...</p>
          ) : selectedTaskDetails ? (
            <div className="space-y-4 mt-2">
              <div>
                <h3 className="font-semibold text-lg text-[var(--text)]">
                  {selectedTaskDetails.title}
                </h3>
                {selectedTaskDetails.description && (
                  <p className="text-sm text-[var(--muted)] mt-1">
                    {selectedTaskDetails.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>Status:</strong>{" "}
                  {statusLabels[selectedTaskDetails.status]}
                </p>
                <p>
                  <strong>Prioridade:</strong>{" "}
                  {priorityLabels[selectedTaskDetails.priority]}
                </p>
                <p>
                  <strong>Prazo:</strong>{" "}
                  {selectedTaskDetails.deadline
                    ? new Date(selectedTaskDetails.deadline).toLocaleDateString(
                        "pt-BR",
                      )
                    : "Sem prazo"}
                </p>
                <p>
                  <strong>Responsável:</strong>{" "}
                  {selectedTaskDetails.assignedTo?.name || "Não atribuído"}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--text)] mb-2">
                  Histórico
                </h4>
                {selectedTaskDetails.history.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Sem histórico.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedTaskDetails.history.map((item) => (
                      <div
                        key={item.id}
                        className="border border-[var(--surface-border)] rounded p-2 text-sm bg-[var(--surface-hover)]"
                      >
                        <p>
                          <strong>Ação:</strong>{" "}
                          {historyActionLabels[item.action] || item.action}
                        </p>
                        <p>
                          <strong>Por:</strong> {item.actor?.name || "Sistema"}
                        </p>
                        <p>
                          <strong>De:</strong>{" "}
                          {item.previousStatus
                            ? statusLabels[item.previousStatus]
                            : "-"}
                        </p>
                        <p>
                          <strong>Para:</strong>{" "}
                          {item.newStatus ? statusLabels[item.newStatus] : "-"}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {new Date(item.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>Nenhum detalhe encontrado.</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
