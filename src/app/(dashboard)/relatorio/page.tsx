"use client";

import { useState } from "react";
import {
  Printer, Loader2, TrendingUp, TrendingDown,
  Minus, Users, CheckCircle2, Clock, Receipt,
  ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { usePayments } from "@/hooks/use-payments";
import { useExpenses } from "@/hooks/use-expenses";
import { useAuth } from "@/contexts/auth-context";

// ─── helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  mensalidade: "Mensalidade",
  matricula: "Matrícula",
  arbitragem: "Taxa de Arbitragem",
  outros: "Outros",
};

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function fmtDate(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleDateString("pt-BR");
  if (typeof value === "object" && value !== null && "toDate" in value)
    return (value as { toDate: () => Date }).toDate().toLocaleDateString("pt-BR");
  if (typeof value === "string") { const [y, m, d] = value.split("-"); return `${d}/${m}/${y}`; }
  return "—";
}

// ─── sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, count, color = "text-foreground" }: {
  icon: React.ReactNode; title: string; count?: number; color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`${color}`}>{icon}</span>
      <h3 className={`text-base font-semibold ${color}`}>{title}</h3>
      {count !== undefined && (
        <span className="ml-auto text-xs font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-5 text-center text-sm text-muted-foreground">{text}</td>
    </tr>
  );
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden print:border print:rounded-none">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-2.5 font-medium text-xs uppercase tracking-wide text-muted-foreground bg-muted/40 ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({ children, right, muted, bold, green, red, amber }: {
  children: React.ReactNode; right?: boolean; muted?: boolean; bold?: boolean;
  green?: boolean; red?: boolean; amber?: boolean;
}) {
  return (
    <td className={`px-4 py-2.5 ${right ? "text-right" : ""} ${muted ? "text-muted-foreground" : ""} ${bold ? "font-semibold" : ""} ${green ? "text-emerald-500 font-semibold" : ""} ${red ? "text-red-400 font-semibold" : ""} ${amber ? "text-amber-400 font-semibold" : ""}`}>
      {children}
    </td>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RelatorioPage() {
  const now = new Date();
  const [selectedYear,     setSelectedYear]     = useState(now.getFullYear());
  const [selectedMonthNum, setSelectedMonthNum] = useState(now.getMonth() + 1);
  const selectedMonth = `${selectedYear}-${String(selectedMonthNum).padStart(2, "0")}`;

  function prevMonth() {
    if (selectedMonthNum === 1) { setSelectedMonthNum(12); setSelectedYear((y) => y - 1); }
    else setSelectedMonthNum((m) => m - 1);
  }
  function nextMonth() {
    if (selectedMonthNum === 12) { setSelectedMonthNum(1); setSelectedYear((y) => y + 1); }
    else setSelectedMonthNum((m) => m + 1);
  }

  const { user } = useAuth();
  const { students,  loading: loadingStudents  } = useStudents({ activeOnly: true });
  const { payments,  loading: loadingPayments  } = usePayments();
  const { expenses,  loading: loadingExpenses  } = useExpenses();
  const loading = loadingStudents || loadingPayments || loadingExpenses;

  // ── Derived data ────────────────────────────────────────────────────────────

  const [year, mon] = selectedMonth.split("-").map(Number);

  const monthPayments   = payments.filter((p) => p.month === selectedMonth);
  const paidPayments    = monthPayments.filter((p) => p.status === "pago");
  const pendingPayments = monthPayments.filter((p) => p.status === "pendente");

  const monthExpenses = expenses.filter((e) => {
    if (e.type === "recurring") return true;
    const d = e.date instanceof Date
      ? e.date
      : (e.date as { toDate?: () => Date })?.toDate?.() ?? new Date(e.date as string);
    return d.getFullYear() === year && d.getMonth() + 1 === mon;
  });

  const totalReceita   = paidPayments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalDespesas  = monthExpenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const totalPendente  = pendingPayments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const resultado      = totalReceita - totalDespesas;
  const totalFaturavel = totalReceita + totalPendente;
  const inadimplencia  = totalFaturavel > 0 ? (totalPendente / totalFaturavel) * 100 : 0;

  // Students by category (sorted)
  const categoryCounts: Record<string, number> = {};
  students.forEach((s) => { categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1; });
  const categoryEntries = Object.entries(categoryCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Relatório Mensal</h2>
          <p className="text-sm text-muted-foreground mt-1">Resumo financeiro e operacional da escolinha</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* ── Month navigator ── */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 print:hidden">
        <button
          onClick={prevMonth}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground capitalize">{MONTH_NAMES[selectedMonthNum - 1]}</p>
          <p className="text-xs text-muted-foreground">{selectedYear}</p>
        </div>
        <button
          onClick={nextMonth}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors"
          disabled={selectedYear === now.getFullYear() && selectedMonthNum === now.getMonth() + 1}
        >
          <ChevronRight className="w-4 h-4 disabled:opacity-30" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando relatório...</span>
        </div>
      ) : (

        <div className="space-y-8 print:space-y-6" id="report-content">

          {/* Print header */}
          <div className="hidden print:flex print:flex-col print:items-center print:text-center border-b pb-4 mb-2">
            <h1 className="text-2xl font-bold">Relatório Mensal</h1>
            <p className="text-base text-gray-600 capitalize">{monthLabel}</p>
            <p className="text-xs text-gray-400 mt-1">Gerado em {new Date().toLocaleDateString("pt-BR")} · FutSimples</p>
          </div>

          {/* ── 1. FINANCIAL OVERVIEW ── */}
          <section>
            <SectionHeader
              icon={<TrendingUp className="w-4 h-4" />}
              title={`Financeiro — ${monthLabel}`}
            />

            {/* 3 metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Receita */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-xs uppercase tracking-wide text-emerald-400/80 font-medium mb-1">Receita recebida</p>
                <p className="text-2xl font-black text-emerald-400 tabular-nums">{fmt(totalReceita)}</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {paidPayments.length} pagamento{paidPayments.length !== 1 ? "s" : ""} confirmado{paidPayments.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Despesas */}
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <p className="text-xs uppercase tracking-wide text-red-400/80 font-medium mb-1">Despesas</p>
                <p className="text-2xl font-black text-red-400 tabular-nums">{fmt(totalDespesas)}</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {monthExpenses.length} despesa{monthExpenses.length !== 1 ? "s" : ""}
                  {monthExpenses.some((e) => e.type === "recurring") ? " (incl. recorrentes)" : ""}
                </p>
              </div>

              {/* Resultado */}
              <div className={`rounded-xl border p-5 ${
                resultado > 0  ? "border-primary/30 bg-primary/5" :
                resultado < 0  ? "border-destructive/30 bg-destructive/5" :
                                 "border-border/50 bg-card"
              }`}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-1">Resultado</p>
                <p className={`text-2xl font-black tabular-nums ${
                  resultado > 0 ? "text-primary" : resultado < 0 ? "text-destructive" : "text-foreground"
                }`}>
                  {fmt(resultado)}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  {resultado > 0
                    ? <><TrendingUp  className="w-3.5 h-3.5 text-primary"      /><span className="text-xs text-primary">Superávit</span></>
                    : resultado < 0
                    ? <><TrendingDown className="w-3.5 h-3.5 text-destructive" /><span className="text-xs text-destructive">Déficit</span></>
                    : <><Minus        className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Neutro</span></>
                  }
                </div>
              </div>
            </div>

            {/* Receita vs Despesas bar */}
            {(totalReceita > 0 || totalDespesas > 0) && (
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Receita vs Despesas</p>
                  <p className="text-xs text-muted-foreground">
                    {totalReceita > 0 && totalDespesas > 0
                      ? `${Math.round((totalDespesas / totalReceita) * 100)}% de comprometimento`
                      : ""}
                  </p>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-emerald-500/70 transition-all"
                    style={{ width: "100%" }}
                  />
                  {totalReceita > 0 && (
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-red-500/70 transition-all"
                      style={{ width: `${Math.min(100, (totalDespesas / totalReceita) * 100)}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-emerald-400">Receita {fmt(totalReceita)}</span>
                  <span className="text-[10px] text-red-400">Despesas {fmt(totalDespesas)}</span>
                </div>
              </div>
            )}
          </section>

          {/* ── 2. INADIMPLÊNCIA ── */}
          {(monthPayments.length > 0) && (
            <section>
              <SectionHeader
                icon={<AlertCircle className="w-4 h-4" />}
                title="Inadimplência do Mês"
                color={inadimplencia > 30 ? "text-red-400" : inadimplencia > 0 ? "text-amber-400" : "text-emerald-400"}
              />
              <div className={`rounded-xl border p-5 ${
                inadimplencia > 30 ? "border-red-500/20 bg-red-500/5" :
                inadimplencia > 0  ? "border-amber-500/20 bg-amber-500/5" :
                                     "border-emerald-500/20 bg-emerald-500/5"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div>
                    <p className="text-3xl font-black tabular-nums text-foreground">{inadimplencia.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground mt-0.5">taxa de inadimplência</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Pendente</p>
                      <p className="font-bold text-amber-400 tabular-nums">{fmt(totalPendente)}</p>
                      <p className="text-xs text-muted-foreground">{pendingPayments.length} aluno{pendingPayments.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Total faturável</p>
                      <p className="font-bold text-foreground tabular-nums">{fmt(totalFaturavel)}</p>
                      <p className="text-xs text-muted-foreground">{monthPayments.length} lançamentos</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="flex-1 min-w-0">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${inadimplencia > 30 ? "bg-red-500" : "bg-amber-400"}`}
                        style={{ width: `${inadimplencia}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-emerald-400">Recebido {fmt(totalReceita)}</span>
                      <span className="text-[10px] text-amber-400">Pendente {fmt(totalPendente)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── 3. ALUNOS ── */}
          <section>
            <SectionHeader
              icon={<Users className="w-4 h-4 text-primary" />}
              title="Alunos Ativos"
              count={students.length}
              color="text-primary"
            />
            <TableWrapper>
              <thead>
                <tr><Th>Categoria</Th><Th right>Alunos</Th></tr>
              </thead>
              <tbody>
                {categoryEntries.length === 0
                  ? <EmptyRow cols={2} text="Nenhum aluno ativo" />
                  : categoryEntries.map(([cat, count]) => (
                      <tr key={cat} className="border-t border-border/30">
                        <Td bold>{cat}</Td>
                        <Td right muted>{count}</Td>
                      </tr>
                    ))
                }
                {categoryEntries.length > 0 && (
                  <tr className="border-t border-border/50 bg-muted/20">
                    <Td bold>Total</Td>
                    <Td right bold>{students.length}</Td>
                  </tr>
                )}
              </tbody>
            </TableWrapper>
          </section>

          {/* ── 4. PAGAMENTOS RECEBIDOS ── */}
          <section>
            <SectionHeader
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              title="Pagamentos Recebidos"
              count={paidPayments.length}
              color="text-emerald-500"
            />
            <TableWrapper>
              <thead>
                <tr><Th>Aluno</Th><Th>Tipo</Th><Th right>Valor</Th></tr>
              </thead>
              <tbody>
                {paidPayments.length === 0
                  ? <EmptyRow cols={3} text="Nenhum pagamento recebido neste mês" />
                  : paidPayments.map((p) => (
                      <tr key={p.id} className="border-t border-border/30">
                        <Td bold>{p.studentName}</Td>
                        <Td muted>{PAYMENT_TYPE_LABELS[p.type] ?? p.type}</Td>
                        <Td right green>{fmt(p.amount ?? 0)}</Td>
                      </tr>
                    ))
                }
                {paidPayments.length > 0 && (
                  <tr className="border-t border-border/50 bg-emerald-500/5">
                    <td colSpan={2} className="px-4 py-2.5 font-semibold text-sm">Total Recebido</td>
                    <td className="px-4 py-2.5 text-right font-black text-emerald-400 text-sm tabular-nums">{fmt(totalReceita)}</td>
                  </tr>
                )}
              </tbody>
            </TableWrapper>
          </section>

          {/* ── 5. PENDENTES ── */}
          {pendingPayments.length > 0 && (
            <section>
              <SectionHeader
                icon={<Clock className="w-4 h-4 text-amber-400" />}
                title="Pendentes / Inadimplentes"
                count={pendingPayments.length}
                color="text-amber-400"
              />
              <TableWrapper>
                <thead>
                  <tr>
                    <Th>Aluno</Th>
                    <Th>Tipo</Th>
                    <Th>Vencimento</Th>
                    <Th right>Valor</Th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((p) => (
                    <tr key={p.id} className="border-t border-border/30">
                      <Td bold>{p.studentName}</Td>
                      <Td muted>{PAYMENT_TYPE_LABELS[p.type] ?? p.type}</Td>
                      <Td muted>{fmtDate(p.dueDate)}</Td>
                      <Td right amber>{fmt(p.amount ?? 0)}</Td>
                    </tr>
                  ))}
                  <tr className="border-t border-border/50 bg-amber-500/5">
                    <td colSpan={3} className="px-4 py-2.5 font-semibold text-sm">Total Pendente</td>
                    <td className="px-4 py-2.5 text-right font-black text-amber-400 text-sm tabular-nums">{fmt(totalPendente)}</td>
                  </tr>
                </tbody>
              </TableWrapper>
            </section>
          )}

          {/* ── 6. DESPESAS ── */}
          <section>
            <SectionHeader
              icon={<Receipt className="w-4 h-4 text-red-400" />}
              title="Despesas do Mês"
              count={monthExpenses.length}
              color="text-red-400"
            />
            <TableWrapper>
              <thead>
                <tr><Th>Descrição</Th><Th>Tipo</Th><Th right>Valor</Th></tr>
              </thead>
              <tbody>
                {monthExpenses.length === 0
                  ? <EmptyRow cols={3} text="Nenhuma despesa neste mês" />
                  : monthExpenses.map((e) => (
                      <tr key={e.id} className="border-t border-border/30">
                        <Td bold>{e.description}</Td>
                        <Td muted>
                          {e.type === "recurring"
                            ? <span className="inline-flex items-center gap-1 text-xs bg-muted rounded px-1.5 py-0.5">Recorrente</span>
                            : "Pontual"
                          }
                        </Td>
                        <Td right red>{fmt(e.amount ?? 0)}</Td>
                      </tr>
                    ))
                }
                {monthExpenses.length > 0 && (
                  <tr className="border-t border-border/50 bg-red-500/5">
                    <td colSpan={2} className="px-4 py-2.5 font-semibold text-sm">Total Despesas</td>
                    <td className="px-4 py-2.5 text-right font-black text-red-400 text-sm tabular-nums">{fmt(totalDespesas)}</td>
                  </tr>
                )}
              </tbody>
            </TableWrapper>
          </section>

          {/* Print footer */}
          <div className="hidden print:block text-center text-xs text-gray-400 pt-4 border-t mt-6">
            FutSimples · {user?.name ?? ""} · Gerado em {new Date().toLocaleDateString("pt-BR")}
          </div>

        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; top: 0; left: 0; width: 100%; padding: 24px; background: white; color: black; }
          #report-content table { border-collapse: collapse; width: 100%; }
          #report-content td, #report-content th { border: 1px solid #e5e7eb; padding: 6px 12px; }
        }
      `}</style>

    </div>
  );
}
