"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
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
  getOngMembersApi,
  getOngApi,
  createVolunteerApi,
  updateMemberRoleApi,
  inactivateMemberApi,
  generateInviteApi,
} from "@/src/services/ongService";
import { getMeApi } from "@/src/services/authService";
import { validarSenhaForte } from "@/schema";

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

    if (password.length < 8 || password.length > 40 || !validarSenhaForte(password)) {
      toast.error("A senha deve ter de 8 a 40 caracteres, com letra maiúscula, minúscula, número e caractere especial");
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
      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="sm"
      >
        <ModalHeader
          title="Convidar Membro via Link"
          subtitle="Gere um link seguro para permitir a entrada de novos voluntários na organização."
          iconVariant="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
          onClose={() => setInviteModalOpen(false)}
        />
        <ModalBody className="space-y-4">
          {generatingInvite ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <CircularProgress size={28} sx={{ color: "var(--accent)" }} />
              <span className="text-sm font-medium text-[var(--muted)]">Gerando link seguro...</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Link de Convite
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 h-11 px-3.5 bg-[var(--input)] border border-[var(--input-border)] rounded-xl text-sm text-[var(--text)] select-all focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className={`h-11 px-4 rounded-xl font-semibold text-sm shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                      copied
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                <p className="font-bold mb-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informações do convite:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>O convite concede a função inicial de <strong>Voluntário</strong>.</li>
                  <li>Você poderá alterar o cargo do voluntário a qualquer momento nesta tela.</li>
                  <li>Se a pessoa já foi um membro inativado, aceitar o convite reativará o acesso dela.</li>
                </ul>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalButton
            variant="secondary"
            onClick={() => setInviteModalOpen(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* MODAL: Confirmação de Inativação (Regra de Negócio: Não Deletar, Apenas Inativar) */}
      <ConfirmModal
        open={inactivateModalOpen}
        onClose={() => !inactivating && setInactivateModalOpen(false)}
        onConfirm={handleConfirmInactivate}
        title="Inativar Membro"
        description={
          <span>
            Tem certeza que deseja inativar o acesso de{" "}
            <strong className="text-[var(--text)]">{memberToInactivate?.user.name}</strong>?
          </span>
        }
        warningNote={
          <span>
            <strong>Importante:</strong> O membro não será excluído do banco de dados, mas perderá o acesso imediato à ONG. O histórico de tarefas e registros permanecerá intacto.
          </span>
        }
        confirmText="Sim, Inativar"
        cancelText="Cancelar"
        variant="danger"
        loading={inactivating}
      />

      {/* MODAL: Cadastrar Voluntário Manualmente */}
      <Modal
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        maxWidth="sm"
        preventClose={submitting}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateVolunteer();
          }}
          className="flex flex-col"
        >
          <ModalHeader
            title="Cadastrar Novo Voluntário"
            subtitle="Crie um login direto para o voluntário acessar a ONG com a senha temporária definida abaixo."
            iconVariant="purple"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
            onClose={() => setModalOpen(false)}
            closeDisabled={submitting}
          />
          <ModalBody className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Eduardo da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                E-mail de Acesso <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="Ex: voluntario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Senha Temporária <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo de 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="w-full h-11 px-3.5 rounded-xl bg-[var(--input)] border border-[var(--input-border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-2xs"
              />
              <p className="text-[11px] text-[var(--muted)] mt-1.5">
                O voluntário poderá alterar esta senha posteriormente nas configurações de perfil.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalButton
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </ModalButton>
            <ModalButton
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full sm:w-auto"
            >
              Cadastrar Voluntário
            </ModalButton>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
