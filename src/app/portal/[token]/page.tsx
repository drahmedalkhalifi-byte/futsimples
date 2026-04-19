"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Trophy, CheckCircle2, XCircle, Clock, CreditCard,
  CalendarCheck, Loader2, AlertCircle, HeartPulse,
} from "lucide-react";
import type { Student, Payment, Attendance } from "@/types";

interface PortalData {
  student: Student;
  schoolName: string;
  payments: Payment[];
  attendances: Attendance[];
}

function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (val instanceof Timestamp) return val.toDate();
  if (typeof val === "object" && val !== null && "toDate" in val) return (val as { toDate: () => Date }).toDate();
  if (typeof val === "string") return new Date(val);
  return null;
}

export default function PortalPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Find student by portalToken
        const studentsQ = query(collection(db, "students"), where("portalToken", "==", token));
        const studentsSnap = await getDocs(studentsQ);
        if (studentsSnap.empty) { setNotFound(true); setLoading(false); return; }

        const studentDoc = studentsSnap.docs[0];
        const student = { id: studentDoc.id, ...studentDoc.data() } as Student;
        const schoolId = student.schoolId;

        // Load school name
        const schoolsQ = query(collection(db, "schools"), where("__name__", "==", schoolId));
        let schoolName = "Escolinha";
        const schoolSnap = await getDocs(collection(db, "schools"));
        schoolSnap.docs.forEach((d) => { if (d.id === schoolId) schoolName = d.data().name ?? schoolName; });

        // Load payments for this student
        const paymentsQ = query(collection(db, "payments"), where("studentId", "==", student.id));
        const paymentsSnap = await getDocs(paymentsQ);
        const payments = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));

        // Load attendances for this student's category (last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const attendancesQ = query(
          collection(db, "attendances"),
          where("schoolId", "==", schoolId),
          where("category", "==", student.category),
        );
        const attSnap = await getDocs(attendancesQ);
        const attendances = attSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Attendance))
          .filter((a) => {
            const d = toDate(a.date);
            return d && d >= threeMonthsAgo;
          });

        setData({ student, schoolName, payments, attendances });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  if (notFound || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background text-foreground">
      <AlertCircle className="w-12 h-12 text-destructive/60" />
      <h1 className="text-lg font-bold">Link não encontrado</h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Este link pode ter expirado ou é inválido. Peça um novo link para a escolinha.
      </p>
    </div>
  );

  const { student, schoolName, payments, attendances } = data;

  // Current month payments
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthPayments = payments.filter((p) => p.month === currentMonth);
  const hasPendingThisMonth = currentMonthPayments.some((p) => p.status === "pendente");
  const hasPaidThisMonth = currentMonthPayments.some((p) => p.status === "pago");

  // Last 3 payments
  const sortedPayments = [...payments].sort((a, b) => {
    const da = toDate(a.dueDate)?.getTime() ?? 0;
    const db2 = toDate(b.dueDate)?.getTime() ?? 0;
    return db2 - da;
  }).slice(0, 5);

  // Attendance this month
  const thisMonthAttendances = attendances.filter((a) => {
    const d = toDate(a.date);
    return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const presentCount = thisMonthAttendances.filter((a) =>
    a.records?.find((r) => r.studentId === student.id)?.present
  ).length;
  const totalTrainings = thisMonthAttendances.length;

  function formatCurrency(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }
  function formatDate(val: unknown) {
    const d = toDate(val);
    if (!d) return "—";
    return d.toLocaleDateString("pt-BR");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 shadow-md shrink-0">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">{schoolName}</p>
            <p className="text-[10px] text-muted-foreground">Portal do Responsável</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Student card */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-xl font-black text-primary">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground">{student.name}</h1>
              <p className="text-sm text-muted-foreground">{student.category.toUpperCase()} · {student.age} anos</p>
              <p className="text-xs text-muted-foreground mt-0.5">Responsável: {student.guardian}</p>
            </div>
          </div>
        </div>

        {/* Payment status this month */}
        <div className={`rounded-2xl border p-5 ${
          hasPaidThisMonth
            ? "border-emerald-500/30 bg-emerald-500/5"
            : hasPendingThisMonth
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-border/50 bg-card"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
              hasPaidThisMonth ? "bg-emerald-500/15" : hasPendingThisMonth ? "bg-amber-500/15" : "bg-muted"
            }`}>
              <CreditCard className={`w-5 h-5 ${
                hasPaidThisMonth ? "text-emerald-400" : hasPendingThisMonth ? "text-amber-400" : "text-muted-foreground"
              }`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Mensalidade — {now.toLocaleString("pt-BR", { month: "long", year: "numeric" })}</p>
              <p className={`text-base font-bold mt-0.5 ${
                hasPaidThisMonth ? "text-emerald-400" : hasPendingThisMonth ? "text-amber-400" : "text-muted-foreground"
              }`}>
                {hasPaidThisMonth ? "Em dia ✓" : hasPendingThisMonth ? "Pendente" : "Não lançado"}
              </p>
              {hasPendingThisMonth && currentMonthPayments.filter((p) => p.status === "pendente").map((p) => (
                <p key={p.id} className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(p.amount)} · vence {formatDate(p.dueDate)}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance this month */}
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Presença — este mês</p>
            </div>
            <span className="text-sm font-bold text-primary">{presentCount}/{totalTrainings}</span>
          </div>
          {totalTrainings === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum treino registrado este mês.</p>
          ) : (
            <>
              {/* Progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${totalTrainings > 0 ? (presentCount / totalTrainings) * 100 : 0}%` }}
                />
              </div>
              {/* Attendance dots */}
              <div className="flex flex-wrap gap-1.5">
                {thisMonthAttendances
                  .sort((a, b) => (toDate(a.date)?.getTime() ?? 0) - (toDate(b.date)?.getTime() ?? 0))
                  .map((a) => {
                    const present = a.records?.find((r) => r.studentId === student.id)?.present;
                    const d = toDate(a.date);
                    return (
                      <div
                        key={a.id}
                        title={d ? d.toLocaleDateString("pt-BR") : ""}
                        className={`flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold ${
                          present ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/10 text-destructive/60"
                        }`}
                      >
                        {present ? "✓" : "✗"}
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>

        {/* Recent payments */}
        {sortedPayments.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Histórico de Pagamentos</p>
            <div className="space-y-2">
              {sortedPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {p.status === "pago"
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      : <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {p.type === "mensalidade" ? "Mensalidade" : p.type === "matricula" ? "Matrícula" : p.type}
                      </p>
                      <p className="text-[10px] text-muted-foreground">vence {formatDate(p.dueDate)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground">{formatCurrency(p.amount)}</p>
                    <p className={`text-[10px] font-medium ${p.status === "pago" ? "text-emerald-400" : "text-amber-400"}`}>
                      {p.status === "pago" ? "Pago" : "Pendente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical authorization badge */}
        {student.medicalInfo?.parentAuthorization && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
            <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-300">Autorização dos pais registrada</p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pb-4">
          Informações fornecidas por {schoolName}
        </p>
      </main>
    </div>
  );
}
