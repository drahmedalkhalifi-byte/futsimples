"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Search, Loader2, Users, MessageCircle } from "lucide-react";
import { formatWhatsAppNumber } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { StudentForm } from "./student-form";
import type { Student, StudentCategory } from "@/types";

function formatPhone(p: string): string {
  const d = p.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return p;
}

function whatsappUrl(student: Student, schoolName: string): string {
  const number = formatWhatsAppNumber(student.phone);
  const text = encodeURIComponent(
    `Ol\u00E1 ${student.guardian}! Aqui \u00E9 da ${schoolName}. Gostaria de falar sobre *${student.name}*. Quando puder, entre em contato. Obrigado!`
  );
  return `https://wa.me/${number}?text=${text}`;
}

const categoryColors: Record<StudentCategory, string> = {
  babyfoot: "bg-amber-100 text-amber-700 border-amber-200",
  sub6:     "bg-pink-100 text-pink-700 border-pink-200",
  sub7:     "bg-blue-100 text-blue-700 border-blue-200",
  sub8:     "bg-cyan-100 text-cyan-700 border-cyan-200",
  sub9:     "bg-green-100 text-green-700 border-green-200",
  sub10:    "bg-teal-100 text-teal-700 border-teal-200",
  sub11:    "bg-violet-100 text-violet-700 border-violet-200",
  sub12:    "bg-purple-100 text-purple-700 border-purple-200",
  sub13:    "bg-indigo-100 text-indigo-700 border-indigo-200",
  sub14:    "bg-orange-100 text-orange-700 border-orange-200",
  sub15:    "bg-rose-100 text-rose-700 border-rose-200",
};

const categories: StudentCategory[] = ["babyfoot", "sub6", "sub7", "sub8", "sub9", "sub10", "sub11", "sub12", "sub13", "sub14", "sub15"];

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onUpdate: (id: string, data: Partial<Student>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function StudentTable({
  students,
  loading,
  onUpdate,
  onDelete,
}: StudentTableProps) {
  const { schoolName } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.guardian.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      toast.success(`${deleteTarget.name} foi removido.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      toast.error("Erro ao excluir aluno. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Carregando alunos...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters — only show if there are students */}
      {students.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(val) => val !== null && setCategoryFilter(val)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Empty state — no students at all */}
      {students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Nenhum aluno cadastrado
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Comece cadastrando o primeiro aluno da sua escola usando o botão acima.
          </p>
        </div>
      )}

      {/* Empty state — filters returned nothing */}
      {students.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="w-8 h-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum aluno encontrado com esses filtros.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
            }}
            className="text-sm text-primary hover:underline mt-2"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden md:table-cell">
                  Responsável
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Telefone
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.age} anos</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={categoryColors[student.category]}
                    >
                      {student.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {student.guardian}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatPhone(student.phone)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {student.phone && (
                        <a
                          href={whatsappUrl(student, schoolName ?? "nossa escola")}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Contato via WhatsApp"
                          className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-green-50 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </a>
                      )}
                      <StudentForm
                        student={student}
                        onSubmit={async (data) => {
                          await onUpdate(student.id, data);
                        }}
                        trigger={
                          <span className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors cursor-pointer">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </span>
                        }
                      />
                      <button
                        onClick={() => setDeleteTarget(student)}
                        className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer count */}
      {students.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {students.length} aluno
          {students.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Aluno</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
