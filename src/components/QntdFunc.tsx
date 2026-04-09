"use client";

import { useEffect, useState } from "react";
import { getOngMembersApi } from "@/src/services/ongService";

export default function QntdFunc() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCount() {
      try {
        const ongId = localStorage.getItem("selectedOngId");
        if (!ongId) {
          setError("ONG não selecionada");
          return;
        }

        const members = await getOngMembersApi(ongId);
        const total = Array.isArray(members) ? members.length : 0;
        setCount(total);
      } catch (err) {
        setError("Erro ao carregar quantidade de funcionários");
      } finally {
        setLoading(false);
      }
    }

    loadCount();
  }, []);

  if (loading) {
    return <span>Carregando...</span>;
  }

  if (error) {
    return <span>{error}</span>;
  }

  return <p>{count}</p>;
}
