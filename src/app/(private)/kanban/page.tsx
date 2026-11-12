"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  ConfirmModal,
} from "@/src/components/Modal";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<KanbanTask | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    setDeadline(
      task.deadline
        ? new Date(
            new Date(task.deadline).getTime() -
              new Date(task.deadline).getTimezoneOffset() * 60000,
          )
            .toISOString()
            .split("T")[0]
        : "",
    );
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
          // Prazo às 18h locais evita que a data volte um dia ao converter para UTC
          deadline: deadline ? new Date(`${deadline}T18:00:00`).toISOString() : null,
          assignedToId: assignedToId ? assignedToId : null,
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
          // Prazo às 18h locais evita que a data volte um dia ao converter para UTC
          deadline: deadline ? new Date(`${deadline}T18:00:00`).toISOString() : null,
          assignedToId: assignedToId ? assignedToId : null,
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

  const openDeleteDialog = (task: KanbanTask) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    setDeleting(true);
    try {
      await deleteKanbanTaskApi(ongId, taskToDelete.id);
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
      toast.success("Tarefa excluída!");
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      toast.error("Erro ao excluir tarefa");
    } finally {
      setDeleting(false);
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

      <div className="flex flex-row overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 md:overflow-x-visible md:pb-0">
        {columns.map(({ key, color }) => (
          <div
            key={key}
            className={`bg-[var(--surface)] rounded-lg shadow p-4 border-t-4 ${color} w-[280px] shrink-0 md:w-auto md:shrink-1`}
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
                      <h3 className="font-medium text-[var(--text)] text-sm line-clamp-2">
                        {task.title}
                      </h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority]}`}
                      >
                        {priorityLabels[task.priority]}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-[var(--muted)] mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-[var(--muted)]">
                      <div>
                        {task.assignedTo && (
                          <span className="bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.5 rounded">
                            {task.assignedTo.name}
                          </span>
                        )}
                        {isTaskOverdue(task) && (
                          <span className="ml-1.5 bg-[var(--danger-soft)] text-[var(--danger)] px-1.5 py-0.5 rounded font-semibold">
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
                      <div className="mt-4 border-t border-[var(--surface-border)] pt-3 flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(task);
                          }}
                          className="text-white text-xs font-semibold px-2.5 py-1 rounded hover:bg-blue-700 bg-blue-600 cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(task);
                          }}
                          className="text-white text-xs font-semibold px-2.5 py-1 rounded hover:bg-red-700 bg-red-600 cursor-pointer"
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
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
      >
        <ModalHeader
          title={editingTask ? "Editar Tarefa" : "Nova Tarefa"}
          subtitle={
            editingTask
              ? "Atualize as informações, prazos e responsáveis da tarefa."
              : "Defina o escopo, prioridade e responsável para organizar o fluxo de trabalho."
          }
          iconVariant="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          onClose={() => setModalOpen(false)}
        />
        <ModalBody className="space-y-4">
          <TextField
            label="Título da Tarefa *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            placeholder="Ex: Elaborar relatório mensal de doações"
            sx={{
              "& .MuiInputLabel-root": { color: "var(--muted)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
              "& .MuiOutlinedInput-root": {
                color: "var(--text)",
                bgcolor: "var(--input)",
                borderRadius: 2,
                "& fieldset": { borderColor: "var(--input-border)" },
                "&:hover fieldset": { borderColor: "var(--input-hover)" },
                "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
              },
            }}
          />

          <TextField
            label="Descrição Detalhada"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Instruções, links ou critérios de entrega..."
            sx={{
              "& .MuiInputLabel-root": { color: "var(--muted)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
              "& .MuiOutlinedInput-root": {
                color: "var(--text)",
                bgcolor: "var(--input)",
                borderRadius: 2,
                "& fieldset": { borderColor: "var(--input-border)" },
                "&:hover fieldset": { borderColor: "var(--input-hover)" },
                "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
              },
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormControl fullWidth>
              <InputLabel sx={{ color: "var(--muted)" }}>Prioridade</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Prioridade"
                sx={{
                  color: "var(--text)",
                  bgcolor: "var(--input)",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--input-border)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--input-hover)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--input-ring)",
                  },
                }}
              >
                <MenuItem value="baixa">Baixa</MenuItem>
                <MenuItem value="media">Média</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="urgente">Urgente</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Prazo de Conclusão"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputLabel-root": { color: "var(--muted)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "var(--text)" },
                "& .MuiOutlinedInput-root": {
                  color: "var(--text)",
                  bgcolor: "var(--input)",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "var(--input-border)" },
                  "&:hover fieldset": { borderColor: "var(--input-hover)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                },
              }}
            />
          </div>

          <FormControl fullWidth>
            <InputLabel sx={{ color: "var(--muted)" }}>Responsável pela Tarefa</InputLabel>
            <Select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              label="Responsável pela Tarefa"
              sx={{
                color: "var(--text)",
                bgcolor: "var(--input)",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--input-border)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--input-hover)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--input-ring)",
                },
              }}
            >
              <MenuItem value="">Ninguém (Não atribuído)</MenuItem>
              {members.map((m) => (
                <MenuItem key={m.user.id} value={m.user.id}>
                  {m.user.name} (
                  {m.role === "admin"
                    ? "Admin"
                    : m.role === "finance_manager"
                      ? "Gestor Financeiro"
                      : "Voluntário"}
                  )
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <ModalButton
            type="button"
            variant="secondary"
            onClick={() => setModalOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </ModalButton>
          <ModalButton
            type="button"
            variant="primary"
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {editingTask ? "Salvar Alterações" : "Criar Tarefa"}
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* Modal de Detalhes da Tarefa */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
      >
        <ModalHeader
          title="Detalhes da Tarefa"
          subtitle={selectedTaskDetails ? selectedTaskDetails.title : "Informações completas e histórico"}
          iconVariant="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onClose={() => setDetailsModalOpen(false)}
        />
        <ModalBody className="space-y-5">
          {detailsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <CircularProgress size={28} sx={{ color: "var(--accent)" }} />
              <span className="text-sm font-medium text-[var(--muted)]">Carregando detalhes da tarefa...</span>
            </div>
          ) : selectedTaskDetails ? (
            <div className="space-y-5">
              {/* Título e Descrição */}
              <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                <h4 className="font-bold text-lg text-[var(--text)]">
                  {selectedTaskDetails.title}
                </h4>
                {selectedTaskDetails.description ? (
                  <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed whitespace-pre-line">
                    {selectedTaskDetails.description}
                  </p>
                ) : (
                  <p className="text-xs italic text-[var(--muted)]/70 mt-1">
                    Sem descrição detalhada.
                  </p>
                )}
              </div>

              {/* Cards de Métricas / Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                      selectedTaskDetails.status === "concluido"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        : selectedTaskDetails.status === "em_andamento"
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        : selectedTaskDetails.status === "aguardando_aprovacao"
                        ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {statusLabels[selectedTaskDetails.status] || selectedTaskDetails.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Prioridade
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                      selectedTaskDetails.priority === "urgente"
                        ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                        : selectedTaskDetails.priority === "alta"
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        : selectedTaskDetails.priority === "media"
                        ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                        : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {priorityLabels[selectedTaskDetails.priority] || selectedTaskDetails.priority}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Prazo
                  </span>
                  <span className="font-semibold text-xs text-[var(--text)]">
                    {selectedTaskDetails.deadline
                      ? new Date(selectedTaskDetails.deadline).toLocaleDateString("pt-BR")
                      : "Sem prazo"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Responsável
                  </span>
                  <span className="font-semibold text-xs text-[var(--text)] truncate block">
                    {selectedTaskDetails.assignedTo?.name || "Não atribuído"}
                  </span>
                </div>
              </div>

              {/* Histórico */}
              <div>
                <h5 className="font-bold text-sm text-[var(--text)] mb-2.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Histórico de Alterações
                </h5>
                {selectedTaskDetails.history.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] italic p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-center">
                    Nenhuma alteração registrada até o momento.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedTaskDetails.history.map((item) => (
                      <div
                        key={item.id}
                        className="border border-[var(--surface-border)] rounded-xl p-3 text-xs bg-[var(--surface-hover)] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text)]">
                            {historyActionLabels[item.action] || item.action}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]">
                            {new Date(item.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-[var(--muted)]">
                          Por: <strong className="text-[var(--text)]">{item.actor?.name || "Sistema"}</strong>
                          {item.previousStatus && item.newStatus ? (
                            <>
                              {" "}• De{" "}
                              <span className="font-medium text-[var(--text)]">{statusLabels[item.previousStatus] || item.previousStatus}</span>
                              {" "}para{" "}
                              <span className="font-medium text-[var(--text)]">{statusLabels[item.newStatus] || item.newStatus}</span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)] text-center py-6">Nenhum detalhe encontrado.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalButton
            variant="secondary"
            onClick={() => setDetailsModalOpen(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* Modal de Excluir Tarefa */}
      <ConfirmModal
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Tarefa"
        description="Tem certeza que deseja excluir essa tarefa? Essa ação não pode ser desfeita e removerá o histórico registrado."
        itemName={taskToDelete?.title}
        confirmText="Excluir Tarefa"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
