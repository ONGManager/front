'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { financialService, type Financial } from '@/src/services/financialService';
import Button from '@mui/material/Button';
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
} from '@mui/material';
import { toast } from 'sonner';

export default function Bill() {
  const router = useRouter();
  
  // Estados principais
  const [financials, setFinancials] = useState<Financial[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'confirmado'>('all');
  const [ongId, setOngId] = useState<string>('');

  // Estados do Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    type: 'despesa' as 'receita' | 'despesa',
    amount: '',
    category: 'outro',
    date: new Date().toISOString().split('T')[0],
    status: 'confirmado' as 'pendente' | 'confirmado',
    notes: '',
  });

  // Carrega a ONG do localStorage e monitora filtros para atualizar a lista
  useEffect(() => {
    const storedOngId = localStorage.getItem('selectedOngId');
    if (!storedOngId) {
      router.push('/OngSelector');
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
      if (filterType !== 'all') filter.type = filterType;
      if (filterStatus !== 'all') filter.status = filterStatus;

      const result = await financialService.list(currentOngId, 0, 100, filter);
      setFinancials(result.data);

      const summaryData = await financialService.summary(currentOngId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast.error('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  // Funções de controle do Modal
  const openModal = () => {
    setFormData({
      description: '',
      type: 'despesa',
      amount: '',
      category: 'outro',
      date: new Date().toISOString().split('T')[0],
      status: 'confirmado',
      notes: '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    if (!formData.category.trim()) {
      toast.error('Categoria é obrigatória');
      return;
    }

    setSubmitting(true);
    try {
      await financialService.create(ongId, {
        description: formData.description,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        status: formData.status,
        notes: formData.notes || undefined,
      });
      toast.success('Conta adicionada com sucesso!');
      closeModal();
      loadData(ongId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar conta');
    } finally {
      setSubmitting(false);
    }
  };

  // Funções de formatação visual
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    return status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getTypeColor = (type: string) => {
    return type === 'receita' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold text-[var(--text)]">Contas a Pagar</h1>
      <p className="mt-2 text-[var(--text)]">Aqui você pode gerenciar as contas da sua ONG.</p>

      {/* Cards de Resumo */}
      <div className="flex flex-row justify-between my-2 gap-4">
        <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-3xl p-4 mt-4 w-80 h-30 text-center">
          <span className="uppercase text-sm font-extralight text-[var(--muted)]">Total em aberto</span>
          <p className="text-3xl font-bold">{summary?.totalOpen ? formatCurrency(summary.totalOpen) : 'R$ 0,00'}</p>
          <p className="text-red-500 mt-2">{summary?.percentageChange || '0'}% desde o mês passado</p>
        </div>
        <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-3xl p-4 mt-4 w-80 h-30 text-center">
          <span className="uppercase text-sm font-extralight text-[var(--muted)]">Vencendo essa semana</span>
          <p className="text-3xl font-bold">{summary?.weeklyTotal ? formatCurrency(summary.weeklyTotal) : 'R$ 0,00'}</p>
          <p className="text-green-500 mt-2">{summary?.pendingCount || 0} contas pendentes</p>
        </div>
        <div className="bg-[var(--card)] border-2 border-[var(--surface-border)] rounded-3xl p-4 mt-4 w-80 h-30 text-center">
          <span className="uppercase text-sm font-extralight text-[var(--muted)]">Atrasados</span>
          <p className="text-3xl font-bold">{summary?.overdueTotal ? formatCurrency(summary.overdueTotal) : 'R$ 0,00'}</p>
          <p className="text-red-500 uppercase mt-2">Requer ação imediata</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex gap-4 items-center">
        <div>
          <label className="text-sm text-[var(--muted)]">Tipo:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="ml-2 px-3 py-1 bg-[var(--card)] border border-[var(--surface-border)] rounded text-[var(--text)]"
          >
            <option value="all">Todos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-[var(--muted)]">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="ml-2 px-3 py-1 bg-[var(--card)] border border-[var(--surface-border)] rounded text-[var(--text)]"
          >
            <option value="all">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
          </select>
        </div>
        <div className="ml-auto">
          <Button 
            variant="contained" 
            onClick={openModal}
            className="bg-purple-600! hover:bg-purple-700!"
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
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">Descrição</th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">Categoria</th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">Tipo</th>
              <th className="px-4 py-3 text-right text-[var(--text)] font-semibold">Valor</th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">Data</th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-[var(--text)] font-semibold">Notas</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                  Carregando...
                </td>
              </tr>
            ) : financials.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                  Nenhuma conta encontrada
                </td>
              </tr>
            ) : (
              financials.map((financial) => (
                <tr
                  key={financial.id}
                  className="border-b border-[var(--surface-border)] hover:bg-[var(--surface)] transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--text)]">{financial.description}</td>
                  <td className="px-4 py-3 text-[var(--text)]">
                    <span className="px-2 py-1 bg-[var(--surface)] rounded text-xs">
                      {financial.category}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${getTypeColor(financial.type)}`}>
                    {financial.type === 'receita' ? '+ Receita' : '- Despesa'}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${getTypeColor(financial.type)}`}>
                    {formatCurrency(Number(financial.amount))}
                  </td>
                  <td className="px-4 py-3 text-[var(--text)]">{formatDate(financial.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(financial.status)}`}>
                      {financial.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text)] text-sm max-w-xs truncate">
                    {financial.notes || '-'}
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
        onClose={closeModal}
        maxWidth="md"
        fullWidth
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
        <DialogTitle sx={{ color: "var(--text)" }}>Adicionar Nova Conta</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <div className="mt-4">
            <div className="flex flex-col gap-5">
              <TextField
                label="Descrição"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                fullWidth
                required
                placeholder="Ex: Aluguel do espaço, Doação recebida"
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
                    "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                  },
                }}
              />

              <FormControl fullWidth sx={{ minHeight: 48 }}>
                <InputLabel sx={{ color: "var(--muted)" }}>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  label="Tipo"
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
                label="Valor"
                type="number"
                value={formData.amount}
                onChange={(e) => handleFormChange('amount', e.target.value)}
                fullWidth
                required
                inputProps={{ step: '0.01', min: '0' }}
                placeholder="0.00"
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
                    "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                  },
                }}
              />

              <TextField
                label="Categoria"
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                fullWidth
                required
                placeholder="Ex: Aluguel, Salário, Doação"
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
                    "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                  },
                }}
              />

              <TextField
                label="Data"
                type="date"
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
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
                    "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
                  },
                }}
              />

              <FormControl fullWidth sx={{ minHeight: 48 }}>
                <InputLabel sx={{ color: "var(--muted)" }}>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  label="Status"
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
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="confirmado">Confirmado</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Notas (opcional)"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Observações adicionais..."
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
                    "&.Mui-focused fieldset": { borderColor: "var(--input-ring)" },
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
            {submitting ? 'Salvando...' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}