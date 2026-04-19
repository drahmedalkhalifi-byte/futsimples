"use client";

import { useCollection } from "./use-firestore";
import type { Championship } from "@/types";

export function useChampionships() {
  const { data, loading, error, add, update, remove } =
    useCollection<Championship>("championships");

  async function createChampionship(
    c: Omit<Championship, "id" | "schoolId" | "createdAt" | "updatedAt">
  ): Promise<void> {
    await add(c);
  }

  async function updateChampionship(id: string, updates: Partial<Championship>) {
    return update(id, updates);
  }

  async function deleteChampionship(id: string) {
    return remove(id);
  }

  return {
    championships: data,
    loading,
    error,
    createChampionship,
    updateChampionship,
    deleteChampionship,
  };
}
