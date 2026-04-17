"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { StudentCategory } from "@/types";

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  present: boolean;
}

export interface AttendanceEntry {
  id: string;
  schoolId: string;
  date: Date | { toDate: () => Date };
  category: StudentCategory;
  coachName: string;
  records: AttendanceRecord[];
  createdAt: Date;
}

interface SaveAttendanceParams {
  date: Date;
  category: StudentCategory;
  records: AttendanceRecord[];
}

export function useAttendance() {
  const { schoolId, user } = useAuth();
  const [history, setHistory] = useState<AttendanceEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!schoolId) {
      setLoadingHistory(false);
      return;
    }

    const q = query(
      collection(db, "attendances"),
      where("schoolId", "==", schoolId)
      // orderBy removed — would require a composite index.
      // Sorting is done client-side below.
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const entries = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as AttendanceEntry))
          .sort((a, b) => {
            const toMs = (v: unknown): number => {
              if (v instanceof Date) return v.getTime();
              if (typeof v === "object" && v !== null && "toDate" in v)
                return (v as { toDate: () => Date }).toDate().getTime();
              return 0;
            };
            return toMs(b.date) - toMs(a.date); // most recent first
          });
        setHistory(entries);
        setLoadingHistory(false);
      },
      (err) => {
        console.error("Erro ao carregar histórico de presença:", err);
        setLoadingHistory(false);
      }
    );

    return unsub;
  }, [schoolId]);

  async function saveAttendance({ date, category, records }: SaveAttendanceParams) {
    if (!schoolId || !user) throw new Error("Usuário não autenticado");
    return addDoc(collection(db, "attendances"), {
      schoolId,
      date,
      category,
      coachId: user.id,
      coachName: user.name,
      records,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return { saveAttendance, history, loadingHistory };
}
