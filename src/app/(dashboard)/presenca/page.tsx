"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ClipboardCheck, Loader2, CheckCircle2, XCircle,
  History, ChevronDown, ChevronUp, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudents } from "@/hooks/use-students";
import { useAttendance, type AttendanceEntry } from "@/hooks/use-attendance";
import type { StudentCategory } from "@/types";

const categories: StudentCategory[] = [
  "babyfoot","sub6","sub7","sub8","sub9","sub10","sub11","sub12","sub13","sub14","sub15",
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value)
    return (value as { toDate: () => Date }).toDate();
  if (typeof value === "string") return new Date(value);
  return null;
}

function formatDate(value: unknown): string {
  if (!value) return "—";
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function entryMonth(entry: AttendanceEntry): string {
  const d = toDate(entry.date);
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── HistoryCard ──────────────────────────────────────────────────────────────

function HistoryCard({ entry }: { entry: AttendanceEntry }) {
  const [expanded, setExpanded] = useState(false);
  const present = entry.records.filter((r) => r.present);
  const absent  = entry.records.filter((r) => !r.present);

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
            <ClipboardCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{formatDate(entry.date)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 mr-1">{entry.category}</Badge>
              {entry.coachName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
            {present.length} presentes
          </span>
          <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">
            {absent.length} ausentes
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/40 px-4 pb-3 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Presentes ({present.length})</p>
              {present.length === 0
                ? <p className="text-xs text-muted-foreground">Nenhum</p>
                : <ul className="space-y-1">
                    {present.map((r) => (
                      <li key={r.studentId} className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {r.studentName}
                      </li>
                    ))}
                  </ul>
              }
            </div>
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Ausentes ({absent.length})</p>
              {absent.length === 0
                ? <p className="text-xs text-muted-foreground">Nenhum</p>
                : <ul className="space-y-1">
                    {absent.map((r) => (
                      <li key={r.studentId} className="flex items-center gap-1.5 text-sm">
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        {r.studentName}
                      </li>
                    ))}
                  </ul>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PresencaPage() {
  const { saveAttendance, history, loadingHistory } = useAttendance();
  const [tab, setTab] = useState<"registrar" | "historico">("registrar");

  // ── Registrar tab state ───────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<StudentCategory>("sub9");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // ── Histórico tab filter state ────────────────────────────────────────────
  const defaultMonth = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  })();
  const [historyMonth, setHistoryMonth] = useState(defaultMonth);
  const [historyCategory, setHistoryCategory] = useState<string>("all");

  const { students, loading } = useStudents({ activeOnly: true, category: selectedCategory });

  // ── Filtered history ──────────────────────────────────────────────────────
  const filteredHistory = history
    .filter((entry) => {
      if (historyCategory !== "all" && entry.category !== historyCategory) return false;
      if (historyMonth && entryMonth(entry) !== historyMonth) return false;
      return true;
    })
    .sort((a, b) => {
      const da = toDate(a.date)?.getTime() ?? 0;
      const db = toDate(b.date)?.getTime() ?? 0;
      return db - da; // newest first
    });

  // ── Registrar helpers ─────────────────────────────────────────────────────
  function markAll(present: boolean) {
    const next: Record<string, boolean> = {};
    students.forEach((s) => (next[s.id] = present));
    setAttendance(next);
  }

  const presentCount  = students.filter((s) => attendance[s.id] === true).length;
  const absentCount   = students.filter((s) => attendance[s.id] === false).length;
  const markedCount   = presentCount + absentCount;
  const unmarkedCount = students.length - markedCount;

  async function handleSave() {
    if (!date) { toast.error("Selecione uma data."); return; }
    if (markedCount === 0) { toast.error("Marque a presença de pelo menos um aluno antes de salvar."); return; }

    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        present: attendance[s.id] ?? false,
      }));
      await saveAttendance({ date: new Date(date + "T12:00:00"), category: selectedCategory, records });
      const unmarkedMsg = unmarkedCount > 0
        ? ` (${unmarkedCount} não marcado${unmarkedCount !== 1 ? "s" : ""} salvo${unmarkedCount !== 1 ? "s" : ""} como ausente)`
        : "";
      toast.success(`Presença salva! ${presentCount} presente${presentCount !== 1 ? "s" : ""}, ${absentCount} ausente${absentCount !== 1 ? "s" : ""}.${unmarkedMsg}`);
      setAttendance({});
    } catch (err) {
      console.error("Erro ao salvar presença:", err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Erro ao salvar presença: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Presença</h2>
        <p className="text-sm text-muted-foreground mt-1">Registre e consulte a presença dos alunos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("registrar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "registrar" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Registrar
        </button>
        <button
          type="button"
          onClick={() => setTab("historico")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "historico" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <History className="w-4 h-4" />
          Histórico
          {history.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 text-primary text-xs px-1.5 py-0.5 font-semibold">{history.length}</span>
          )}
        </button>
      </div>

      {/* ── TAB: REGISTRAR ── */}
      {tab === "registrar" && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Data do treino</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => { if (val) { setSelectedCategory(val as StudentCategory); setAttendance({}); } }}
              >
                <SelectTrigger className="w-36">
                  <span className="text-sm">{selectedCategory}</span>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Carregando alunos...</span>
            </div>
          )}

          {!loading && students.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <ClipboardCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Nenhum aluno em {selectedCategory}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Cadastre alunos nesta categoria para registrar a presença.
              </p>
            </div>
          )}

          {!loading && students.length > 0 && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{students.length} aluno{students.length !== 1 ? "s" : ""}</span>
                <button onClick={() => markAll(true)} className="text-sm text-primary hover:underline">Marcar todos presentes</button>
                <button onClick={() => markAll(false)} className="text-sm text-muted-foreground hover:underline">Marcar todos ausentes</button>
              </div>

              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Aluno</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-center">Presença</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const isPresent = attendance[student.id];
                      const isMarked  = student.id in attendance;
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell><Badge variant="outline">{student.category}</Badge></TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setAttendance((prev) => ({ ...prev, [student.id]: true }))}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isMarked && isPresent ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "border border-border hover:bg-emerald-50 hover:text-emerald-700 text-muted-foreground"}`}
                              >
                                <CheckCircle2 className="w-4 h-4" /> Presente
                              </button>
                              <button
                                onClick={() => setAttendance((prev) => ({ ...prev, [student.id]: false }))}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isMarked && !isPresent ? "bg-red-100 text-red-700 border border-red-200" : "border border-border hover:bg-red-50 hover:text-red-700 text-muted-foreground"}`}
                              >
                                <XCircle className="w-4 h-4" /> Ausente
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-emerald-700 font-semibold">{presentCount} presentes</span>
                  <span className="text-red-600 font-semibold">{absentCount} ausentes</span>
                  {unmarkedCount > 0 && (
                    <span className="text-amber-600 font-medium">{unmarkedCount} não marcado{unmarkedCount !== 1 ? "s" : ""}</span>
                  )}
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Salvar Presença"}
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {/* ── TAB: HISTÓRICO ── */}
      {tab === "historico" && (
        <div className="space-y-4">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-border/50 bg-card">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Label htmlFor="histMonth">Mês</Label>
              <Input
                id="histMonth"
                type="month"
                value={historyMonth}
                onChange={(e) => setHistoryMonth(e.target.value)}
                className="w-full sm:w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select
                value={historyCategory}
                onValueChange={(val) => { if (val) setHistoryCategory(val); }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <span className="text-sm">{historyCategory === "all" ? "Todas" : historyCategory}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result count */}
          {!loadingHistory && history.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {filteredHistory.length} treino{filteredHistory.length !== 1 ? "s" : ""} encontrado{filteredHistory.length !== 1 ? "s" : ""}
              {historyCategory !== "all" && ` em ${historyCategory}`}
              {historyMonth && (() => {
                const [y, m] = historyMonth.split("-");
                const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });
                return ` — ${label}`;
              })()}
            </p>
          )}

          {loadingHistory && (
            <div className="flex items-center gap-2 py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Carregando histórico...</span>
            </div>
          )}

          {!loadingHistory && history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <History className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Nenhum registro ainda</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Os registros de presença aparecem aqui após serem salvos.
              </p>
            </div>
          )}

          {!loadingHistory && history.length > 0 && filteredHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <Search className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum treino encontrado com esses filtros.</p>
              <button
                onClick={() => { setHistoryMonth(defaultMonth); setHistoryCategory("all"); }}
                className="text-sm text-primary hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* History cards */}
          <div className="space-y-3">
            {filteredHistory.map((entry) => (
              <HistoryCard key={entry.id} entry={entry} />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
