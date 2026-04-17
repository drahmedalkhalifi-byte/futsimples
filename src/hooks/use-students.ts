"use client";

import { where } from "firebase/firestore";
import { useCollection } from "./use-firestore";
import type { Student, StudentCategory } from "@/types";

interface UseStudentsOptions {
  category?: StudentCategory;
  activeOnly?: boolean;
}

export function useStudents(options: UseStudentsOptions = {}) {
  const { category, activeOnly = true } = options;

  const extraConstraints = [];
  if (activeOnly) {
    extraConstraints.push(where("active", "==", true));
  }
  if (category) {
    extraConstraints.push(where("category", "==", category));
  }

  // key changes whenever the filter params change, forcing useCollection to
  // restart the onSnapshot subscription with the updated constraints.
  const key = `activeOnly=${String(activeOnly)};category=${category ?? ""}`;

  const { data, loading, error, add, update, remove } =
    useCollection<Student>("students", { extraConstraints, key });

  async function createStudent(
    student: Omit<Student, "id" | "schoolId" | "createdAt" | "updatedAt" | "active">
  ): Promise<void> {
    await add({ ...student, active: true });
  }

  async function updateStudent(id: string, updates: Partial<Student>) {
    return update(id, updates);
  }

  async function deactivateStudent(id: string) {
    return update(id, { active: false });
  }

  async function deleteStudent(id: string) {
    return remove(id);
  }

  return {
    students: data,
    loading,
    error,
    createStudent,
    updateStudent,
    deactivateStudent,
    deleteStudent,
  };
}
