'use client';

import { useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { financialService, type Financial } from "@/src/services/financialService";

interface Grafico1Props {
  ongId: string;
}

const monthNames = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default function Grafico1({ ongId }: Grafico1Props) {
  const [financials, setFinancials] = useState<Financial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ongId) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const result = await financialService.list(ongId, 0, 100, {
          orderBy: "date",
          orderDir: "asc",
        });
        setFinancials(result.data);
      } catch (error) {
        console.error("Erro ao carregar gráfico financeiro", error);
        setFinancials([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [ongId]);

  const seriesData = useMemo(() => {
    if (financials.length === 0) {
      return [];
    }

    const monthsMap = new Map<string, number>();
    const currentYear = new Date().getFullYear();

    for (const item of financials) {
      const date = new Date(item.date);
      if (date.getFullYear() !== currentYear) {
        continue;
      }

      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const currentAmount = monthsMap.get(monthKey) ?? 0;
      monthsMap.set(
        monthKey,
        currentAmount + (item.type === "receita" ? item.amount : -item.amount),
      );
    }

    const sorted = Array.from(monthsMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    return sorted.map(([, value]) => Number(value.toFixed(2)));
  }, [financials]);

  const categories = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = new Set<string>();

    for (const item of financials) {
      const date = new Date(item.date);
      if (date.getFullYear() !== currentYear) continue;
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    }

    return Array.from(months)
      .sort()
      .map((value) => {
        const month = Number(value.split("-")[1]);
        return monthNames[month];
      });
  }, [financials]);

  const options: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
    },
    title: {
      text: "Fluxo financeiro da ONG",
      style: { color: "var(--text)" },
    },
    xAxis: {
      categories: categories.length ? categories : monthNames.slice(0, 6),
      labels: { style: { color: "var(--text)" } },
      title: { text: "Mês", style: { color: "var(--muted)" } },
    },
    yAxis: {
      title: { text: "Saldo (R$)", style: { color: "var(--text)" } },
      labels: { style: { color: "var(--text)" } },
    },
    series: [
      {
        name: "Saldo mensal",
        type: "column",
        data: seriesData.length ? seriesData : [0, 0, 0, 0, 0, 0],
        dataLabels: {
          enabled: true,
          style: { color: "var(--text)" },
          formatter: function () {
            return this.y ? `R$ ${this.y.toFixed(0)}` : "";
          },
        },
      },
    ],
    credits: { enabled: false },
    tooltip: {
      valuePrefix: "R$ ",
      pointFormat: "<span style=\"color:{point.color}\">\u25CF</span> {series.name}: <b>R$ {point.y:.2f}</b><br/>",
    },
  };

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center text-[var(--muted)]">
        Carregando gráfico...
      </div>
    );
  }

  if (!seriesData.length) {
    return (
      <div className="h-72 flex items-center justify-center text-[var(--muted)]">
        Sem dados financeiros suficientes para exibir o gráfico.
      </div>
    );
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
