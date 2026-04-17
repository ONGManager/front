'use client';

import { getKanbanTasksApi } from "@/src/services/kanbanService";
import { useEffect, useState } from "react";

export default function TaskFinish() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ongId, setOngId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasks = await getKanbanTasksApi(ongId as string);
                const total = Array.isArray(tasks) ? tasks.filter((t) => t.status === "concluido").length: 0;
                setCount(total);
            } catch (err) {
                setError("Erro ao buscar tarefas");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [ongId]);

    return(
        <p>{ongId}</p>
    )
}