"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Expense, ExpenseType, ExpenseCategory } from "@/types";

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (
    data: Omit<Expense, "id" | "schoolId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ExpenseForm({ expense, onSubmit, trigger }: ExpenseFormProps) {
  const isEditing = !!expense;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [type, setType] = useState<ExpenseType>(expense?.type ?? "one-time");
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "variavel");
  const [date, setDate] = useState(
    expense?.date instanceof Date
      ? expense.date.toISOString().slice(0, 10)
      : typeof expense?.date === "string"
      ? (expense.date as string).slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    expense?.dayOfMonth?.toString() ?? "1"
  );

  function reset() {
    if (!isEditing) {
      setDescription("");
      setAmount("");
      setType("one-time");
      setCategory("variavel");
      setDate(new Date().toISOString().slice(0, 10));
      setDayOfMonth("1");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Informe a descrição da despesa.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (type === "one-time" && !date) {
      toast.error("Informe a data da despesa.");
      return;
    }
    if (type === "recurring") {
      const day = parseInt(dayOfMonth, 10);
      if (!dayOfMonth || isNaN(day) || day < 1 || day > 31) {
        toast.error("Informe um dia do mês válido (1 a 31).");
        return;
      }
    }

    setSaving(true);
    try {
      await onSubmit({
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        ...(type === "one-time"
          ? { date: new Date(date + "T12:00:00") }
          : { dayOfMonth: parseInt(dayOfMonth, 10) }),
      });
      setOpen(false);
      reset();
      toast.success(isEditing ? "Despesa atualizada!" : "Despesa cadastrada!");
    } catch {
      toast.error("Erro ao salvar despesa. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger className="inline-flex items-center">
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Despesa
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados da despesa." : "Registre uma nova despesa da escola."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição <span className="text-destructive">*</span></Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel do campo, material esportivo..."
              autoFocus
              disabled={saving}
            />
          </div>

          {/* Amount + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) <span className="text-destructive">*</span></Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as ExpenseType)}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo">
                    {type === "one-time" ? "Pontual" : "Recorrente"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">Pontual</SelectItem>
                  <SelectItem value="recurring">Recorrente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as ExpenseCategory)}
              disabled={saving}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixo">Fixo</SelectItem>
                <SelectItem value="variavel">Variável</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional: date or dayOfMonth */}
          {type === "one-time" ? (
            <div className="space-y-2">
              <Label htmlFor="date">Data <span className="text-destructive">*</span></Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={saving}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Dia do mês <span className="text-destructive">*</span></Label>
              <Input
                id="dayOfMonth"
                type="number"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="Ex: 5"
                min="1"
                max="31"
                disabled={saving}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Cadastrar Despesa"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
