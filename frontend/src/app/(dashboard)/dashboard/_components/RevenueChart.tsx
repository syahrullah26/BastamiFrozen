"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface RevenueChartProps {
  labels: string[];
  revenueData: number[];
  cashData: number[];
}

export default function RevenueChart({
  labels,
  revenueData,
  cashData,
}: RevenueChartProps) {
  const lineChartData = {
    labels: labels,
    datasets: [
      {
        label: "Gross Revenue",
        data: revenueData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Realized Cash",
        data: cashData,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          font: { size: 12, weight: "bold" as const },
        },
      },
    },
    scales: {
      y: {
        grid: { color: "rgba(244, 244, 245, 1)" },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div className="w-full h-87.5">
      <Line data={lineChartData} options={lineChartOptions} />
    </div>
  );
}
