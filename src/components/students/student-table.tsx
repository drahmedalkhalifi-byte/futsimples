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
import {
  Pencil, Trash2, Search, Loader2, Users, MessageCircle,
  Link2, UserX, UserCheck,
} from "lucide-react";
import { formatWhatsAppNumber } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { StudentForm } from "./student-form";
import { FichaMedicaDialog } from "./ficha-medica-dialog";
import type { Student, StudentCategory } from "@/types";

function formatPhone(p: string): string {
  const d = p.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return p;
}

function calcAge(birthDate?: string, fallback?: number): number | null {
  if (birthDate) {
    const [y, m, d] = birthDate.split("-").map(Number);
    const today = new Date();
    let age = today.getFullYear() - y;
    if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
    return age;
  }
  return fallback ?? null;
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

const categories: StudentCategory[] = [
  "babyfoot","sub6","sub7","sub8","sub9","sub10","sub11","sub12","sub13","sub14","sub15",
];

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onUpdate: (id: string, data: Partial<Student>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeactivate?: (id: string) => Promise<void>;
  onReactivate?: (id: string) => Promise<void>;
  /** "active" = normal student list; "inactive" = ex-alunos list */
  mode?: "active" | "inactive";
}

export function StudentTable({
  students,
  loading,
  onUpdate,
  onDelete,
  onDeactivate,
  onReactivate,
  mode = "active",
}: StudentTableProps) {
  const { schoolName } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Deactivate confirmation
  const [deactivateTarget, setDeactivateTarget] = useState<Student | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  // Reactivate confirmation
  const [reactivateTarget, setReactivateTarget] = useState<Student | null>(null);
  const [reactivating, setReactivating] = useState(false);

  const [generatingPortal, setGeneratingPortal] = useState<string | null>(null);

  async function handleCopyPortalLink(student: Student) {
    setGeneratingPortal(student.id);
    try {
      let token = student.portalToken;
      if (!token) {
        token = crypto.randomUUID().replace(/-/g, "");
        await updateDoc(doc(db, "students", student.id), {
          portalToken: token,
          updatedAt: serverTimestamp(),
        });
        await onUpdate(student.id, { portalToken: token });
      }
      const link = `${window.location.origin}/portal/${token}`;
      await navigator.clipboard.writeText(link);
      toast.success("Link do portal copiado! Cole no WhatsApp para o responsável.");
    } catch {
      toast.error("Erro ao gerar link do portal.");
    } finally {
      setGeneratingPortal(null);
    }
  }

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.guardian.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      toast.success(`${deleteTarget.name} foi removido permanentemente.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      toast.error("Erro ao excluir aluno. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget || !onDeactivate) return;
    setDeactivating(true);
    try {
      await onDeactivate(deactivateTarget.id);
      toast.success(`${deactivateTarget.name} foi desativado. Você pode reativar em Ex-alunos.`);
      setDeactivateTarget(null);
    } catch (err) {
      console.error("Erro ao desativar aluno:", err);
      toast.error("Erro ao desativar aluno. Tente novamente.");
    } finally {
      setDeactivating(false);
    }
  }

  async function handleReactivate() {
    if (!reactivateTarget || !onReactivate) return;
    setReactivating(true);
    try {
      await onReactivate(reactivateTarget.id);
      toast.success(`${reactivateTarget.name} foi reativado e voltou para a lista de alunos ativos!`);
      setReactivateTarget(null);
    } catch (err) {
      console.error("Erro ao reativar aluno:", err);
      toast.error("Erro ao reativar aluno. Tente novamente.");
    } finally {
      setReactivating(false);
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
      {/* Filters */}
      {students.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou responsável..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(val) => { if (val !== null) { setCategoryFilter(val); setPage(0); } }}>
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
            {mode === "inactive" ? "Nenhum ex-aluno" : "Nenhum aluno cadastrado"}
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {mode === "inactive"
              ? "Alunos desativados aparecem aqui. O histórico deles é preservado."
              : "Comece cadastrando o primeiro aluno da sua escola usando o botão acima."}
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
            onClick={() => { setSearch(""); setCategoryFilter("all"); setPage(0); }}
            className="text-sm text-primary hover:underline mt-2"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Table */}
      {paginated.length > 0 && (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Responsável</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((student) => (
                <TableRow key={student.id} className={mode === "inactive" ? "opacity-70" : undefined}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{calcAge(student.birthDate, student.age) ?? "—"} anos</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={categoryColors[student.category]}>
                      {student.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{student.guardian}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatPhone(student.phone)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">

                      {/* Active-mode-only actions */}
                      {mode === "active" && (
                        <>
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
                          <FichaMedicaDialog student={student} onSave={onUpdate} />
                          <button
                            onClick={() => handleCopyPortalLink(student)}
                            disabled={generatingPortal === student.id}
                            title="Copiar link do portal do responsável"
                            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors disabled:opacity-50"
                          >
                            {generatingPortal === student.id
                              ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              : <Link2 className="w-4 h-4 text-primary/70" />
                            }
                          </button>
                        </>
                      )}

                      {/* Edit — always shown */}
                      <StudentForm
                        student={student}
                        onSubmit={async (data) => { await onUpdate(student.id, data); }}
                        trigger={
                          <span className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors cursor-pointer">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </span>
                        }
                      />

                      {/* Deactivate — active mode only */}
                      {mode === "active" && onDeactivate && (
                        <button
                          onClick={() => setDeactivateTarget(student)}
                          title="Desativar aluno (mantém histórico)"
                          className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-amber-500/10 transition-colors"
                        >
                          <UserX className="w-4 h-4 text-amber-500" />
                        </button>
                      )}

                      {/* Reactivate — inactive mode only */}
                      {mode === "inactive" && onReactivate && (
                        <button
                          onClick={() => setReactivateTarget(student)}
                          title="Reativar aluno"
                          className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-emerald-500/10 transition-colors"
                        >
                          <UserCheck className="w-4 h-4 text-emerald-500" />
                        </button>
                      )}

                      {/* Hard delete — always available */}
                      <button
                        onClick={() => setDeleteTarget(student)}
                        title="Excluir permanentemente"
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

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length} aluno{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Footer count */}
      {students.length > 0 && filtered.length <= PAGE_SIZE && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {students.length} aluno{students.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Dialogs ── */}

      {/* Deactivate confirmation */}
      <Dialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desativar Aluno</DialogTitle>
            <DialogDescription>
              <strong>{deactivateTarget?.name}</strong> será movido para a lista de ex-alunos. O histórico de presença e pagamentos é preservado. Você pode reativá-lo a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateTarget(null)} disabled={deactivating}>Cancelar</Button>
            <Button
              variant="default"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleDeactivate}
              disabled={deactivating}
            >
              {deactivating
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Desativando...</>
                : <><UserX className="w-4 h-4 mr-2" />Desativar</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate confirmation */}
      <Dialog open={!!reactivateTarget} onOpenChange={(open) => !open && setReactivateTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reativar Aluno</DialogTitle>
            <DialogDescription>
              <strong>{reactivateTarget?.name}</strong> voltará para a lista de alunos ativos e ficará disponível para registro de presença.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReactivateTarget(null)} disabled={reactivating}>Cancelar</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleReactivate}
              disabled={reactivating}
            >
              {reactivating
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Reativando...</>
                : <><UserCheck className="w-4 h-4 mr-2" />Reativar</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Aluno Permanentemente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Todo o histórico será perdido. Esta ação não pode ser desfeita. Se o aluno saiu da escola, use <strong>Desativar</strong> para preservar o histórico.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</>
                : "Excluir permanentemente"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
