"use client";

import { useCollection } from "./use-firestore";
import type { Expense } from "@/types";

export function useExpenses() {
  const { data, loading, error, add, update, remove } =
    useCollection<Expense>("expenses");

  async function createExpense(
    expense: Omit<Expense, "id" | "schoolId" | "createdAt" | "updatedAt">
  ): Promise<void> {
    await add(expense);
  }

  async function updateExpense(id: string, updates: Partial<Expense>) {
    return update(id, updates);
  }

  async function deleteExpense(id: string) {
    return remove(id);
  }

  return {
    expenses: data,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
