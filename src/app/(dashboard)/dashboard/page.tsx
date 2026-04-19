"use client";

import { DollarSign, TrendingDown, TrendingUp, Users, AlertTriangle, Loader2, Trophy } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { StudentsChart } from "@/components/dashboard/students-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: "blue" | "amber" | "green" | "red" | "violet";
  sub?: string;
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-100",   icon: "bg-blue-500",   text: "text-blue-600"   },
  amber:  { bg: "bg-amber-50",  border: "border-amber-100",  icon: "bg-amber-500",  text: "text-amber-700"  },
  green:  { bg: "bg-emerald-50",border: "border-emerald-100",icon: "bg-emerald-500",text: "text-emerald-700" },
  red:    { bg: "bg-red-50",    border: "border-red-100",    icon: "bg-red-500",    text: "text-red-600"    },
  violet: { bg: "bg-violet-50", border: "border-violet-100", icon: "bg-violet-500", text: "text-violet-700" },
};

function StatCard({ title, value, icon: Icon, color, sub }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{title}</p>
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${c.icon} shrink-0 shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.text} leading-tight`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const {
    revenueThisMonth,
    expensesThisMonth,
    netThisMonth,
    activeStudents,
    pendingPayments,
    studentsByCategory,
    monthlyRevenue,
    loading,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  const netPositive = netThisMonth >= 0;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-sm shadow-primary/30">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Visão geral da escola</p>
        </div>
      </div>

      {/* Onboarding checklist — shown to new users until all steps done */}
      <OnboardingChecklist activeStudents={activeStudents} />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Alunos Ativos"        value={String(activeStudents)}          icon={Users}          color="blue"   />
        <StatCard title="Pgtos. Pendentes"      value={String(pendingPayments)}         icon={AlertTriangle}  color="amber"  />
        <StatCard title="Receita do Mês"        value={formatCurrency(revenueThisMonth)} icon={DollarSign}    color="green"  />
        <StatCard title="Despesas do Mês"       value={formatCurrency(expensesThisMonth)} icon={TrendingDown}  color="red"   />
        <StatCard
          title="Resultado Líquido"
          value={formatCurrency(netThisMonth)}
          icon={TrendingUp}
          color={netPositive ? "violet" : "red"}
          sub={netPositive ? "Saldo positivo" : "Saldo negativo"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={monthlyRevenue} />
        <StudentsChart data={studentsByCategory} />
      </div>

      {/* Financial summary */}
      <div className="rounded-2xl border border-border/40 bg-card shadow-sm shadow-black/5 p-6">
        <p className="text-base font-semibold text-foreground mb-5">Resumo Financeiro do Mês</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Receita */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Receita recebida</span>
              <span className="font-bold text-emerald-600">{formatCurrency(revenueThisMonth)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                style={{
                  width: revenueThisMonth + expensesThisMonth > 0
                    ? `${Math.min((revenueThisMonth / (revenueThisMonth + expensesThisMonth)) * 100, 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          {/* Despesas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Despesas</span>
              <span className="font-bold text-red-500">{formatCurrency(expensesThisMonth)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-700"
                style={{
                  width: revenueThisMonth + expensesThisMonth > 0
                    ? `${Math.min((expensesThisMonth / (revenueThisMonth + expensesThisMonth)) * 100, 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          {/* Resultado */}
          <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-center gap-1 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-6">
            <span className="text-sm text-muted-foreground font-medium">Resultado líquido</span>
            <span className={`text-2xl font-extrabold tracking-tight ${netPositive ? "text-emerald-600" : "text-red-500"}`}>
              {formatCurrency(netThisMonth)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
