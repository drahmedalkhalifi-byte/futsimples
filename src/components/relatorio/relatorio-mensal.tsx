"use client";

import { useState } from "react";
import { FileText, Loader2, Printer } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value)
    return (value as { toDate: () => Date }).toDate();
  return null;
}

export function RelatorioPDF() {
  const { schoolId, schoolName } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!schoolId) return;
    setLoading(true);

    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = now.toLocaleString("pt-BR", { month: "long", year: "numeric" });

      // Fetch payments this month
      const [paidSnap, pendingSnap, studentsSnap] = await Promise.all([
        getDocs(query(collection(db, "payments"), where("schoolId", "==", schoolId), where("status", "==", "pago"), where("month", "==", month))),
        getDocs(query(collection(db, "payments"), where("schoolId", "==", schoolId), where("status", "==", "pendente"), where("month", "==", month))),
        getDocs(query(collection(db, "students"), where("schoolId", "==", schoolId), where("active", "==", true))),
      ]);

      const paid = paidSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Array<{ studentName: string; amount: number; paidAt?: unknown }>;
      const pending = pendingSnap.docs.map(d => ({ ...d.data(), id: d.id })) as Array<{ studentName: string; amount: number; dueDate?: unknown }>;

      const totalReceived = paid.reduce((s, p) => s + (p.amount ?? 0), 0);
      const totalPending = pending.reduce((s, p) => s + (p.amount ?? 0), 0);
      const activeStudents = studentsSnap.size;

      const paidRows = paid.map(p => `
        <tr>
          <td>${p.studentName}</td>
          <td style="text-align:right;color:#16a34a;font-weight:600">${formatCurrency(p.amount ?? 0)}</td>
          <td style="text-align:center">${toDate(p.paidAt)?.toLocaleDateString("pt-BR") ?? "—"}</td>
        </tr>`).join("");

      const pendingRows = pending.map(p => `
        <tr>
          <td>${p.studentName}</td>
          <td style="text-align:right;color:#dc2626;font-weight:600">${formatCurrency(p.amount ?? 0)}</td>
          <td style="text-align:center">${toDate(p.dueDate)?.toLocaleDateString("pt-BR") ?? "—"}</td>
        </tr>`).join("");

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Relatório ${monthLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
    h1 { font-size: 20px; font-weight: 700; color: #1d4ed8; }
    h2 { font-size: 14px; font-weight: 600; margin: 24px 0 8px; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb; }
    .meta { font-size: 12px; color: #6b7280; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .green { color: #16a34a; } .red { color: #dc2626; } .blue { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
    td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
    tr:last-child td { border-bottom: none; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>⚽ ${schoolName ?? "Escola de Futebol"}</h1>
      <p class="meta">Relatório Financeiro — ${monthLabel}</p>
    </div>
    <p class="meta">Gerado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
  </div>

  <div class="stats">
    <div class="stat">
      <p class="stat-label">Alunos ativos</p>
      <p class="stat-value blue">${activeStudents}</p>
    </div>
    <div class="stat">
      <p class="stat-label">Receita recebida</p>
      <p class="stat-value green">${formatCurrency(totalReceived)}</p>
    </div>
    <div class="stat">
      <p class="stat-label">A receber</p>
      <p class="stat-value red">${formatCurrency(totalPending)}</p>
    </div>
    <div class="stat">
      <p class="stat-label">Taxa de recebimento</p>
      <p class="stat-value blue">${totalReceived + totalPending > 0 ? Math.round((totalReceived / (totalReceived + totalPending)) * 100) : 0}%</p>
    </div>
  </div>

  ${paid.length > 0 ? `
  <h2>✅ Pagamentos Recebidos (${paid.length})</h2>
  <table>
    <thead><tr><th>Aluno</th><th style="text-align:right">Valor</th><th style="text-align:center">Data</th></tr></thead>
    <tbody>${paidRows}</tbody>
    <tfoot><tr><td colspan="2" style="text-align:right;font-weight:700;padding:10px 12px">Total: ${formatCurrency(totalReceived)}</td><td></td></tr></tfoot>
  </table>` : ""}

  ${pending.length > 0 ? `
  <h2>⏳ Pendentes (${pending.length})</h2>
  <table>
    <thead><tr><th>Aluno</th><th style="text-align:right">Valor</th><th style="text-align:center">Vencimento</th></tr></thead>
    <tbody>${pendingRows}</tbody>
    <tfoot><tr><td colspan="2" style="text-align:right;font-weight:700;padding:10px 12px">Total: ${formatCurrency(totalPending)}</td><td></td></tr></tfoot>
  </table>` : ""}

  <div class="footer">FutSimples · futsimples.netlify.app</div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>
        : <><FileText className="w-4 h-4" /><span className="hidden sm:inline">Relatório PDF</span><Printer className="w-4 h-4 sm:hidden" /></>
      }
    </button>
  );
}
