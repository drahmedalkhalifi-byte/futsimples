"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { StudentCategory } from "@/types";

interface DashboardData {
  revenueThisMonth: number;
  expensesThisMonth: number;
  netThisMonth: number;
  activeStudents: number;
  pendingPayments: number;
  upcomingGames: number;
  studentsByCategory: { categoria: string; alunos: number }[];
  monthlyRevenue: { mes: string; receita: number }[];
  loading: boolean;
}

export function useDashboard(): DashboardData {
  const { schoolId } = useAuth();
  const [data, setData] = useState<DashboardData>({
    revenueThisMonth: 0,
    expensesThisMonth: 0,
    netThisMonth: 0,
    activeStudents: 0,
    pendingPayments: 0,
    upcomingGames: 0,
    studentsByCategory: [],
    monthlyRevenue: [],
    loading: true,
  });

  useEffect(() => {
    if (!schoolId) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    async function fetchDashboard() {
      try {
        // Active students count + by category
        const studentsSnap = await getDocs(
          query(
            collection(db, "students"),
            where("schoolId", "==", schoolId),
            where("active", "==", true)
          )
        );
        const activeStudents = studentsSnap.size;

        const categoryCount: Record<string, number> = {};
        const categories: StudentCategory[] = ["babyfoot", "sub6", "sub7", "sub8", "sub9", "sub10", "sub11", "sub12", "sub13", "sub14", "sub15"];
        categories.forEach((c) => (categoryCount[c] = 0));
        studentsSnap.forEach((doc) => {
          const cat = doc.data().category as string;
          if (cat in categoryCount) categoryCount[cat]++;
        });
        const studentsByCategory = categories.map((c) => ({
          categoria: c,
          alunos: categoryCount[c],
        }));

        // Current month string
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // Revenue this month + last 6 months breakdown
        let revenueThisMonth = 0;
        const monthlyRevenueMap: Record<string, number> = {};

        // Build last 6 months list
        const last6Months: string[] = [];
        const MONTH_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          last6Months.push(key);
          monthlyRevenueMap[key] = 0;
        }

        try {
          const paidSnap = await getDocs(
            query(
              collection(db, "payments"),
              where("schoolId", "==", schoolId),
              where("status", "==", "pago")
            )
          );
          paidSnap.forEach((doc) => {
            const d = doc.data();
            const m: string = d.month ?? "";
            if (m === month) revenueThisMonth += d.amount ?? 0;
            if (m in monthlyRevenueMap) monthlyRevenueMap[m] += d.amount ?? 0;
          });
        } catch {
          // payments collection may not exist yet
        }

        const monthlyRevenue = last6Months.map((key) => {
          const [y, mo] = key.split("-");
          return { mes: `${MONTH_SHORT[Number(mo) - 1]}/${y.slice(2)}`, receita: monthlyRevenueMap[key] };
        });

        // Pending payments count
        let pendingPayments = 0;
        try {
          const pendingSnap = await getDocs(
            query(
              collection(db, "payments"),
              where("schoolId", "==", schoolId),
              where("status", "==", "pendente")
            )
          );
          pendingPayments = pendingSnap.size;
        } catch {
          // payments collection may not exist yet
        }

        // Expenses this month — one-time expenses with date in current month
        let expensesThisMonth = 0;
        try {
          const expensesSnap = await getDocs(
            query(
              collection(db, "expenses"),
              where("schoolId", "==", schoolId)
            )
          );
          expensesSnap.forEach((d) => {
            const e = d.data();
            if (e.type === "recurring") {
              expensesThisMonth += e.amount ?? 0;
            } else {
              const date = e.date?.toDate ? e.date.toDate() : new Date(e.date);
              if (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth()
              ) {
                expensesThisMonth += e.amount ?? 0;
              }
            }
          });
        } catch {
          // expenses collection may not exist yet
        }

        // Upcoming games — filter client-side to avoid composite index requirement
        let upcomingGames = 0;
        try {
          const gamesSnap = await getDocs(
            query(
              collection(db, "schedules"),
              where("schoolId", "==", schoolId),
              where("type", "==", "jogo")
            )
          );
          upcomingGames = gamesSnap.docs.filter((d) => {
            const date = d.data().date;
            if (!date) return false;
            const ts: Date = date?.toDate ? date.toDate() : new Date(date);
            return ts >= now;
          }).length;
        } catch {
          // schedules collection may not exist yet
        }

        setData({
          revenueThisMonth,
          expensesThisMonth,
          netThisMonth: revenueThisMonth - expensesThisMonth,
          activeStudents,
          pendingPayments,
          upcomingGames,
          studentsByCategory,
          monthlyRevenue,
          loading: false,
        });
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setData((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchDashboard();
  }, [schoolId]);

  return data;
}
