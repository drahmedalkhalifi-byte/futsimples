"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-white px-4 py-3 shadow-xl shadow-black/5 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-primary font-bold text-base">{formatCurrency(Number(payload[0]?.value ?? 0))}</p>
    </div>
  );
}

interface RevenueChartProps {
  data: { mes: string; receita: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data.some((d) => d.receita > 0);
  const total = data.reduce((sum, d) => sum + d.receita, 0);

  return (
    <Card className="border border-border/40 shadow-sm shadow-black/5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Receita Mensal</CardTitle>
            <CardDescription className="mt-0.5 text-xs">Últimos 6 meses</CardDescription>
          </div>
          {hasData && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <TrendingUp className="w-3 h-3" />
              {formatCurrency(total)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.50 0.22 260)" stopOpacity={0.25} />
                    <stop offset="60%" stopColor="oklch(0.50 0.22 260)" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="oklch(0.50 0.22 260)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="oklch(0.905 0.010 250)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.50 0.022 255)", fontWeight: 500 }}
                  dy={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.50 0.022 255)" }}
                  tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "oklch(0.50 0.22 260)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="oklch(0.50 0.22 260)"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "oklch(0.50 0.22 260)", stroke: "white", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <TrendingUp className="w-10 h-10 opacity-20" />
            <p className="text-sm">Nenhum pagamento recebido ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
