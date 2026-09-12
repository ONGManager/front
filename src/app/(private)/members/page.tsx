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
  CircularProgress,
} from "@mui/material";
import { toast } from "sonner";
import {
  getOngMembersApi,
  getOngApi,
  createVolunteerApi,
  updateMemberRoleApi,
  inactivateMemberApi,
  generateInviteApi,
} from "@/src/services/ongService";
import { getMeApi } from "@/src/services/authService";

interface Member {
  id: string;
  userId: string;
  role: "admin" | "finance_manager" | "member" | string;
  user: { id: string; name: string; email: string };
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [ongId, setOngId] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Modal Novo Voluntário
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal Convite por Link
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modal Inativar Membro
  const [inactivateModalOpen, setInactivateModalOpen] = useState(false);
  const [memberToInactivate, setMemberToInactivate] = useState<Member | null>(null);
  const [inactivating, setInactivating] = useState(false);

  // Loading para alteração de cargo específica
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // Filtro de busca
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedOngId = localStorage.getItem("selectedOngId");
    if (!storedOngId) {
      router.push("/OngSelector");
      return;
    }
    setOngId(storedOngId);
    loadData(storedOngId);
  }, [router]);

  const loadData = async (targetOngId: string) => {
    try {
      const [membersData, ongData, meData] = await Promise.all([
        getOngMembersApi(targetOngId),
        getOngApi(targetOngId),
        getMeApi(),
      ]);

      setMembers(membersData);
      setUserRole(ongData.userRole);
      if (meData?.id) {
        setCurrentUserId(meData.id);
      }

      // Se não for admin, redireciona
      if (ongData.userRole !== "admin") {
        toast.error("Acesso restrito a administradores da ONG");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Erro ao carregar dados dos membros");
    } finally {
      setLoading(false);
    }
  };

  const openVolunteerModal = () => {
    setName("");
    setEmail("");
    setPassword("");
    setModalOpen(true);
  };

  const handleCreateVolunteer = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve conter no mínimo 6 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      await createVolunteerApi(ongId, { name, email, password });
      toast.success("Voluntário cadastrado com sucesso!");
      setModalOpen(false);
      await loadData(ongId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao cadastrar voluntário",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Gerar Link de Convite
  const handleOpenInviteModal = async () => {
    setInviteModalOpen(true);
    setCopied(false);
    setGeneratingInvite(true);
    try {
      const data = await generateInviteApi(ongId);
      setInviteUrl(data.inviteUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar link de convite");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link de convite copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Não foi possível copiar o link automaticamente");
    }
  };

  // Alterar Cargo / Função
  const handleRoleChange = async (
    member: Member,
    newRole: "admin" | "finance_manager" | "member",
  ) => {
    if (member.role === newRole) return;

    setUpdatingRoleId(member.id);
    try {
      await updateMemberRoleApi(ongId, member.id, newRole);
      toast.success(`Cargo de ${member.user.name} atualizado com sucesso!`);
      // Atualiza localmente
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m)),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao atualizar cargo do membro",
      );
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Modal e Confirmação de Inativação (Soft Delete)
  const handleOpenInactivate = (member: Member) => {
    if (member.userId === currentUserId) {
      toast.error("Você não pode inativar a si mesmo");
      return;
    }
    setMemberToInactivate(member);
    setInactivateModalOpen(true);
  };

  const handleConfirmInactivate = async () => {
    if (!memberToInactivate) return;

    setInactivating(true);
    try {
      await inactivateMemberApi(ongId, memberToInactivate.id);
      toast.success(`${memberToInactivate.user.name} foi inativado(a) com sucesso.`);
      setInactivateModalOpen(false);
      setMemberToInactivate(null);
      await loadData(ongId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao inativar membro",
      );
    } finally {
      setInactivating(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "finance_manager":
        return "Gestor Financeiro";
      case "member":
      default:
        return "Voluntário";
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300 dark:border-purple-800";
      case "finance_manager":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "member":
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-3">
        <CircularProgress size={36} sx={{ color: "var(--accent)" }} />
        <p className="text-sm text-[var(--muted)]">Carregando membros da ONG...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            Gestão de Membros
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Gerencie permissões, altere cargos e convide voluntários para sua ONG.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            onClick={handleOpenInviteModal}
            className="border-purple-600! text-purple-600! hover:bg-purple-50! dark:hover:bg-purple-950/30! font-medium normal-case"
            startIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          >
            Link de Convite
          </Button>
          <Button
            variant="contained"
            onClick={openVolunteerModal}
            className="bg-purple-600! hover:bg-purple-700! text-white font-medium normal-case shadow-sm"
            startIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          >
            Novo Voluntário
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Métricas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--surface)] p-4 rounded-xl border border-[var(--card-border)] shadow-xs">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--input)] border border-[var(--input-border)] rounded-lg text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{filteredMembers.length} membro(s) ativo(s)</span>
        </div>
      </div>

      {/* Tabela de Membros */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--card-border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-head)] border-b border-[var(--surface-border)] text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
                <th className="px-6 py-4">Membro</th>
                <th className="px-6 py-4">Cargo / Função</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)] text-sm">
              {filteredMembers.map((member) => {
                const isSelf = member.userId === currentUserId;
                const isUpdatingThisRole = updatingRoleId === member.id;

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-[var(--surface-hover)] transition-colors group"
                  >
                    {/* Membro */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-sm border border-purple-200 dark:border-purple-800 shrink-0">
                          {member.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--text)] flex items-center gap-2">
                            {member.user.name}
                            {isSelf && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                                Você
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cargo / Função com Dropdown de Gestão */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isUpdatingThisRole ? (
                          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                            <CircularProgress size={16} sx={{ color: "var(--accent)" }} />
                            <span>Atualizando...</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  member,
                                  e.target.value as "admin" | "finance_manager" | "member",
                                )
                              }
                              disabled={isUpdatingThisRole}
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-[var(--input)] text-[var(--text)] ${getRoleBadgeStyle(
                                member.role,
                              )}`}
                            >
                              <option value="admin">Administrador</option>
                              <option value="finance_manager">Gestor Financeiro</option>
                              <option value="member">Voluntário</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--muted)]">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Ativo
                      </span>
                    </td>

                    {/* Ações: Inativar Membro (sem hard delete) */}
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="small"
                        onClick={() => handleOpenInactivate(member)}
                        disabled={isSelf}
                        title={
                          isSelf
                            ? "Você não pode inativar a si mesmo"
                            : "Inativar membro (desativa acesso sem apagar dados)"
                        }
                        className={`text-xs font-medium normal-case px-2.5 py-1 rounded-md transition-colors ${
                          isSelf
                            ? "text-gray-400 cursor-not-allowed opacity-50"
                            : "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        }`}
                        startIcon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        }
                      >
                        Inativar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 px-4">
            <svg className="w-12 h-12 mx-auto text-[var(--muted)] mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-base font-medium text-[var(--text)]">Nenhum membro encontrado</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Tente buscar com outro termo ou cadastre um novo membro.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: Gerar e Compartilhar Link de Convite */}
      <Dialog
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "var(--surface)",
            color: "var(--text)",
            borderRadius: 3,
            border: "1px solid var(--card-border)",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "var(--text)", fontWeight: 700, pb: 1 }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span>Convidar Membro via Link</span>
          </div>
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-[var(--muted)] mb-4">
            Envie este link para quem você deseja convidar. Ao acessar o link, o voluntário poderá aceitar o convite e fazer parte da organização.
          </p>

          {generatingInvite ? (
            <div className="flex items-center justify-center py-8 gap-3">
              <CircularProgress size={24} sx={{ color: "var(--accent)" }} />
              <span className="text-sm text-[var(--muted)]">Gerando link seguro...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-2.5 bg-[var(--input)] border border-[var(--input-border)] rounded-lg text-sm text-[var(--text)] select-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button
                  variant="contained"
                  onClick={handleCopyInviteLink}
                  className={`font-semibold normal-case px-4 py-2.5 rounded-lg shrink-0 transition-all ${
                    copied
                      ? "bg-emerald-600! hover:bg-emerald-700! text-white"
                      : "bg-purple-600! hover:bg-purple-700! text-white"
                  }`}
                  startIcon={
                    copied ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )
                  }
                >
                  {copied ? "Copiado!" : "Copiar Link"}
                </Button>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-900/40 text-xs text-purple-700 dark:text-purple-300">
                <p className="font-semibold mb-1">Informações do convite:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>O convite concede a função inicial de <strong>Voluntário</strong>.</li>
                  <li>Você poderá alterar o cargo do voluntário a qualquer momento nesta tela.</li>
                  <li>Se a pessoa já foi um membro inativado, aceitar o convite reativará o acesso dela.</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setInviteModalOpen(false)}
            className="text-[var(--text)] normal-case font-medium hover:bg-[var(--surface-hover)]"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Confirmação de Inativação (Regra de Negócio: Não Deletar, Apenas Inativar) */}
      <Dialog
        open={inactivateModalOpen}
        onClose={() => !inactivating && setInactivateModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "var(--surface)",
            color: "var(--text)",
            borderRadius: 3,
            border: "1px solid var(--card-border)",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "var(--text)", fontWeight: 700 }}>
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Inativar Membro</span>
          </div>
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-[var(--muted)] mb-3">
            Tem certeza que deseja inativar{" "}
            <strong className="text-[var(--text)]">
              {memberToInactivate?.user.name}
            </strong>
            ?
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold">Importante:</p>
            <p>
              O membro <strong>não será excluído</strong> do banco de dados, mas perderá o acesso imediato à ONG. O histórico de tarefas e registros permanecerá intacto.
            </p>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setInactivateModalOpen(false)}
            disabled={inactivating}
            className="text-[var(--text)] normal-case font-medium hover:bg-[var(--surface-hover)]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmInactivate}
            disabled={inactivating}
            className="bg-red-600! hover:bg-red-700! text-white normal-case font-medium px-4"
          >
            {inactivating ? "Inativando..." : "Sim, Inativar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Cadastrar Voluntário Manualmente */}
      <Dialog
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "var(--surface)",
            color: "var(--text)",
            borderRadius: 3,
            border: "1px solid var(--surface-border)",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ color: "var(--text)", fontWeight: 700 }}>
          Cadastrar Novo Voluntário
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <p className="text-xs text-[var(--muted)] mb-4">
            Crie um login direto para o voluntário acessar a ONG com a senha temporária definida abaixo.
          </p>
          <div className="space-y-4">
            <TextField
              label="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
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
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
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
              label="Senha de Acesso"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              helperText="Mínimo de 6 caracteres"
              FormHelperTextProps={{ sx: { color: "var(--muted)" } }}
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
        </DialogContent>
        <DialogActions className="gap-2 px-6 pb-4">
          <Button
            onClick={() => setModalOpen(false)}
            disabled={submitting}
            className="text-[var(--text)] normal-case font-medium hover:bg-[var(--surface-hover)]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateVolunteer}
            variant="contained"
            className="bg-purple-600! hover:bg-purple-700! text-white normal-case font-medium px-5"
            disabled={submitting}
          >
            {submitting ? "Cadastrando..." : "Cadastrar Voluntário"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
