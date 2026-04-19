"use client";

import { useState } from "react";
import { Users, UserX, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/contexts/auth-context";
import { StudentForm } from "@/components/students/student-form";
import { StudentTable } from "@/components/students/student-table";
import { ImportarAlunos } from "@/components/students/importar-alunos";

// Names used in the seed data (setup/page.tsx)
const SAMPLE_NAMES = ["Lucas Mendes", "Ana Carolina Silva", "Pedro Oliveira", "Sofia Santos", "Gabriel Costa"];

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
  const [removingSamples, setRemovingSamples] = useState(false);
  const canManage = role !== "coach";

  const sampleStudents = allStudents.filter((s) => SAMPLE_NAMES.includes(s.name));
  const hasSamples = sampleStudents.length > 0;

  async function handleRemoveSamples() {
    if (!canManage) return;
    setRemovingSamples(true);
    try {
      for (const s of sampleStudents) await deleteStudent(s.id);
      toast.success("Alunos de exemplo removidos!");
    } catch {
      toast.error("Erro ao remover alunos de exemplo.");
    } finally {
      setRemovingSamples(false);
    }
  }

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
        {canManage && tab === "ativos" && (
          <div className="flex gap-2">
            <ImportarAlunos onImport={createStudent} />
            <StudentForm onSubmit={createStudent} />
          </div>
        )}
      </div>

      {/* Sample students banner */}
      {hasSamples && canManage && !loading && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3">
          <p className="text-sm text-blue-300">
            👋 Esses são <strong>alunos de exemplo</strong> criados automaticamente. Remova-os antes de começar a usar o sistema.
          </p>
          <button
            onClick={handleRemoveSamples}
            disabled={removingSamples}
            className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-blue-500/40 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/15 transition-colors disabled:opacity-60"
          >
            {removingSamples
              ? <><Loader2 className="w-3 h-3 animate-spin" />Removendo...</>
              : <><Trash2 className="w-3 h-3" />Remover exemplos</>}
          </button>
        </div>
      )}

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
