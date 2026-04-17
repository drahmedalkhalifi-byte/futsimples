"use client";

import { useState } from "react";
import { Printer, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useStudents } from "@/hooks/use-students";
import { usePayments } from "@/hooks/use-payments";
import { useExpenses } from "@/hooks/use-expenses";
import { useAuth } from "@/contexts/auth-context";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  mensalidade: "Mensalidade",
  matricula: "Matrícula",
  arbitragem: "Taxa de Arbitragem",
  outros: "Outros",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleDateString("pt-BR");
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString("pt-BR");
  }
  if (typeof value === "string") {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }
  return "—";
}

export default function RelatorioPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonthNum, setSelectedMonthNum] = useState(now.getMonth() + 1); // 1-12
  const selectedMonth = `${selectedYear}-${String(selectedMonthNum).padStart(2, "0")}`;

  // Build year options: from 2024 to 2030
  const yearOptions: number[] = [];
  for (let y = 2030; y >= 2024; y--) yearOptions.push(y);

  const { user } = useAuth();
  const { students, loading: loadingStudents } = useStudents({ activeOnly: true });
  const { payments, loading: loadingPayments } = usePayments();
  const { expenses, loading: loadingExpenses } = useExpenses();

  const loading = loadingStudents || loadingPayments || loadingExpenses;

  // Filter by selected month
  const monthPayments = payments.filter((p) => p.month === selectedMonth);
  const paidPayments = monthPayments.filter((p) => p.status === "pago");
  const pendingPayments = monthPayments.filter((p) => p.status === "pendente");

  const [year, mon] = selectedMonth.split("-").map(Number);
  const monthExpenses = expenses.filter((e) => {
    if (e.type === "recurring") return true;
    const d = e.date instanceof Date ? e.date : (e.date as { toDate?: () => Date })?.toDate?.() ?? new Date(e.date as string);
    return d.getFullYear() === year && d.getMonth() + 1 === mon;
  });

  const totalReceita = paidPayments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalDespesas = monthExpenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const resultado = totalReceita - totalDespesas;

  // Students by category
  const categoryCounts: Record<string, number> = {};
  students.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1;
  });
  const categoryEntries = Object.entries(categoryCounts).filter(([, n]) => n > 0);

  const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Relatório Mensal</h2>
          <p className="text-sm text-muted-foreground mt-1">Resumo financeiro e de alunos do mês</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <Label className="text-xs">Mês</Label>
            <Select
              value={String(selectedMonthNum)}
              onValueChange={(val) => { if (val) setSelectedMonthNum(Number(val)); }}
            >
              <SelectTrigger className="w-36">
                <span className="text-sm">{MONTH_NAMES[selectedMonthNum - 1]}</span>
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ano</Label>
            <Select
              value={String(selectedYear)}
              onValueChange={(val) => { if (val) setSelectedYear(Number(val)); }}
            >
              <SelectTrigger className="w-24">
                <span className="text-sm">{selectedYear}</span>
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => window.print()} className="gap-2 self-end">
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
        </div>
      ) : (
        <div className="space-y-6 print:space-y-4" id="report-content">
          {/* Print header */}
          <div className="hidden print:block text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold">Relatório Mensal — {monthLabel}</h1>
            <p className="text-sm text-gray-500">Gerado em {new Date().toLocaleDateString("pt-BR")}</p>
          </div>

          {/* Financial summary */}
          <section>
            <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 print:hidden" />
              Resumo Financeiro — {monthLabel}
            </h3>
            <div className="grid grid-cols-3 gap-4 print:gap-2">
              <div className="rounded-lg border border-border/50 bg-card p-4 print:border print:rounded">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Receita</p>
                <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalReceita)}</p>
                <p className="text-xs text-muted-foreground mt-1">{paidPayments.length} pagamento{paidPayments.length !== 1 ? "s" : ""} recebido{paidPayments.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card p-4 print:border print:rounded">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Despesas</p>
                <p className="text-xl font-bold text-red-500 mt-1">{formatCurrency(totalDespesas)}</p>
                <p className="text-xs text-muted-foreground mt-1">{monthExpenses.length} despesa{monthExpenses.length !== 1 ? "s" : ""}</p>
              </div>
              <div className={`rounded-lg border p-4 print:border print:rounded ${resultado >= 0 ? "border-green-200/60 bg-green-50/50" : "border-destructive/30 bg-destructive/5"}`}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Resultado</p>
                <p className={`text-xl font-bold mt-1 ${resultado >= 0 ? "text-green-600" : "text-red-500"}`}>{formatCurrency(resultado)}</p>
                <p className="text-xs text-muted-foreground mt-1">{resultado >= 0 ? "Superávit" : "Déficit"}</p>
              </div>
            </div>
          </section>

          {/* Students summary */}
          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">Alunos Ativos — {students.length} total</h3>
            <div className="rounded-lg border border-border/50 overflow-hidden print:border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-2 font-medium text-muted-foreground">Categoria</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Alunos</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryEntries.length === 0 ? (
                    <tr><td colSpan={2} className="px-4 py-4 text-center text-muted-foreground">Nenhum aluno ativo</td></tr>
                  ) : (
                    categoryEntries.map(([cat, count]) => (
                      <tr key={cat} className="border-t border-border/30">
                        <td className="px-4 py-2 font-medium">{cat}</td>
                        <td className="px-4 py-2 text-right">{count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Paid payments */}
          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">Pagamentos Recebidos — {paidPayments.length}</h3>
            <div className="rounded-lg border border-border/50 overflow-hidden print:border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-2 font-medium text-muted-foreground">Aluno</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {paidPayments.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">Nenhum pagamento recebido neste mês</td></tr>
                  ) : (
                    paidPayments.map((p) => (
                      <tr key={p.id} className="border-t border-border/30">
                        <td className="px-4 py-2 font-medium">{p.studentName}</td>
                        <td className="px-4 py-2 text-muted-foreground">{PAYMENT_TYPE_LABELS[p.type] ?? p.type}</td>
                        <td className="px-4 py-2 text-right font-medium text-green-600">{formatCurrency(p.amount ?? 0)}</td>
                      </tr>
                    ))
                  )}
                  {paidPayments.length > 0 && (
                    <tr className="border-t border-border bg-muted/20">
                      <td colSpan={2} className="px-4 py-2 font-semibold">Total Recebido</td>
                      <td className="px-4 py-2 text-right font-bold text-green-600">{formatCurrency(totalReceita)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pending payments */}
          {pendingPayments.length > 0 && (
            <section>
              <h3 className="text-base font-semibold text-foreground mb-3">Pagamentos Pendentes — {pendingPayments.length}</h3>
              <div className="rounded-lg border border-amber-200/60 bg-amber-50/30 overflow-hidden print:border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-50/50 text-left">
                      <th className="px-4 py-2 font-medium text-muted-foreground">Aluno</th>
                      <th className="px-4 py-2 font-medium text-muted-foreground">Tipo</th>
                      <th className="px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">Vencimento</th>
                      <th className="px-4 py-2 font-medium text-muted-foreground text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments.map((p) => (
                      <tr key={p.id} className="border-t border-amber-200/40">
                        <td className="px-4 py-2 font-medium">{p.studentName}</td>
                        <td className="px-4 py-2 text-muted-foreground">{PAYMENT_TYPE_LABELS[p.type] ?? p.type}</td>
                        <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">{formatDate(p.dueDate)}</td>
                        <td className="px-4 py-2 text-right font-medium text-amber-600">{formatCurrency(p.amount ?? 0)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-amber-200 bg-amber-50/50">
                      <td colSpan={3} className="px-4 py-2 font-semibold">Total Pendente</td>
                      <td className="px-4 py-2 text-right font-bold text-amber-600">
                        {formatCurrency(pendingPayments.reduce((s, p) => s + (p.amount ?? 0), 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Expenses */}
          <section>
            <h3 className="text-base font-semibold text-foreground mb-3">Despesas do Mês — {monthExpenses.length}</h3>
            <div className="rounded-lg border border-border/50 overflow-hidden print:border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-2 font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {monthExpenses.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">Nenhuma despesa neste mês</td></tr>
                  ) : (
                    monthExpenses.map((e) => (
                      <tr key={e.id} className="border-t border-border/30">
                        <td className="px-4 py-2 font-medium">{e.description}</td>
                        <td className="px-4 py-2 text-muted-foreground">{e.type === "recurring" ? "Recorrente" : "Pontual"}</td>
                        <td className="px-4 py-2 text-right font-medium text-red-500">{formatCurrency(e.amount ?? 0)}</td>
                      </tr>
                    ))
                  )}
                  {monthExpenses.length > 0 && (
                    <tr className="border-t border-border bg-muted/20">
                      <td colSpan={2} className="px-4 py-2 font-semibold">Total Despesas</td>
                      <td className="px-4 py-2 text-right font-bold text-red-500">{formatCurrency(totalDespesas)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Print footer */}
          <div className="hidden print:block text-center text-xs text-gray-400 pt-4 border-t mt-6">
            Relatório gerado pelo FutSimples · {user?.name ?? ""}
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; top: 0; left: 0; width: 100%; padding: 20px; }
        }
      `}</style>
    </div>
  );
}
