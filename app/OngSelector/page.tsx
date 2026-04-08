"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPadrao from "../components/Login";
import Button from "@mui/material/Button";
import { getMyOngsApi } from "../lib/api";
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
    <div className="min-h-screen align-middle flex flex-col justify-center items-center">
      <LoginPadrao
        Titulo="Escolha a sua ONG"
        Subtitulo="Selecione qual você quer trabalhar!"
      ></LoginPadrao>
      <div className="flex flex-col items-center justify-center mt-4 mb-4 mx-auto w-98 min-h-50 bg-white border border-gray-300 rounded-2xl shadow-2xl p-8">
        {ongs.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Você ainda não participa de nenhuma ONG.
            </p>
            <Button
              variant="outlined"
              color="primary"
              href="/register"
              className="w-80 h-10"
            >
              Criar minha ONG
            </Button>
          </div>
        ) : (
          <>
            <div className="w-80">
              <span className="block text-start mb-2">ONG</span>
              <select
                value={selectedOng}
                onChange={(e) => setSelectedOng(e.target.value)}
                className="w-80 h-10 border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent hover:border-purple-600 mb-6"
              >
                <option value="">Selecione uma ONG</option>
                {ongs.map((ong) => (
                  <option key={ong.id} value={ong.id}>
                    {ong.name} ({ong.role === "admin" ? "Admin" : "Colaborador"}
                    )
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEnter}
              className="w-80 h-10 bg-purple-600! hover:bg-purple-700! text-white font-bold"
            >
              Entrar
            </Button>
          </>
        )}
      </div>
      <div className="flex">
        <p className="SubTitulo">Ainda não tem uma conta?</p>
        <a
          href="/register"
          className="text-xl text-purple-600 font-bold hover:text-purple-800 ml-2"
        >
          Criar minha ONG
        </a>
      </div>
    </div>
  );
}
