"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  financialService,
  type Financial,
  type FinancialSummary,
} from "@/src/services/financialService";
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
  const [exportingFormat, setExportingFormat] = useState<"csv" | "pdf" | null>(
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

  const handleModalClose = (_event?: unknown, reason?: string) => {
    if (submitting) {
      return;
    }

    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      setModalOpen(false);
      return;
    }

    setModalOpen(false);
  };

  const handleExport = async (format: "csv" | "pdf") => {
    if (!ongId) return;
    try {
      setExportingFormat(format);
      const filter: any = {};
      if (filterType !== "all") filter.type = filterType;
      if (filterStatus !== "all") filter.status = filterStatus;

      const blob = await financialService.exportReport(ongId, format, filter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `relatorio_financeiro_${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      toast.success(`Relatório ${format.toUpperCase()} baixado com sucesso!`);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Erro ao exportar relatório em ${format.toUpperCase()}`,
      );
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold text-[var(--text)]">Financeiro</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Gerencie receitas, despesas, acompanhe o saldo em tempo real e exporte relatórios.
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outlined"
            onClick={() => handleExport("csv")}
            disabled={exportingFormat !== null}
            className="border-[var(--surface-border)]! text-[var(--text)]! hover:bg-[var(--surface-hover)]! normal-case font-medium text-xs sm:text-sm py-1.5 px-3"
            startIcon={
              exportingFormat === "csv" ? (
                <CircularProgress size={16} sx={{ color: "var(--text)" }} />
              ) : (
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )
            }
          >
            {exportingFormat === "csv" ? "Exportando CSV..." : "Exportar CSV"}
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleExport("pdf")}
            disabled={exportingFormat !== null}
            className="border-[var(--surface-border)]! text-[var(--text)]! hover:bg-[var(--surface-hover)]! normal-case font-medium text-xs sm:text-sm py-1.5 px-3"
            startIcon={
              exportingFormat === "pdf" ? (
                <CircularProgress size={16} sx={{ color: "var(--text)" }} />
              ) : (
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )
            }
          >
            {exportingFormat === "pdf" ? "Exportando PDF..." : "Exportar PDF"}
          </Button>

          <Button
            variant="contained"
            onClick={openCreateModal}
            className="bg-purple-600! hover:bg-purple-700! text-white cursor-pointer normal-case font-medium text-xs sm:text-sm py-1.5 px-4"
            startIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
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
                        className="bg-blue-500! hover:bg-blue-700! text-white!"
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => openDeleteDialog(financial)}
                        className="bg-red-500! hover:bg-red-700! text-white!"
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
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        preventClose={submitting}
      >
        <ModalHeader
          title={isEditMode ? "Editar Conta" : "Adicionar Nova Conta"}
          subtitle={
            isEditMode
              ? "Modifique os valores, categoria e status do lançamento financeiro."
              : "Registre um novo lançamento de receita ou despesa para a organização."
          }
          iconVariant="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onClose={handleModalClose}
          closeDisabled={submitting}
        />
        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <ModalButton
            type="button"
            variant="secondary"
            onClick={closeModal}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </ModalButton>
          <ModalButton
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="w-full sm:w-auto"
          >
            {isEditMode ? "Salvar Alterações" : "Adicionar Movimento"}
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* Modal de Excluir Movimento */}
      <ConfirmModal
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Excluir Movimento"
        description="Tem certeza que deseja excluir esse movimento financeiro? Essa ação não pode ser desfeita."
        itemName={
          financialToDelete
            ? `${financialToDelete.description} - ${formatCurrency(Number(financialToDelete.amount))}`
            : undefined
        }
        confirmText="Excluir Movimento"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
