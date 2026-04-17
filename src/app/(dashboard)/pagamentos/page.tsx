"use client";

import { useState } from "react";
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
import type { Payment, PaymentType, StudentCategory } from "@/types";

const studentCategories: StudentCategory[] = ["babyfoot", "sub6", "sub7", "sub8", "sub9", "sub10", "sub11", "sub12", "sub13", "sub14", "sub15"];

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  mensalidade: "Mensalidade",
  matricula: "Matrícula",
  arbitragem: "Taxa de Arbitragem",
  outros: "Outros",
};

// UTF-8 percent-encoded bytes for emoji — hardcoded to avoid any encoding issues
// ⚽ U+26BD  → UTF-8: E2 9A BD
// 🙌 U+1F64C → UTF-8: F0 9F 99 8C
const PCT_BALL  = "%E2%9A%BD";
const PCT_HANDS = "%F0%9F%99%8C";

function whatsappUrl(studentName: string, guardian: string, phone: string, amount: number, dueDate: unknown): string {
  const number = formatWhatsAppNumber(phone);
  const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  const formattedDate = formatDate(dueDate);
  const text =
    encodeURIComponent(`Ol\u00E1, ${guardian}! `) +
    PCT_BALL +
    encodeURIComponent(` A mensalidade de *${studentName}* est\u00E1 *pendente* no valor de *${formattedAmount}* com vencimento em *${formattedDate}*. Contamos com voc\u00EA para regularizar! Qualquer d\u00FAvida, \u00E9 s\u00F3 chamar. `) +
    PCT_HANDS;
  return `https://wa.me/${number}?text=${text}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
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

// ─── PaymentForm ────────────────────────────────────────────────────────────

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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) { toast.error("Selecione um aluno."); return; }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) { toast.error("Informe um valor válido."); return; }
    if (!dueDate) { toast.error("Informe a data de vencimento."); return; }

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
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryFilter} onValueChange={(val) => val !== null && handleCategoryChange(val)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {studentCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(val) => { if (val != null) setType(val as PaymentType); }}>
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
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── GerarMensalidades ───────────────────────────────────────────────────────

interface GerarMensalidadesProps {
  onGenerate: (payments: Omit<Payment, "id" | "schoolId" | "createdAt" | "updatedAt">[]) => Promise<void>;
}

function GerarMensalidades({ onGenerate }: GerarMensalidadesProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { students } = useStudents({ activeOnly: true });

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PaymentType>("mensalidade");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) { toast.error("Informe um valor válido."); return; }
    if (!month) { toast.error("Selecione o mês de referência."); return; }
    if (students.length === 0) { toast.error("Nenhum aluno ativo encontrado."); return; }

    const [year, mon] = month.split("-").map(Number);
    const dueDate = new Date(year, mon - 1, 10, 12, 0, 0); // vence dia 10

    const payments: Omit<Payment, "id" | "schoolId" | "createdAt" | "updatedAt">[] = students.map((s) => ({
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
      toast.success(`${students.length} pagamento${students.length !== 1 ? "s" : ""} gerado${students.length !== 1 ? "s" : ""} com sucesso!`);
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
            Cria um pagamento pendente para cada um dos {students.length} aluno{students.length !== 1 ? "s" : ""} ativos.
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
          <DialogFooter>
            <Button type="submit" disabled={saving || students.length === 0}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</> : `Gerar para ${students.length} aluno${students.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── CobrancaEmMassa ─────────────────────────────────────────────────────────

interface CobrancaEmMassaProps {
  pendingPayments: Payment[];
  studentPhoneMap: Record<string, { phone: string; guardian: string }>;
}

function CobrancaEmMassa({ pendingPayments, studentPhoneMap }: CobrancaEmMassaProps) {
  const [open, setOpen] = useState(false);
  const withPhone = pendingPayments.filter((p) => !!studentPhoneMap[p.studentId]?.phone);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-2 text-sm font-medium hover:bg-green-100 transition-colors">
        <Send className="w-4 h-4" />
        Cobrar Pendentes ({withPhone.length})
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cobranças via WhatsApp</DialogTitle>
          <DialogDescription>
            Clique no botão de cada aluno para enviar a mensagem de cobrança.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {withPhone.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum pagamento pendente com telefone cadastrado.
            </p>
          ) : (
            withPhone.map((p) => {
              const contact = studentPhoneMap[p.studentId];
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.studentName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(p.amount)} · vence {formatDate(p.dueDate)}</p>
                  </div>
                  <a
                    href={whatsappUrl(p.studentName, contact.guardian, contact.phone, p.amount, p.dueDate)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Enviar
                  </a>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── PagamentosPage ──────────────────────────────────────────────────────────

export default function PagamentosPage() {
  const { role } = useAuth();
  const { payments, loading, createPayment, markAsPaid, markAsPending, deletePayment } = usePayments();
  const { students } = useStudents({ activeOnly: false });
  const studentPhoneMap = Object.fromEntries(
    students.map((s) => [s.id, { phone: s.phone, guardian: s.guardian }])
  );
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const canManage = role !== "coach";

  // Current month totals
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthPayments = payments.filter((p) => p.month === currentMonth);
  const totalPendenteMonth = thisMonthPayments.filter((p) => p.status === "pendente").reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalPagoMonth = thisMonthPayments.filter((p) => p.status === "pago").reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const pendingAll = payments.filter((p) => p.status === "pendente");

  const filtered = statusFilter === "all" ? payments : payments.filter((p) => p.status === statusFilter);

  async function handleToggleStatus(payment: Payment) {
    try {
      if (payment.status === "pendente") {
        await markAsPaid(payment.id);
        toast.success(`Pagamento de ${payment.studentName} marcado como pago!`);
      } else {
        await markAsPending(payment.id);
        toast.success("Pagamento revertido para pendente.");
      }
    } catch {
      toast.error("Erro ao atualizar status.");
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
    for (const p of newPayments) {
      await createPayment(p);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando pagamentos...</span>
      </div>
    );
  }

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
            <GerarMensalidades onGenerate={handleGeneratePayments} />
            <PaymentForm onSubmit={createPayment} />
          </div>
        )}
      </div>

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
        <CobrancaEmMassa pendingPayments={pendingAll} studentPhoneMap={studentPhoneMap} />
      )}

      {/* Filter */}
      {payments.length > 0 && (
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(val) => val !== null && setStatusFilter(val)}>
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
      {filtered.length > 0 && (
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
              {filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.studentName}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {PAYMENT_TYPE_LABELS[payment.type] ?? payment.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount ?? 0)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatDate(payment.dueDate)}
                  </TableCell>
                  <TableCell>
                    {payment.status === "pago" ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />Pago
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="w-3 h-3 mr-1" />Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {payment.status === "pendente" && studentPhoneMap[payment.studentId]?.phone && (
                        <a
                          href={whatsappUrl(payment.studentName, studentPhoneMap[payment.studentId].guardian, studentPhoneMap[payment.studentId].phone, payment.amount, payment.dueDate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Cobrar via WhatsApp"
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {payments.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum pagamento encontrado com esse filtro.</p>
      )}

      {payments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {payments.length} pagamento{payments.length !== 1 ? "s" : ""}
        </p>
      )}

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
