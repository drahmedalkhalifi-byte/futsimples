"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Loader2, Receipt } from "lucide-react";
import { ExpenseForm } from "./expense-form";
import type { Expense } from "@/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: unknown): string {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleDateString("pt-BR");
  if (typeof value === "object" && value !== null && "toDate" in value)
    return (value as { toDate: () => Date }).toDate().toLocaleDateString("pt-BR");
  if (typeof value === "string") {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }
  return "—";
}

const categoryLabels: Record<string, string> = {
  fixo: "Fixo",
  variavel: "Variável",
  outros: "Outros",
};

const categoryColors: Record<string, string> = {
  fixo:     "bg-blue-50 text-blue-700 border-blue-200",
  variavel: "bg-amber-50 text-amber-700 border-amber-200",
  outros:   "bg-muted text-muted-foreground",
};

interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  onUpdate: (id: string, data: Partial<Expense>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ExpenseTable({ expenses, loading, onUpdate, onDelete }: ExpenseTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      toast.success("Despesa removida.");
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao remover despesa.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando despesas...</span>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Receipt className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Nenhuma despesa cadastrada</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Registre as despesas da escola para acompanhar os custos.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Data / Dia</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>{formatCurrency(expense.amount)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={categoryColors[expense.category] ?? ""}
                  >
                    {categoryLabels[expense.category] ?? expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {expense.type === "recurring" ? "Recorrente" : "Pontual"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {expense.type === "recurring"
                    ? `Dia ${expense.dayOfMonth}`
                    : formatDate(expense.date)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ExpenseForm
                      expense={expense}
                      onSubmit={async (data) => { await onUpdate(expense.id, data); }}
                      trigger={
                        <span className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors cursor-pointer">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </span>
                      }
                    />
                    <button
                      onClick={() => setDeleteTarget(expense)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {expenses.length} despesa{expenses.length !== 1 ? "s" : ""}
      </p>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Despesa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.description}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
