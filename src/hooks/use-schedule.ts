"use client";

import { useCollection } from "./use-firestore";
import type { Schedule } from "@/types";

export function useSchedule() {
  const { data, loading, error, add, update, remove } =
    useCollection<Schedule>("schedules");

  async function createSchedule(
    schedule: Omit<Schedule, "id" | "schoolId" | "createdAt" | "updatedAt">
  ): Promise<void> {
    await add(schedule);
  }

  async function updateSchedule(id: string, updates: Partial<Schedule>) {
    return update(id, updates);
  }

  async function deleteSchedule(id: string) {
    return remove(id);
  }

  return {
    schedules: data,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
