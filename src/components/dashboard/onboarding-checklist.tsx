"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from "lucide-react";
import Link from "next/link";

interface ChecklistState {
  hasStudent: boolean;
  hasAttendance: boolean;
  hasPayment: boolean;
  hasCoach: boolean;
  loading: boolean;
}

interface Step {
  id: string;
  label: string;
  description: string;
  href?: string;
  linkLabel?: string;
  done: boolean;
}

export function OnboardingChecklist({ activeStudents }: { activeStudents: number }) {
  const { schoolId } = useAuth();
  const [state, setState] = useState<ChecklistState>({
    hasStudent: false,
    hasAttendance: false,
    hasPayment: false,
    hasCoach: false,
    loading: true,
  });
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed this checklist
    const key = `onboarding_dismissed_${schoolId}`;
    if (localStorage.getItem(key) === "true") {
      setDismissed(true);
    }
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;

    async function fetchState() {
      try {
        const [attendanceSnap, paymentSnap, coachSnap] = await Promise.all([
          getDocs(query(
            collection(db, "schools", schoolId!, "attendance"),
            limit(1)
          )),
          getDocs(query(
            collection(db, "schools", schoolId!, "payments"),
            where("status", "==", "pago"),
            limit(1)
          )),
          getDocs(query(
            collection(db, "users"),
            where("schoolId", "==", schoolId),
            where("role", "==", "coach"),
            limit(1)
          )),
        ]);

        setState({
          hasStudent: activeStudents > 0,
          hasAttendance: !attendanceSnap.empty,
          hasPayment: !paymentSnap.empty,
          hasCoach: !coachSnap.empty,
          loading: false,
        });
      } catch {
        setState(prev => ({ ...prev, loading: false }));
      }
    }

    fetchState();
  }, [schoolId, activeStudents]);

  function handleDismiss() {
    const key = `onboarding_dismissed_${schoolId}`;
    localStorage.setItem(key, "true");
    setDismissed(true);
  }

  if (dismissed || state.loading) return null;

  const steps: Step[] = [
    {
      id: "account",
      label: "Criar sua conta",
      description: "Sua escola está cadastrada no FutSimples.",
      done: true,
    },
    {
      id: "student",
      label: "Cadastrar o primeiro aluno",
      description: "Adicione seus alunos com categoria, responsável e dados de contato.",
      href: "/alunos",
      linkLabel: "Ir para Alunos →",
      done: state.hasStudent,
    },
    {
      id: "attendance",
      label: "Marcar presença no primeiro treino",
      description: "Registre a presença dos alunos em um treino para ter histórico.",
      href: "/presenca",
      linkLabel: "Ir para Presença →",
      done: state.hasAttendance,
    },
    {
      id: "payment",
      label: "Registrar o primeiro pagamento",
      description: "Confirme o pagamento de uma mensalidade e comece a controlar a inadimplência.",
      href: "/pagamentos",
      linkLabel: "Ir para Pagamentos →",
      done: state.hasPayment,
    },
    {
      id: "coach",
      label: "Convidar um professor",
      description: "Adicione professores para que eles possam marcar presença e ver a agenda.",
      href: "/configuracoes",
      linkLabel: "Ir para Configurações →",
      done: state.hasCoach,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  // Auto-hide when all steps are done
  if (allDone) return null;

  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/10" />
                <circle
                  cx="18" cy="18" r="15.9"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeDasharray={`${progress} ${100 - progress}`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
                {completedCount}/{steps.length}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Primeiros passos</p>
            <p className="text-xs text-muted-foreground">
              {completedCount === 0
                ? "Siga os passos para configurar sua escola"
                : `${completedCount} de ${steps.length} passos concluídos`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="border-t border-primary/10 divide-y divide-primary/10">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                step.done ? "opacity-60" : "bg-white/40"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {step.done
                  ? <CheckCircle2 className="w-5 h-5 text-primary" />
                  : <Circle className="w-5 h-5 text-primary/30" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                )}
                {!step.done && step.href && (
                  <Link
                    href={step.href}
                    className="inline-block mt-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    {step.linkLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
