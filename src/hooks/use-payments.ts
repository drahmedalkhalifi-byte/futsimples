"use client";

import { serverTimestamp } from "firebase/firestore";
import { useCollection } from "./use-firestore";
import type { Payment } from "@/types";

export function usePayments() {
  const { data, loading, error, add, update, remove } =
    useCollection<Payment>("payments");

  async function createPayment(
    payment: Omit<Payment, "id" | "schoolId" | "createdAt" | "updatedAt">
  ): Promise<void> {
    await add(payment);
  }

  async function markAsPaid(id: string) {
    return update(id, { status: "pago", paidAt: serverTimestamp() });
  }

  async function markAsPending(id: string) {
    return update(id, { status: "pendente", paidAt: null });
  }

  async function deletePayment(id: string) {
    return remove(id);
  }

  return {
    payments: data,
    loading,
    error,
    createPayment,
    markAsPaid,
    markAsPending,
    deletePayment,
  };
}
