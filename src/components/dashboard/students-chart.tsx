"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

// Vibrant, distinct color palette
const PALETTE = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#ec4899", // pink
  "#14b8a6", // teal
  "#a78bfa", // purple-light
];

interface StudentsChartProps {
  data: { categoria: string; alunos: number }[];
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const n = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-xl border border-border/50 bg-white px-4 py-3 shadow-xl shadow-black/5 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="font-bold text-base" style={{ color: String(payload[0]?.fill ?? "#6366f1") }}>
        {n} aluno{n !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function StudentsChart({ data }: StudentsChartProps) {
  const hasData = data.some((d) => d.alunos > 0);
  const total = data.reduce((sum, d) => sum + d.alunos, 0);
  // Filter to only categories with students for a cleaner chart
  const filtered = hasData ? data.filter((d) => d.alunos > 0) : data;

  return (
    <Card className="border border-border/40 shadow-sm shadow-black/5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Alunos por Categoria</CardTitle>
            <CardDescription className="mt-0.5 text-xs">Distribuição atual</CardDescription>
          </div>
          {hasData && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Users className="w-3 h-3" />
              {total} alunos
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filtered}
                margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
                barCategoryGap="30%"
              >
                <defs>
                  {PALETTE.map((color, i) => (
                    <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.65} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="oklch(0.905 0.010 250)"
                  vertical={false}
                />
                <XAxis
                  dataKey="categoria"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.50 0.022 255)", fontWeight: 500 }}
                  dy={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.50 0.022 255)" }}
                  allowDecimals={false}
                  width={24}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.50 0.22 260 / 0.04)" }} />
                <Bar dataKey="alunos" radius={[8, 8, 0, 0]} maxBarSize={52}>
                  {filtered.map((_, index) => (
                    <Cell
                      key={index}
                      fill={`url(#barGrad${index % PALETTE.length})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Users className="w-10 h-10 opacity-20" />
            <p className="text-sm">Nenhum aluno cadastrado ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
