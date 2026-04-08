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
  createKanbanTaskApi,
  updateTaskStatusApi,
  deleteKanbanTaskApi,
  updateKanbanTaskApi,
  KanbanTask,
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

export default function KanbanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [ongId, setOngId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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
          <h1 className="text-2xl font-bold text-gray-800">Tarefas</h1>
          <p className="text-gray-600">Gerencie as tarefas da sua ONG</p>
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
            className={`bg-white rounded-lg shadow p-4 border-t-4 ${color}`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(key)}
          >
            <h2 className="font-semibold text-lg mb-4 text-gray-700">
              {statusLabels[key]}
              <span className="ml-2 text-sm text-gray-400">
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
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">
                        {task.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}
                      >
                        {priorityLabels[task.priority]}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>
                        {task.assignedTo && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {task.assignedTo.name}
                          </span>
                        )}
                      </div>
                      {task.deadline && (
                        <span className="text-gray-400">
                          {new Date(task.deadline).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex justify-end gap-1 mt-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:text-red-800 text-sm ml-2"
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
    </div>
  );
}
