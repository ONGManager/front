"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPadrao from "../../../components/Login";
import Button from "@mui/material/Button";
import { getMyOngsApi } from "../../../services/ongService";
import { toast } from "sonner";

interface Ong {
  id: string;
  name: string;
  description?: string;
  role: string;
}

export default function OngSelector() {
  const router = useRouter();
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [selectedOng, setSelectedOng] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOngs() {
      try {
        const data = await getMyOngsApi();
        setOngs(data);
        if (data.length === 1) {
          setSelectedOng(data[0].id);
        }
      } catch (err) {
        toast.error("Erro ao carregar ONGs");
      } finally {
        setLoading(false);
      }
    }
    fetchOngs();
  }, []);

  const handleEnter = () => {
    if (!selectedOng) {
      toast.error("Selecione uma ONG");
      return;
    }
    localStorage.setItem("selectedOngId", selectedOng);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen align-middle flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[400px]">
        <LoginPadrao
          Titulo="Escolha a sua ONG"
          Subtitulo="Selecione qual você quer trabalhar!"
        />
        <div className="flex flex-col items-center justify-center mt-4 mb-4 mx-auto w-full min-h-[200px] bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 md:p-8">
          {ongs.length === 0 ? (
            <div className="text-center w-full">
              <p className="text-[var(--muted)] mb-4 text-sm">
                Você ainda não participa de nenhuma ONG.
              </p>
              <Button
                variant="outlined"
                color="primary"
                href="/register"
                className="w-full h-10 border-purple-600! text-purple-700! hover:bg-purple-100! font-bold cursor-pointer"
              >
                Criar minha ONG
              </Button>
            </div>
          ) : (
            <>
              <div className="w-full">
                <span className="block text-start mb-2 text-[var(--text)] text-sm font-medium">
                  ONG
                </span>
                <select
                  value={selectedOng}
                  onChange={(e) => setSelectedOng(e.target.value)}
                  className="w-full h-10 bg-[var(--input)] border-2 border-[var(--input-border)] text-[var(--text)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--input-ring)] focus:border-transparent hover:border-[var(--input-hover)] mb-6 cursor-pointer"
                >
                  <option value="">Selecione uma ONG</option>
                  {ongs.map((ong) => (
                    <option key={ong.id} value={ong.id}>
                      {ong.name} ({ong.role === "admin" ? "Admin" : "Colaborador"})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEnter}
                className="w-full h-10 bg-purple-600! hover:bg-purple-700! text-white font-bold cursor-pointer"
              >
                Entrar
              </Button>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
          <p className="SubTitulo mb-0!">Ainda não tem uma conta?</p>
          <a
            href="/register"
            className="text-base md:text-xl text-[var(--accent)] font-bold hover:opacity-80"
          >
            Criar minha ONG
          </a>
        </div>
      </div>
    </div>
  );
}
