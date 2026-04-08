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
} from "@mui/material";
import { toast } from "sonner";
import {
  getOngMembersApi,
  getOngApi,
  createVolunteerApi,
} from "@/src/services/ongService";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [ongId, setOngId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const [membersData, ongData] = await Promise.all([
        getOngMembersApi(ongId),
        getOngApi(ongId),
      ]);
      setMembers(membersData);
      setUserRole(ongData.userRole);

      // Se não for admin, redireciona
      if (ongData.userRole !== "admin") {
        toast.error("Acesso negado");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setName("");
    setEmail("");
    setPassword("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      await createVolunteerApi(ongId, { name, email, password });
      toast.success("Voluntário cadastrado com sucesso!");
      setModalOpen(false);
      loadData(ongId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao cadastrar voluntário",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Voluntários</h1>
          <p className="text-gray-600">Gerencie os membros da sua ONG</p>
        </div>
        <Button
          variant="contained"
          onClick={openModal}
          className="bg-purple-600! hover:bg-purple-700!"
        >
          Novo Voluntário
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Nome
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Email
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                Função
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">
                  {member.user.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {member.user.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {member.role === "admin" ? "Administrador" : "Voluntário"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum membro cadastrado
          </div>
        )}
      </div>

      {/* Modal de criar voluntário */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cadastrar Voluntário</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              helperText="Mínimo 6 caracteres"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            className="bg-purple-600! hover:bg-purple-700!"
            disabled={submitting}
          >
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
