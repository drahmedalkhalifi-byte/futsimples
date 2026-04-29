"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  Trash2,
  MessageCircle,
  RefreshCw,
  Send,
  Zap,
  AlertTriangle,
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
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWhatsAppNumber } from "@/lib/utils";
import { usePayments } from "@/hooks/use-payments";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/contexts/auth-context";
import { RelatorioPDF } from "@/components/relatorio/relatorio-mensal";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Payment, PaymentType, StudentCategory, PaymentRules } from "@/types";

// ─── Payment rules calculator ─────────────────────────────────────────────────

type PaymentAdjustment =
  | { type: "discount"; percent: number; finalAmount: number; saving: number }
  | { type: "fine";     fineFixed: number; fineDaily: number; days: number; finalAmount: number; extra: number }
  | { type: "normal";   finalAmount: number };

function calculateAdjustment(
  amount: number,
  dueDate: Date,
  rules: PaymentRules
): PaymentAdjustment {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due   = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays > 0 && diffDays >= rules.discountDaysBefore) {
    const saving      = parseFloat((amount * rules.discountPercent / 100).toFixed(2));
    const finalAmount = parseFloat((amount - saving).toFixed(2));
    return { type: "discount", percent: rules.discountPercent, finalAmount, saving };
  }

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    const fineFixed   = parseFloat((amount * rules.finePercent / 100).toFixed(2));
    const fineDaily   = parseFloat((amount * rules.fineDailyPercent / 100 * overdueDays).toFixed(2));
    const finalAmount = parseFloat((amount + fineFixed + fineDaily).toFixed(2));
    return { type: "fine", fineFixed, fineDaily, days: overdueDays, finalAmount, extra: parseFloat((fineFixed + fineDaily).toFixed(2)) };
  }

  return { type: "normal", finalAmount: amount };
}

const studentCategories: StudentCategory[] = [
  "babyfoot","sub6","sub7","sub8","sub9","sub10","sub11","sub12","sub13","sub14","sub15",
];

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  mensalidade: "Mensalidade",
  matricula: "Matrícula",
  arbitragem: "Taxa de Arbitragem",
  outros: "Outros",
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string") return new Date(value);
  return null;
}

type PaymentPriority = "overdue" | "today" | "future" | "paid";

function getPaymentPriority(dueDate: unknown, status: string): PaymentPriority {
  if (status === "pago") return "paid";
  const d = toDate(dueDate);
  if (!d) return "future";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "future";
}

const PRIORITY_ORDER: Record<PaymentPriority, number> = {
  overdue: 0, today: 1, future: 2, paid: 3,
};

// ─── Cobrados hoje (persisted in localStorage per day) ────────────────────────

function loadCobradosHoje(): Set<string> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(`futsimples-cobrados-${today}`);
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function persistCobradoHoje(id: string): void {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(`futsimples-cobrados-${today}`);
    const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem(`futsimples-cobrados-${today}`, JSON.stringify(arr));
    }
  } catch {}
}

// ─── WhatsApp URLs ─────────────────────────────────────────────────────────────

function whatsappUrl(
  studentName: string, guardian: string, phone: string,
  amount: number, dueDate: unknown, pixKey?: string,
  paymentRules?: PaymentRules,
  paymentType?: PaymentType
): string {
  const number = formatWhatsAppNumber(phone);
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const formattedDate = formatDate(dueDate);
  const pixLine = pixKey ? `\n\nChave PIX: *${pixKey}*` : "";

  let rulesLine = "";
  // Payment rules (discount/fine) only apply to mensalidade
  if (paymentRules?.enabled && dueDate && paymentType === "mensalidade") {
    const due = dueDate instanceof Date ? dueDate : (dueDate as { toDate?: () => Date })?.toDate?.() ?? new Date(dueDate as string);
    const adj = calculateAdjustment(amount, due, paymentRules);
    if (adj.type === "discount") {
      rulesLine = `\n\n*Pague até ${paymentRules.discountDaysBefore} dias antes e ganhe ${paymentRules.discountPercent}% de desconto: ${fmt(adj.finalAmount)}*\nNo vencimento: ${fmt(amount)}\nApos vencimento: multa de ${paymentRules.finePercent}% + ${paymentRules.fineDailyPercent}% ao dia`;
    } else if (adj.type === "fine") {
      rulesLine = `\n\n*Pagamento em atraso — ${adj.days} dia${adj.days !== 1 ? "s" : ""}*\nValor original: ${fmt(amount)}\nMulta: +${fmt(adj.extra)}\n*Total: ${fmt(adj.finalAmount)}*`;
    } else {
      rulesLine = `\n\nPagamento no vencimento: ${fmt(amount)}\nPague antes do dia ${formattedDate} para ganhar ${paymentRules.discountPercent}% de desconto: ${fmt(amount * (1 - paymentRules.discountPercent / 100))}`;
    }
  }

  const typeLabel: Record<string, string> = {
    mensalidade: "mensalidade",
    matricula: "matricula",
    arbitragem: "taxa de arbitragem",
    outros: "pagamento",
  };
  const label = typeLabel[paymentType ?? "mensalidade"] ?? "pagamento";

  const text = encodeURIComponent(
    `Ola, ${guardian}! A ${label} de *${studentName}* esta *pendente* no valor de *${fmt(amount)}* com vencimento em *${formattedDate}*.${rulesLine}${pixLine}\n\nContamos com voce para regularizar! Qualquer duvida, e so chamar.`
  );
  return `https://wa.me/${number}?text=${text}`;
}

