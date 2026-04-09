'use client';

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function Grafico1() {
  const options: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
    },
    title: { 
        text: "Doações por mês",
        style: { color: "var(--text)" },
    },
    xAxis: {
      categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
      labels: { style: { color: "var(--text)" } },
    },
    yAxis: {
      title: { text: "Valor (R$)" },
      labels: { style: { color: "var(--text)" } },
    },
    series: [
      {
        name: "Doações",
        type: "column",
        data: [1200, 1800, 900, 2100, 1600, 2300],
        dataLabels: { style: { color: "var(--text)" } },
      },
    ],
    credits: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
