'use client';

import { getKanbanTasksApi } from "@/src/services/kanbanService";
import { useEffect, useState } from "react";

export default function TaskFinish() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedOngId = localStorage.getItem("selectedOngId");
        if (!storedOngId) {
            setError("ONG não selecionada");
            setLoading(false);
            return;
        }

        const fetchTasks = async () => {
            try {
                const tasks = await getKanbanTasksApi(storedOngId);
                const total = Array.isArray(tasks) ? tasks.filter((t) => t.status === "concluido").length : 0;
                setCount(total);
            } catch (err) {
                setError("Erro ao buscar tarefas");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (loading) {
        return <p>...</p>;
    }

    if (error) {
        return <p>-</p>;
    }

    return (
        <p>{count !== null ? count : 0}</p>
    );
}