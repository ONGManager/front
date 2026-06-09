"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  financialService,
  type Financial,
  type FinancialSummary,
} from "@/src/services/financialService";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { toast } from "sonner";

export default function Bill() {
  const router = useRouter();

  // Estados principais
  const [financials, setFinancials] = useState<Financial[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [filterType, setFilterType] = useState<"all" | "receita" | "despesa">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pendente" | "confirmado"
  >("all");
  const [ongId, setOngId] = useState<string>("");

  // Estados do Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingFinancialId, setEditingFinancialId] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [financialToDelete, setFinancialToDelete] = useState<Financial | null>(
    null,
  );
  const [formData, setFormData] = useState({
    description: "",
    type: "despesa" as "receita" | "despesa",
    amount: "",
    category: "outro",
    date: new Date().toISOString().split("T")[0],
    status: "confirmado" as "pendente" | "confirmado",
    notes: "",
  });

  // Carrega a ONG do localStorage e monitora filtros para atualizar a lista
  useEffect(() => {
    const storedOngId = localStorage.getItem("selectedOngId");
    if (!storedOngId) {
      router.push("/OngSelector");
      return;
    }
    setOngId(storedOngId);
    loadData(storedOngId);
  }, [router, filterType, filterStatus]);

  // Função única para buscar dados do backend
  const loadData = async (currentOngId: string) => {
    try {
      setLoading(true);
      const filter: any = {};
      if (filterType !== "all") filter.type = filterType;
      if (filterStatus !== "all") filter.status = filterStatus;

      const result = await financialService.list(currentOngId, 0, 100, filter);
      setFinancials(result.data);

      const summaryData = await financialService.summary(currentOngId);
      setSummary(summaryData);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      toast.error("Erro ao carregar contas");
    } finally {
      setLoading(false);
    }
  };

  // Funções de controle do Modal
  const openCreateModal = () => {
    setModalMode("create");
    setEditingFinancialId(null);
    setFormData({
      description: "",
      type: "despesa",
      amount: "",
      category: "outro",
      date: new Date().toISOString().split("T")[0],
      status: "confirmado",
      notes: "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode("create");
    setEditingFinancialId(null);
  };

  const openEditModal = (financial: Financial) => {
    setModalMode("edit");
    setEditingFinancialId(financial.id);
    setFormData({
      description: financial.description,
      type: financial.type,
      amount: formatMoneyInput(
        String(Math.round(Number(financial.amount) * 100)),
      ),
      category: financial.category,
      date: new Date(financial.date).toISOString().split("T")[0],
      status: financial.status,
      notes: financial.notes || "",
    });
    setModalOpen(true);
  };

  const openDeleteDialog = (financial: Financial) => {
    setFinancialToDelete(financial);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setFinancialToDelete(null);
  };

  const formatMoneyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    const amount = Number(digits) / 100;

    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const parseMoneyInput = (value: string) => {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number(normalized.replace(/[^\d.-]/g, ""));
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (!formData.amount || parseMoneyInput(formData.amount) <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Categoria é obrigatória");
      return;
    }

    setSubmitting(true);
    try {
      const basePayload = {
        description: formData.description,
        type: formData.type,
        amount: parseMoneyInput(formData.amount),
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes || undefined,
      };

      if (modalMode === "edit" && editingFinancialId) {
        await financialService.update(ongId, editingFinancialId, {
          ...basePayload,
          status: formData.status,
        });
        toast.success("Conta atualizada com sucesso!");
      } else {
        await financialService.create(ongId, basePayload);
        toast.success("Conta adicionada com sucesso!");
      }

      closeModal();
      loadData(ongId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar conta",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!financialToDelete) {
      return;
    }

    setDeleting(true);
    try {
      await financialService.delete(ongId, financialToDelete.id);
      toast.success("Movimento excluído com sucesso!");
      setDeleteDialogOpen(false);
      setFinancialToDelete(null);
      loadData(ongId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir movimento",
      );
    } finally {
      setDeleting(false);
    }
  };

  // Funções de formatação visual
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    return status === "confirmado"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getTypeColor = (type: string) => {
    return type === "receita" ? "text-green-600" : "text-red-600";
  };

  const isEditMode = modalMode === "edit";

  const handleModalClose = (_event: unknown, reason?: string) => {
    if (submitting) {
      return;
    }

    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      setModalOpen(false);
      return;
    }

    setModalOpen(false);
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold text-[var(--text)]">Contas a Pagar</h1>
      <p className="mt-2 text-[var(--text)]">
        Aqui você pode gerenciar as contas da sua ONG.
      </p>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-3xl p-6 text-center shadow-sm">
          <span className="uppercase text-xs font-semibold tracking-wider text-[var(--muted)] block mb-2">
            Total de receitas
          </span>
          <p className="text-3xl font-bold text-green-600">
            {summary ? formatCurrency(summary.totalReceitas) : "R$ 0,00"}
          </p>
          <p className="text-xs text-[var(--muted)] mt-2">
            {summary?.receitaCount || 0} lançamentos confirmados
          </p>
        </div>
        <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-3xl p-6 text-center shadow-sm">
          <span className="uppercase text-xs font-semibold tracking-wider text-[var(--muted)] block mb-2">
            Total de despesas
          </span>
          <p className="text-3xl font-bold text-red-600">
            {summary ? formatCurrency(summary.totalDespesas) : "R$ 0,00"}
          </p>
          <p className="text-xs text-[var(--muted)] mt-2">
            {summary?.despesaCount || 0} lançamentos confirmados
          </p>
        </div>
        <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-3xl p-6 text-center shadow-sm sm:col-span-2 lg:col-span-1">
          <span className="uppercase text-xs font-semibold tracking-wider text-[var(--muted)] block mb-2">
            Saldo
          </span>
          <p
            className={`text-3xl font-bold ${summary && summary.balance < 0 ? "text-red-600" : "text-green-600"}`}
          >
            {summary ? formatCurrency(summary.balance) : "R$ 0,00"}
          </p>
          <p className="text-xs text-[var(--muted)] mt-2">Receitas menos despesas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <label className="text-sm text-[var(--muted)] font-medium">Tipo:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="ml-2 px-3 py-1.5 bg-[var(--card)] border border-[var(--surface-border)] rounded text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="text-sm text-[var(--muted)] font-medium">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="ml-2 px-3 py-1.5 bg-[var(--card)] border border-[var(--surface-border)] rounded text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="contained"
            onClick={openCreateModal}
            className="bg-purple-600! hover:bg-purple-700! text-white cursor-pointer w-full md:w-auto"
          >
            Adicionar Conta
          </Button>
        </div>
      </div>

      {/* Grid de Contas */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--surface)] border-b-2 border-[var(--surface-border)]">
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">
                Tipo
              </th>
              <th className="px-4 py-3 text-right text-[var(--text)] font-semibold">
                Valor
              </th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">
                Data
              </th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">
                Notas
              </th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-[var(--muted)]"
                >
                  Carregando...
                </td>
              </tr>
            ) : financials.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-[var(--muted)]"
                >
                  Nenhuma conta encontrada
                </td>
              </tr>
            ) : (
              financials.map((financial) => (
                <tr
                  key={financial.id}
                  className="border-b border-[var(--surface-border)] hover:bg-[var(--surface)] transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--text)]">
                    {financial.description}
                  </td>
                  <td className="px-4 py-3 text-[var(--text)]">
                    <span className="px-2 py-1 bg-[var(--surface)] rounded text-xs">
                      {financial.category}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${getTypeColor(financial.type)}`}
                  >
                    {financial.type === "receita" ? "+ Receita" : "- Despesa"}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${getTypeColor(financial.type)}`}
                  >
                    {formatCurrency(Number(financial.amount))}
                  </td>
                  <td className="px-4 py-3 text-[var(--text)]">
                    {formatDate(financial.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(financial.status)}`}
                    >
                      {financial.status === "confirmado"
                        ? "Confirmado"
                        : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text)] text-sm max-w-xs truncate">
                    {financial.notes || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openEditModal(financial)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => openDeleteDialog(financial)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de adicionar conta */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={submitting}
        PaperProps={{
          sx: {
            bgcolor: "var(--surface)",
            color: "var(--text)",
            borderRadius: 2,
            border: "1px solid var(--surface-border)",
            minHeight: 400,
          },
        }}
      >
        <DialogTitle sx={{ color: "var(--text)" }}>
          {isEditMode ? "Editar Conta" : "Adicionar Nova Conta"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <div className="mt-4">
            <div className="flex flex-col gap-5">
              <TextField
                label="Descrição"
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                fullWidth
                required
                placeholder="Ex: Aluguel do espaço, Doação recebida"
                disabled={submitting}
                sx={{
                  "& .MuiInputLabel-root": { color: "var(--muted)" },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--text)",
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 1,
                    minHeight: 48,
                    "& fieldset": { borderColor: "var(--input-border)" },
                    "&:hover fieldset": { borderColor: "var(--input-hover)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--input-ring)",
                    },
                  },
                }}
              />

              <FormControl fullWidth sx={{ minHeight: 48 }}>
                <InputLabel sx={{ color: "var(--muted)" }}>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleFormChange("type", e.target.value)}
                  label="Tipo"
                  disabled={submitting}
                  sx={{
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 1,
                    minHeight: 48,
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
                  <MenuItem value="receita">+ Receita</MenuItem>
                  <MenuItem value="despesa">- Despesa</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Valor (R$)"
                type="text"
                inputMode="decimal"
                value={formData.amount}
                onChange={(e) =>
                  handleFormChange("amount", formatMoneyInput(e.target.value))
                }
                fullWidth
                required
                placeholder="0,00"
                disabled={submitting}
                sx={{
                  "& .MuiInputLabel-root": { color: "var(--muted)" },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--text)",
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 1,
                    minHeight: 48,
                    "& fieldset": { borderColor: "var(--input-border)" },
                    "&:hover fieldset": { borderColor: "var(--input-hover)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--input-ring)",
                    },
                  },
                }}
              />

              <FormControl fullWidth sx={{ minHeight: 48 }}>
                <InputLabel sx={{ color: "var(--muted)" }}>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  label="Status"
                  disabled={submitting}
                  sx={{
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 1,
                    minHeight: 48,
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
                  <MenuItem value="confirmado">Confirmado</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Categoria"
                value={formData.category}
                onChange={(e) => handleFormChange("category", e.target.value)}
                fullWidth
                required
                placeholder="Ex: Aluguel, Salário, Doação"
                disabled={submitting}
                sx={{
                  "& .MuiInputLabel-root": { color: "var(--muted)" },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--text)",
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 1,
                    minHeight: 48,
                    "& fieldset": { borderColor: "var(--input-border)" },
                    "&:hover fieldset": { borderColor: "var(--input-hover)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--input-ring)",
                    },
                  },
                }}
              />

              <TextField
                label="Data"
                type="date"
                value={formData.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
                sx={{
                  "& .MuiInputLabel-root": { color: "var(--muted)" },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--text)",
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 1,
                    minHeight: 48,
                    "& fieldset": { borderColor: "var(--input-border)" },
                    "&:hover fieldset": { borderColor: "var(--input-hover)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--input-ring)",
                    },
                  },
                }}
              />

              <TextField
                label="Notas (opcional)"
                value={formData.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Observações adicionais..."
                disabled={submitting}
                sx={{
                  "& .MuiInputLabel-root": { color: "var(--muted)" },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--text)",
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text)",
                    bgcolor: "var(--input)",
                    borderRadius: 1,
                    minHeight: 78,
                    "& fieldset": { borderColor: "var(--input-border)" },
                    "&:hover fieldset": { borderColor: "var(--input-hover)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--input-ring)",
                    },
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeModal}
            disabled={submitting}
            className="text-white text-sm font-medium px-4 rounded-sm hover:bg-red-700 bg-red-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="text-white text-sm font-medium px-4 rounded-sm hover:bg-blue-700 bg-blue-600"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <CircularProgress size={16} color="inherit" />
                Salvando...
              </span>
            ) : isEditMode ? (
              "Salvar alterações"
            ) : (
              "Adicionar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        disableEscapeKeyDown={deleting}
        PaperProps={{
          sx: {
            bgcolor: "var(--surface)",
            color: "var(--text)",
            borderRadius: 2,
            border: "1px solid var(--surface-border)",
          },
        }}
      >
        <DialogTitle sx={{ color: "var(--text)" }}>
          Excluir movimento
        </DialogTitle>
        <DialogContent>
          <p className="text-[var(--text)]">
            Tem certeza que deseja excluir esse movimento? Essa ação não pode
            ser desfeita.
          </p>
          {financialToDelete ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              {financialToDelete.description} -{" "}
              {formatCurrency(Number(financialToDelete.amount))}
            </p>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? (
              <span className="flex items-center gap-2">
                <CircularProgress size={16} color="inherit" />
                Excluindo...
              </span>
            ) : (
              "Excluir"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