function whatsappReceiptUrl(studentName: string, guardian: string, phone: string, amount: number): string {
  const number = formatWhatsAppNumber(phone);
  const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  const month = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
  const text = encodeURIComponent(
    `Ola, ${guardian}! Confirmamos o recebimento da mensalidade de *${studentName}* no valor de *${formattedAmount}* referente a *${month}*. Obrigado!`
  );
  return `https://wa.me/${number}?text=${text}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value);
}

function formatDate(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleDateString("pt-BR");
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString("pt-BR");
  }
  if (typeof value === "string") {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  return "—";
}

// ─── PaymentForm ─────────────────────────────────────────────────────────────

interface PaymentFormProps {
  onSubmit: (payment: Omit<Payment, "id" | "schoolId" | "createdAt" | "updatedAt">) => Promise<void>;
}

function PaymentForm({ onSubmit }: PaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [type, setType] = useState<PaymentType>("mensalidade");
  const [amount, setAmount] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);

  function defaultDueDate(): string {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.toISOString().slice(0, 10);
  }
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const { students } = useStudents({ activeOnly: true });

  const filteredStudents = categoryFilter
    ? students.filter((s) => s.category === categoryFilter)
    : students;

  // Students that will be billed when applyToAll is active
  const targetStudents = applyToAll ? filteredStudents : [];

  function handleTypeChange(val: PaymentType) {
    setType(val);
    if (val !== "arbitragem") setApplyToAll(false);
  }

  function handleCategoryChange(val: string) {
    setCategoryFilter(val);
    setStudentId(null);
  }

  function reset() {
    setStudentId(null);
    setCategoryFilter("");
    setType("mensalidade");
    setAmount("");
    setDueDate(defaultDueDate());
    setApplyToAll(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) { toast.error("Informe um valor válido."); return; }
    if (!dueDate) { toast.error("Informe a data de vencimento."); return; }

    // Batch mode: create payment for every student in the selected category
    if (applyToAll) {
      if (targetStudents.length === 0) { toast.error("Nenhum aluno encontrado para essa categoria."); return; }
      setSaving(true);
      try {
        for (const student of targetStudents) {
          await onSubmit({
            studentId: student.id,
            studentName: student.name,
            type,
            amount: parsedAmount,
            status: "pendente",
            dueDate: new Date(dueDate + "T12:00:00"),
            month: dueDate.slice(0, 7),
          });
        }
        setOpen(false);
        reset();
        toast.success(`${targetStudents.length} cobranças cadastradas!`);
      } catch {
        toast.error("Erro ao cadastrar cobranças. Tente novamente.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // Single student mode
    if (!studentId) { toast.error("Selecione um aluno."); return; }
    const student = students.find((s) => s.id === studentId);
    setSaving(true);
    try {
      await onSubmit({
        studentId,
        studentName: student?.name ?? "",
        type,
        amount: parsedAmount,
        status: "pendente",
        dueDate: new Date(dueDate + "T12:00:00"),
        month: dueDate.slice(0, 7),
      });
      setOpen(false);
      reset();
      toast.success("Pagamento cadastrado!");
    } catch {
      toast.error("Erro ao cadastrar pagamento. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        <Plus className="w-4 h-4" />
        Novo Pagamento
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
          <DialogDescription>Cadastre um pagamento para um aluno.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Arbitragem: option to apply to all categories */}
          {type === "arbitragem" && (
            <div
              onClick={() => setApplyToAll(!applyToAll)}
              className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                applyToAll ? "border-primary bg-primary/5" : "border-border/40 bg-muted/20"
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${applyToAll ? "text-primary" : "text-foreground"}`}>
                  Cobrar todos os alunos
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {applyToAll
                    ? `${targetStudents.length} aluno${targetStudents.length !== 1 ? "s" : ""} selecionado${targetStudents.length !== 1 ? "s" : ""}`
                    : "Aplica para toda uma categoria ou escola"}
                </p>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${applyToAll ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                {applyToAll && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{applyToAll ? "Categoria (obrigatório)" : "Categoria"}</Label>
            <Select value={categoryFilter} onValueChange={(val) => val !== null && handleCategoryChange(val)}>
              <SelectTrigger className="w-full"><SelectValue placeholder={applyToAll ? "Selecione uma categoria" : "Todas as categorias"} /></SelectTrigger>
              <SelectContent>
                {!applyToAll && <SelectItem value="">Todas as categorias</SelectItem>}
                {studentCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Show student selector only in single mode */}
          {!applyToAll && (
            <div className="space-y-2">
              <Label>Aluno</Label>
              <Select value={studentId ?? ""} onValueChange={(val) => setStudentId(val ?? null)}>
                <SelectTrigger className="w-full">
                  <span className={`flex-1 text-left text-sm truncate ${!studentId ? "text-muted-foreground" : ""}`}>
                    {studentId
                      ? (students.find((s) => s.id === studentId)?.name ?? "Selecione um aluno")
                      : "Selecione um aluno"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.length === 0
                    ? <SelectItem value="_empty" disabled>Nenhum aluno encontrado</SelectItem>
                    : filteredStudents.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(val) => { if (val != null) handleTypeChange(val as PaymentType); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensalidade">Mensalidade</SelectItem>
                  <SelectItem value="matricula">Matrícula</SelectItem>
                  <SelectItem value="arbitragem">Taxa de Arbitragem</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150.00" min="0.01" step="0.01" disabled={saving} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Vencimento</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={saving} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                : applyToAll
                  ? `Cadastrar para ${targetStudents.length} aluno${targetStudents.length !== 1 ? "s" : ""}`
                  : "Cadastrar"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── GerarMensalidades ────────────────────────────────────────────────────────

interface GerarMensalidadesProps {
  onGenerate: (payments: Omit<Payment, "id" | "schoolId" | "createdAt" | "updatedAt">[]) => Promise<void>;
}

function GerarMensalidades({ onGenerate }: GerarMensalidadesProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { students } = useStudents({ activeOnly: true });
  const { payments } = usePayments();

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PaymentType>("mensalidade");

  // Check how many students already have a payment of this type for the selected month
  const alreadyGenerated = payments.filter(
    (p) => p.month === month && p.type === type
  );
  const studentIdsWithPayment = new Set(alreadyGenerated.map((p) => p.studentId));
  const studentsWithout = students.filter((s) => !studentIdsWithPayment.has(s.id));
  const alreadyCount = students.length - studentsWithout.length;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) { toast.error("Informe um valor válido."); return; }
    if (!month) { toast.error("Selecione o mês de referência."); return; }
    if (studentsWithout.length === 0) {
      toast.error(`Todos os alunos já têm ${type} gerada para este mês.`);
      return;
    }

    const [year, mon] = month.split("-").map(Number);
    const dueDate = new Date(year, mon - 1, 10, 12, 0, 0);

    const payments: Omit<Payment, "id" | "schoolId" | "createdAt" | "updatedAt">[] = studentsWithout.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      type,
      amount: parsedAmount,
      status: "pendente",
      dueDate,
      month,
    }));

    setSaving(true);
    try {
      await onGenerate(payments);
      toast.success(`${studentsWithout.length} pagamento${studentsWithout.length !== 1 ? "s" : ""} gerado${studentsWithout.length !== 1 ? "s" : ""} com sucesso!`);
      setOpen(false);
    } catch {
      toast.error("Erro ao gerar pagamentos. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
        <RefreshCw className="w-4 h-4" />
        Gerar Mensalidades
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Gerar Mensalidades</DialogTitle>
          <DialogDescription>
            Cria um pagamento pendente para cada aluno ativo ainda sem lançamento no mês selecionado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Mês de referência</Label>
            <Input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} disabled={saving} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(val) => { if (val != null) setType(val as PaymentType); }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mensalidade">Mensalidade</SelectItem>
                <SelectItem value="arbitragem">Taxa de Arbitragem</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="genAmount">Valor por aluno (R$)</Label>
            <Input id="genAmount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150.00" min="0.01" step="0.01" disabled={saving} />
          </div>
          {alreadyCount > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
              ⚠️ {alreadyCount} aluno{alreadyCount !== 1 ? "s" : ""} já {alreadyCount !== 1 ? "têm" : "tem"} {type} para este mês e {alreadyCount !== 1 ? "serão ignorados" : "será ignorado"}.
              {studentsWithout.length > 0 ? ` Serão gerados ${studentsWithout.length} novo${studentsWithout.length !== 1 ? "s" : ""}.` : " Nenhum novo será gerado."}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={saving || studentsWithout.length === 0}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</>
                : studentsWithout.length === 0
                ? "Todos já gerados"
                : `Gerar para ${studentsWithout.length} aluno${studentsWithout.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── CobrancaEmMassa ──────────────────────────────────────────────────────────

interface CobrancaEmMassaProps {
  pendingPayments: Payment[];
  studentPhoneMap: Record<string, { phone: string; guardian: string }>;
  pixKey: string;
  onCobrado: (id: string) => void;
  cobradosHoje: Set<string>;
  paymentRules?: PaymentRules;
  // When true, opens modal immediately in sending mode with only overdue payments
  externalOpen?: boolean;
  onExternalClose?: () => void;
}

function CobrancaEmMassa({ pendingPayments, studentPhoneMap, pixKey, onCobrado, cobradosHoje, paymentRules, externalOpen, onExternalClose }: CobrancaEmMassaProps) {
  const [open, setOpen]           = useState(false);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [mode, setMode]           = useState<"select" | "sending" | "done">("select");
  const [queue, setQueue]         = useState<Payment[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sent, setSent]           = useState(0);

  const withPhone = pendingPayments.filter((p) => !!studentPhoneMap[p.studentId]?.phone);
  const sorted = [...withPhone].sort((a, b) =>
    PRIORITY_ORDER[getPaymentPriority(a.dueDate, a.status)] -
    PRIORITY_ORDER[getPaymentPriority(b.dueDate, b.status)]
  );
  const overdueWithPhone = sorted.filter((p) => getPaymentPriority(p.dueDate, p.status) === "overdue");

  // Track whether the modal was opened externally (skip the select-mode reset)
  const externalOpenRef = useRef(false);

  // When parent triggers "cobrar atrasados", open modal directly in sending mode
  useEffect(() => {
    if (externalOpen && overdueWithPhone.length > 0) {
      externalOpenRef.current = true;
      setQueue(overdueWithPhone);
      setCurrentIdx(0);
      setSent(0);
      setMode("sending");
      setOpen(true);
    }
  }, [externalOpen]); // eslint-disable-line

  useEffect(() => {
    if (open) {
      // If opened externally, don't reset to select mode — the external effect already set sending mode
      if (externalOpenRef.current) { externalOpenRef.current = false; return; }
      setSelected(new Set(overdueWithPhone.map((p) => p.id)));
      setMode("select");
      setSent(0);
    }
  }, [open]); // eslint-disable-line

  function selectAll()    { setSelected(new Set(sorted.map((p) => p.id))); }
  function selectOverdue(){ setSelected(new Set(overdueWithPhone.map((p) => p.id))); }
  function deselectAll()  { setSelected(new Set()); }

  function handleStartSending() {
    const toSend = sorted.filter((p) => selected.has(p.id));
    setQueue(toSend);
    setCurrentIdx(0);
    setSent(0);
    setMode("sending");
  }

  function handleNext(markAsSent: boolean) {
    const p = queue[currentIdx];
    if (markAsSent) {
      onCobrado(p.id);
      setSent((s) => s + 1);
    }
    if (currentIdx + 1 >= queue.length) {
      setMode("done");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  const currentPayment = mode === "sending" ? queue[currentIdx] : null;
  const currentContact = currentPayment ? studentPhoneMap[currentPayment.studentId] : null;
  const currentUrl     = currentPayment && currentContact
    ? whatsappUrl(currentPayment.studentName, currentContact.guardian, currentContact.phone, currentPayment.amount, currentPayment.dueDate, pixKey, paymentRules, currentPayment.type)
    : "";
  const currentPriority = currentPayment ? getPaymentPriority(currentPayment.dueDate, currentPayment.status) : "future";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setMode("select"); onExternalClose?.(); } }}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/20 transition-colors">
        <Send className="w-4 h-4" />
        Cobrar Inadimplentes ({withPhone.length})
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {/* ── SELECTION MODE ── */}
        {mode === "select" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                Cobranca em Lote — WhatsApp
              </DialogTitle>
              <DialogDescription>
                Selecione os alunos. As mensagens serao enviadas uma por uma.
                {!pixKey && <span className="block mt-1 text-amber-500">Configure sua chave PIX em Configuracoes para incluir nas mensagens.</span>}
              </DialogDescription>
            </DialogHeader>

            {sorted.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum pagamento pendente com telefone cadastrado.</p>
            ) : (
              <>
                <div className="flex items-center justify-between px-1 py-2 border-b border-border/30 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {overdueWithPhone.length > 0 && (
                      <button onClick={selectOverdue} className="text-xs text-red-400 hover:underline font-medium">
                        So atrasados ({overdueWithPhone.length})
                      </button>
                    )}
                    <button onClick={selectAll} className="text-xs text-primary hover:underline font-medium">Todos</button>
                    {selected.size > 0 && (
                      <button onClick={deselectAll} className="text-xs text-muted-foreground hover:underline">Limpar</button>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{selected.size} de {sorted.length}</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 py-2">
                  {sorted.map((p) => {
                    const contact = studentPhoneMap[p.studentId];
                    const isSelected = selected.has(p.id);
                    const priority = getPaymentPriority(p.dueDate, p.status);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          const next = new Set(selected);
                          if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                          setSelected(next);
                        }}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${
                          isSelected ? "border-primary/40 bg-primary/5" : "border-border/30 bg-muted/20 opacity-50"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${priority === "overdue" ? "bg-red-500" : priority === "today" ? "bg-amber-400" : "bg-muted-foreground/30"}`} />
                          <p className="text-sm font-medium truncate">{p.studentName}</p>
                          {cobradosHoje.has(p.id) && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5 shrink-0">cobrado</span>}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{formatCurrency(p.amount)}</span>
                      </div>
                    );
                  })}
                </div>

                <Button className="w-full gap-2" disabled={selected.size === 0} onClick={handleStartSending}>
                  <Zap className="w-4 h-4" />
                  Iniciar envio — {selected.size} mensagem{selected.size !== 1 ? "s" : ""}
                </Button>
              </>
            )}
          </>
        )}

        {/* ── SENDING MODE ── */}
        {mode === "sending" && currentPayment && currentContact && (
          <>
            <DialogHeader>
              <DialogTitle>Enviando mensagens</DialogTitle>
              <DialogDescription>
                {currentIdx + 1} de {queue.length} — {sent} enviada{sent !== 1 ? "s" : ""}
              </DialogDescription>
            </DialogHeader>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentIdx) / queue.length) * 100}%` }}
              />
            </div>

            {/* Current contact card */}
            <div className={`rounded-xl border-2 p-4 space-y-3 ${
              currentPriority === "overdue" ? "border-red-500/30 bg-red-500/5" :
              currentPriority === "today"   ? "border-amber-400/30 bg-amber-400/5" :
                                              "border-primary/20 bg-primary/5"
            }`}>
              <div>
                <p className="text-base font-bold text-foreground">{currentPayment.studentName}</p>
                <p className="text-sm text-muted-foreground">{currentContact.guardian} · {currentContact.phone}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-semibold">{formatCurrency(currentPayment.amount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vencimento</span>
                <span className={currentPriority === "overdue" ? "text-red-400 font-medium" : currentPriority === "today" ? "text-amber-400 font-medium" : ""}>
                  {formatDate(currentPayment.dueDate)}
                  {currentPriority === "overdue" && " (atrasado)"}
                  {currentPriority === "today"   && " (hoje)"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 hover:bg-green-700 text-white py-3 text-sm font-bold transition-colors"
                onClick={() => onCobrado(currentPayment.id)}
              >
                <MessageCircle className="w-4 h-4" />
                Abrir WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={() => handleNext(false)}>
                  Pular
                </Button>
                <Button className="w-full" onClick={() => handleNext(true)}>
                  {currentIdx + 1 < queue.length ? "Proximo" : "Concluir"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── DONE MODE ── */}
        {mode === "done" && (
          <>
            <DialogHeader>
              <DialogTitle>Cobrancas concluidas</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-base font-bold text-foreground">{sent} de {queue.length} mensagens enviadas</p>
              <p className="text-sm text-muted-foreground text-center">Os responsaveis foram notificados pelo WhatsApp.</p>
            </div>
            <Button className="w-full" onClick={() => setOpen(false)}>Fechar</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── PagamentosPage ───────────────────────────────────────────────────────────

export default function PagamentosPage() {
  const { role, schoolId } = useAuth();
  const { payments, loading, createPayment, markAsPaid, markAsPending, deletePayment } = usePayments();
  const { students } = useStudents({ activeOnly: false });
  const studentPhoneMap = Object.fromEntries(
    students.map((s) => [s.id, { phone: s.phone, guardian: s.guardian }])
  );

  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [cobrarAtrasadosOpen, setCobrarAtrasadosOpen] = useState(false);
  const [pixKey, setPixKey] = useState<string>("");
  const [paymentRules, setPaymentRules] = useState<PaymentRules | undefined>(undefined);

  // Confirmation dialog for marking as paid (when rules are active)
  const [confirmPayment, setConfirmPayment] = useState<{ payment: Payment; adj: ReturnType<typeof calculateAdjustment> } | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Track which payments were cobrado today (persisted per calendar day)
  const [cobradosHoje, setCobradosHoje] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    return loadCobradosHoje();
  });

  function markCobrado(id: string) {
    persistCobradoHoje(id);
    setCobradosHoje((prev) => new Set([...prev, id]));
  }

  // Load PIX key + payment rules
  useEffect(() => {
    if (!schoolId) return;
    getDoc(doc(db, "schools", schoolId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPixKey(data.pixKey ?? "");
        if (data.paymentRules?.enabled) setPaymentRules(data.paymentRules as PaymentRules);
      }
    });
  }, [schoolId]);

  const canManage = role !== "coach";

  // ── Stats ──────────────────────────────────────────────────────────────────

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthPayments = payments.filter((p) => p.month === currentMonth);
  const totalPendenteMonth = thisMonthPayments.filter((p) => p.status === "pendente").reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalPagoMonth    = thisMonthPayments.filter((p) => p.status === "pago").reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const pendingAll     = payments.filter((p) => p.status === "pendente");
  const totalPendingAll = pendingAll.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const overduePayments = pendingAll.filter((p) => getPaymentPriority(p.dueDate, p.status) === "overdue");
  const todayPayments   = pendingAll.filter((p) => getPaymentPriority(p.dueDate, p.status) === "today");

  // ── Filtered + sorted table data ───────────────────────────────────────────

  const filtered = statusFilter === "all" ? payments : payments.filter((p) => p.status === statusFilter);
  const sortedFiltered = [...filtered].sort((a, b) => {
    const pa = PRIORITY_ORDER[getPaymentPriority(a.dueDate, a.status)];
    const pb = PRIORITY_ORDER[getPaymentPriority(b.dueDate, b.status)];
    if (pa !== pb) return pa - pb;
    // Same priority → sort by due date ascending (earliest first)
    const da = toDate(a.dueDate)?.getTime() ?? 0;
    const db = toDate(b.dueDate)?.getTime() ?? 0;
    return da - db;
  });
  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE));
  const paginated  = sortedFiltered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleToggleStatus(payment: Payment) {
    try {
      if (payment.status === "pendente") {
        // If rules are active, show confirmation dialog with calculated amount (only for mensalidade)
        if (paymentRules?.enabled && payment.dueDate && payment.type === "mensalidade") {
          const due = toDate(payment.dueDate) ?? new Date();
          const adj = calculateAdjustment(payment.amount, due, paymentRules);
          setConfirmPayment({ payment, adj });
          return;
        }
        await confirmMarkAsPaid(payment, payment.amount);
      } else {
        await markAsPending(payment.id);
        toast.info("Pagamento revertido para pendente.");
      }
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  }

  async function confirmMarkAsPaid(payment: Payment, finalAmount: number) {
    setConfirming(true);
    try {
      await markAsPaid(payment.id, finalAmount !== payment.amount ? finalAmount : undefined);
      const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
      toast.success(
        `💰 ${payment.studentName} pagou! ${fmt(finalAmount)} no caixa.`,
        {
          description: "Tá chegando! Continue assim 💪",
          action: (() => {
            const contact = studentPhoneMap[payment.studentId];
            if (!contact?.phone) return undefined;
            return {
              label: "Enviar recibo WhatsApp",
              onClick: () => window.open(whatsappReceiptUrl(payment.studentName, contact.guardian, contact.phone, finalAmount), "_blank"),
            };
          })(),
        }
      );
    } catch {
      toast.error("Erro ao atualizar status.");
    } finally {
      setConfirming(false);
      setConfirmPayment(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePayment(deleteTarget.id);
      toast.success("Pagamento removido.");
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao remover pagamento.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleGeneratePayments(
    newPayments: Omit<Payment, "id" | "schoolId" | "createdAt" | "updatedAt">[]
  ) {
    for (const p of newPayments) await createPayment(p);
  }

  function handleCobrarAtrasados() {
    const toSend = overduePayments.filter((p) => !!studentPhoneMap[p.studentId]?.phone);
    if (toSend.length === 0) { toast.error("Nenhum atrasado com telefone cadastrado."); return; }
    setCobrarAtrasadosOpen(true);
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando pagamentos...</span>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pagamentos</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie mensalidades e taxas</p>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <RelatorioPDF />
            <GerarMensalidades onGenerate={handleGeneratePayments} />
            <PaymentForm onSubmit={createPayment} />
          </div>
        )}
      </div>

      {/* ── Urgency banner ── */}
      {pendingAll.length > 0 && (
        <div className={`rounded-xl border p-5 ${
          overduePayments.length > 0
            ? "border-red-500/30 bg-red-500/5"
            : todayPayments.length > 0
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-border/50 bg-card"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-1">
                Total pendente
              </p>
              <p className={`text-3xl font-black tabular-nums ${
                overduePayments.length > 0 ? "text-red-400" :
                todayPayments.length > 0 ? "text-amber-400" : "text-foreground"
              }`}>
                {formatCurrency(totalPendingAll)}
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                {overduePayments.length > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-red-400">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                    {overduePayments.length} atrasado{overduePayments.length !== 1 ? "s" : ""}
                  </span>
                )}
                {todayPayments.length > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                    {todayPayments.length} vence hoje
                  </span>
                )}
                {pendingAll.length - overduePayments.length - todayPayments.length > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/30" />
                    {pendingAll.length - overduePayments.length - todayPayments.length} no prazo
                  </span>
                )}
              </div>
            </div>

            {overduePayments.length > 0 && canManage && (
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  onClick={() => {
                    const mes = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
                    const total = formatCurrency(totalPendingAll);
                    const linhas = overduePayments.slice(0, 10).map((p) => `• ${p.studentName}: ${formatCurrency(p.amount ?? 0)}`).join("\n");
                    const mais = overduePayments.length > 10 ? `\n+${overduePayments.length - 10} mais...` : "";
                    const texto = encodeURIComponent(`📋 *Relatório de Inadimplência — ${mes}*\n\n${linhas}${mais}\n\n*Total: ${total}*`);
                    window.open(`https://wa.me/?text=${texto}`, "_blank");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/50 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-semibold text-red-300 transition-all shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  Relatório
                </button>
                <button
                  onClick={handleCobrarAtrasados}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 px-5 py-2.5 text-sm font-bold text-white transition-all shrink-0 shadow-lg shadow-red-500/25"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Cobrar {overduePayments.length} atrasado{overduePayments.length !== 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pendente (mês atual)</p>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPendenteMonth)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Recebido (mês atual)</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalPagoMonth)}</p>
        </div>
      </div>

      {/* Bulk WhatsApp */}
      {pendingAll.length > 0 && canManage && (
        <CobrancaEmMassa
          pendingPayments={pendingAll}
          studentPhoneMap={studentPhoneMap}
          pixKey={pixKey}
          onCobrado={markCobrado}
          cobradosHoje={cobradosHoje}
          paymentRules={paymentRules}
          externalOpen={cobrarAtrasadosOpen}
          onExternalClose={() => setCobrarAtrasadosOpen(false)}
        />
      )}

      {/* Filter */}
      {payments.length > 0 && (
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(val) => { if (val !== null) { setStatusFilter(val); setPage(0); } }}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="pago">Pagos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Empty state */}
      {payments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Nenhum pagamento cadastrado</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Use "Gerar Mensalidades" para criar pagamentos para todos os alunos de uma vez.
          </p>
        </div>
      )}

      {/* Table */}
      {paginated.length > 0 && (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Aluno</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((payment) => {
                const priority = getPaymentPriority(payment.dueDate, payment.status);
                const isCobradoHoje = cobradosHoje.has(payment.id);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Priority dot */}
                        {payment.status === "pendente" && (
                          <span
                            title={priority === "overdue" ? "Atrasado" : priority === "today" ? "Vence hoje" : "No prazo"}
                            className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                              priority === "overdue" ? "bg-red-500 shadow-sm shadow-red-500/60" :
                              priority === "today"   ? "bg-amber-400 shadow-sm shadow-amber-400/60" :
                              "bg-muted-foreground/25"
                            }`}
                          />
                        )}
                        <span className="font-medium truncate">{payment.studentName}</span>
                        {isCobradoHoje && (
                          <span className="hidden sm:inline text-[10px] font-medium text-emerald-400/80 bg-emerald-500/10 rounded px-1.5 py-0.5 shrink-0 whitespace-nowrap">
                            cobrado ✓
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {PAYMENT_TYPE_LABELS[payment.type] ?? payment.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount ?? 0)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`text-sm ${
                        priority === "overdue" ? "text-red-400 font-medium" :
                        priority === "today"   ? "text-amber-400 font-medium" :
                        "text-muted-foreground"
                      }`}>
                        {formatDate(payment.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.status === "pago" ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" />Pago
                        </Badge>
                      ) : (
                        <Badge variant="outline" className={`${
                          priority === "overdue"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : priority === "today"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {priority === "overdue" ? "Atrasado" : "Pendente"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {payment.status === "pendente" && studentPhoneMap[payment.studentId]?.phone && (
                          <a
                            href={whatsappUrl(payment.studentName, studentPhoneMap[payment.studentId].guardian, studentPhoneMap[payment.studentId].phone, payment.amount, payment.dueDate, pixKey, paymentRules, payment.type)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Cobrar via WhatsApp"
                            onClick={() => markCobrado(payment.id)}
                            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-green-50 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </a>
                        )}
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(payment)}
                              title={payment.status === "pendente" ? "Marcar como pago" : "Reverter para pendente"}
                              className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors"
                            >
                              <CheckCircle2 className={`w-4 h-4 ${payment.status === "pago" ? "text-green-600" : "text-muted-foreground"}`} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(payment)}
                              className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {payments.length > 0 && sortedFiltered.length === 0 && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum pagamento encontrado com esse filtro.</p>
      )}

      {/* Pagination */}
      {sortedFiltered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedFiltered.length)} de {sortedFiltered.length} pagamento{sortedFiltered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {payments.length > 0 && sortedFiltered.length <= PAGE_SIZE && (
        <p className="text-xs text-muted-foreground">
          {sortedFiltered.length} de {payments.length} pagamento{payments.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Payment confirmation with discount/fine */}
      <Dialog open={!!confirmPayment} onOpenChange={(open) => !open && setConfirmPayment(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              {confirmPayment?.payment.studentName} — {confirmPayment && new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.payment.amount)} original
            </DialogDescription>
          </DialogHeader>

          {confirmPayment && (
            <div className="space-y-3 py-2">
              {confirmPayment.adj.type === "discount" && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
                  <p className="text-sm font-semibold text-emerald-700">💚 Desconto por antecipação</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor original</span>
                    <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.payment.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Desconto ({confirmPayment.adj.percent}%)</span>
                    <span className="text-emerald-600">- {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.adj.saving)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-emerald-200 pt-2">
                    <span>Total a receber</span>
                    <span className="text-emerald-700">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.adj.finalAmount)}</span>
                  </div>
                </div>
              )}

              {confirmPayment.adj.type === "fine" && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-2">
                  <p className="text-sm font-semibold text-red-700">⚠️ Multa por atraso ({confirmPayment.adj.days} dia{confirmPayment.adj.days !== 1 ? "s" : ""})</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor original</span>
                    <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.payment.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Multa fixa</span>
                    <span className="text-red-600">+ {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.adj.fineFixed)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Multa diária</span>
                    <span className="text-red-600">+ {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.adj.fineDaily)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-red-200 pt-2">
                    <span>Total a receber</span>
                    <span className="text-red-700">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.adj.finalAmount)}</span>
                  </div>
                </div>
              )}

              {confirmPayment.adj.type === "normal" && (
                <div className="rounded-xl bg-muted/40 border border-border p-4">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total a receber</span>
                    <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(confirmPayment.adj.finalAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPayment(null)} disabled={confirming}>Cancelar</Button>
            <Button
              onClick={() => confirmPayment && confirmMarkAsPaid(confirmPayment.payment, confirmPayment.adj.finalAmount)}
              disabled={confirming}
              className={confirmPayment?.adj.type === "discount" ? "bg-emerald-600 hover:bg-emerald-700" : confirmPayment?.adj.type === "fine" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {confirming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Confirmando...</> : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Pagamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o pagamento de <strong>{deleteTarget?.studentName}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</> : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
