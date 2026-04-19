"use client";

import { useState } from "react";
import { Users, UserX } from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/contexts/auth-context";
import { StudentForm } from "@/components/students/student-form";
import { StudentTable } from "@/components/students/student-table";

export default function AlunosPage() {
  const { role } = useAuth();
  const {
    students: allStudents,
    loading,
    createStudent,
    updateStudent,
    deactivateStudent,
    reactivateStudent,
    deleteStudent,
  } = useStudents({ activeOnly: false });

  const [tab, setTab] = useState<"ativos" | "inativos">("ativos");
  const canManage = role !== "coach";

  const activeStudents   = allStudents.filter((s) => s.active !== false);
  const inactiveStudents = allStudents.filter((s) => s.active === false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Alunos</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os alunos da sua escola</p>
        </div>
        {canManage && tab === "ativos" && <StudentForm onSubmit={createStudent} />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("ativos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "ativos"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Ativos
          <span className={`rounded-full text-xs px-1.5 py-0.5 font-semibold ${
            tab === "ativos" ? "bg-primary/10 text-primary" : "bg-muted-foreground/20 text-muted-foreground"
          }`}>
            {activeStudents.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("inativos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "inativos"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserX className="w-4 h-4" />
          Ex-alunos
          {inactiveStudents.length > 0 && (
            <span className={`rounded-full text-xs px-1.5 py-0.5 font-semibold ${
              tab === "inativos" ? "bg-amber-500/15 text-amber-400" : "bg-muted-foreground/20 text-muted-foreground"
            }`}>
              {inactiveStudents.length}
            </span>
          )}
        </button>
      </div>

      {/* Ativos */}
      {tab === "ativos" && (
        <StudentTable
          students={activeStudents}
          loading={loading}
          onUpdate={updateStudent}
          onDelete={deleteStudent}
          onDeactivate={canManage ? deactivateStudent : undefined}
          mode="active"
        />
      )}

      {/* Ex-alunos */}
      {tab === "inativos" && (
        <>
          {inactiveStudents.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
              <UserX className="w-4 h-4 shrink-0" />
              Esses alunos estão desativados. Presença e pagamentos anteriores estão preservados no histórico. Clique em <strong className="mx-1">Reativar</strong> para voltar um aluno à lista ativa.
            </div>
          )}
          <StudentTable
            students={inactiveStudents}
            loading={loading}
            onUpdate={updateStudent}
            onDelete={deleteStudent}
            onReactivate={canManage ? reactivateStudent : undefined}
            mode="inactive"
          />
        </>
      )}
    </div>
  );
}
