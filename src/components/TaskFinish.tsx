"use client";

import { useEffect, useState } from "react";
import { getKanbanTasksApi } from "@/src/services/kanbanService";

export default function TaskFinish() {
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

        const tasks = await getKanbanTasksApi(ongId);
        const total = Array.isArray(tasks)
          ? tasks.filter((t) => t.status === "concluido").length
          : 0;
        setCount(total);
      } catch (err) {
        setError("Erro ao carregar quantidade de tarefas concluídas");
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

  return <span>{count}</span>;
}
