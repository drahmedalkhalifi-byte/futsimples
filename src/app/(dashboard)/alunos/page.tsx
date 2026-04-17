"use client";

import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/contexts/auth-context";
import { StudentForm } from "@/components/students/student-form";
import { StudentTable } from "@/components/students/student-table";

export default function AlunosPage() {
  const { role } = useAuth();
  const { students, loading, createStudent, updateStudent, deleteStudent } =
    useStudents({ activeOnly: true });

  const canManage = role !== "coach";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Alunos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os alunos da sua escola
          </p>
        </div>
        {canManage && <StudentForm onSubmit={createStudent} />}
      </div>

      <StudentTable
        students={students}
        loading={loading}
        onUpdate={updateStudent}
        onDelete={deleteStudent}
      />
    </div>
  );
}
