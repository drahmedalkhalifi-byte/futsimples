"use client";

import { useExpenses } from "@/hooks/use-expenses";
import { useAuth } from "@/contexts/auth-context";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseTable } from "@/components/expenses/expense-table";

export default function GastosPage() {
  const { role } = useAuth();
  const { expenses, loading, createExpense, updateExpense, deleteExpense } =
    useExpenses();

  const canManage = role !== "coach";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Despesas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as despesas da escola
          </p>
        </div>
        {canManage && <ExpenseForm onSubmit={createExpense} />}
      </div>

      <ExpenseTable
        expenses={expenses}
        loading={loading}
        onUpdate={updateExpense}
        onDelete={deleteExpense}
      />
    </div>
  );
}
