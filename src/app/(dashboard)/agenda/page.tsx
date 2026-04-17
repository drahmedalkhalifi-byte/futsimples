"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Loader2,
  Trash2,
  Pencil,
  MapPin,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSchedule } from "@/hooks/use-schedule";
import { useAuth } from "@/contexts/auth-context";
import type { Schedule, ScheduleType, StudentCategory } from "@/types";

const categories: StudentCategory[] = ["babyfoot", "sub6", "sub7", "sub8", "sub9", "sub10", "sub11", "sub12", "sub13", "sub14", "sub15"];

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\u00E1b"];
const DAY_FULL = ["Domingo", "Segunda", "Ter\u00E7a", "Quarta", "Quinta", "Sexta", "S\u00E1bado"];

function daysLabel(days: number[] = []): string {
  if (days.length === 0) return "Nenhum dia";
  const sorted = [...days].sort((a, b) => a - b);
  const names = sorted.map((d) => DAY_LABELS[d]);
  if (names.length === 1) return `Toda ${names[0]}`;
  const last = names.pop();
  return `Toda ${names.join(", ")} e ${last}`;
}

function formatDate(value: unknown): string {
  if (!value) return "\u2014";
  if (value instanceof Date) {
    return value.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const d = (value as { toDate: () => Date }).toDate();
    return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  }
  if (typeof value === "string") {
    const [year, month, day] = value.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  }
  return "\u2014";
}

// ─── ScheduleForm ────────────────────────────────────────────────────────────

interface ScheduleFormProps {
  schedule?: Schedule;
  onSubmit: (data: Omit<Schedule, "id" | "schoolId" | "createdAt" | "updatedAt">) => Promise<void>;
  trigger?: React.ReactNode;
}

function ScheduleForm({ schedule, onSubmit, trigger }: ScheduleFormProps) {
  const isEditing = !!schedule;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [recurring, setRecurring] = useState(schedule?.recurring ?? false);
  const [title, setTitle] = useState(schedule?.title ?? "");
  const [type, setType] = useState<ScheduleType>(schedule?.type ?? "treino");
  const [category, setCategory] = useState<StudentCategory>(schedule?.category ?? "sub9");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(schedule?.daysOfWeek ?? []);
  const [date, setDate] = useState(() => {
    const d = schedule?.date;
    if (!d) return "";
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    if (typeof d === "object" && "toDate" in d) return (d as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
    return "";
  });
  const [time, setTime] = useState(schedule?.time ?? "");
  const [location, setLocation] = useState(schedule?.location ?? "");
  const [notes, setNotes] = useState(schedule?.notes ?? "");

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function reset() {
    if (!isEditing) {
      setRecurring(false);
      setTitle("");
      setType("treino");
      setCategory("sub9");
      setDaysOfWeek([]);
      setDate("");
      setTime("");
      setLocation("");
      setNotes("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Preencha o t\u00EDtulo do evento."); return; }
    if (recurring && daysOfWeek.length === 0) { toast.error("Selecione pelo menos um dia da semana."); return; }
    if (!recurring && !date) { toast.error("Informe a data do evento."); return; }
    if (!time) { toast.error("Informe o hor\u00E1rio."); return; }
    if (!location.trim()) { toast.error("Informe o local."); return; }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        category,
        date: recurring ? new Date() : new Date(date + "T12:00:00"),
        time,
        location: location.trim(),
        notes: notes.trim() || undefined,
        recurring,
        daysOfWeek: recurring ? daysOfWeek : undefined,
      });
      setOpen(false);
      reset();
      toast.success(isEditing ? "Evento atualizado!" : "Evento cadastrado!");
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
      toast.error("Erro ao salvar evento. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger className="inline-flex items-center">{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Novo Evento
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Novo Evento"}</DialogTitle>
          <DialogDescription>{isEditing ? "Atualize os dados do evento." : "Agende um treino ou jogo."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Recurring toggle (only for treinos) */}
          {(type === "treino" || !isEditing) && (
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
              <button
                type="button"
                onClick={() => { setRecurring(false); setType("treino"); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!recurring ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Pontual
              </button>
              <button
                type="button"
                onClick={() => { setRecurring(true); setType("treino"); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${recurring ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Recorrente
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Treino Sub9, Jogo vs Flamengo..." disabled={saving} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type selector only for non-recurring */}
            {!recurring && (
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(val) => { if (val != null) setType(val as ScheduleType); }}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treino">Treino</SelectItem>
                    <SelectItem value="jogo">Jogo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(val) => { if (val != null) setCategory(val as StudentCategory); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Days of week — only for recurring */}
          {recurring && (
            <div className="space-y-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium border transition-colors ${
                      daysOfWeek.includes(i)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date — only for non-recurring */}
          {!recurring && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário (24h)</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={saving} />
              </div>
            </div>
          )}

          {/* Time only row — for recurring */}
          {recurring && (
            <div className="space-y-2">
              <Label htmlFor="timeR">Horário (24h)</Label>
              <Input id="timeR" type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={saving} className="w-36" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Campo principal, Ginásio..." disabled={saving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Informações adicionais..." disabled={saving} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : isEditing ? "Salvar Alterações" : "Cadastrar Evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── AgendaPage ───────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const { role } = useAuth();
  const { schedules, loading, createSchedule, updateSchedule, deleteSchedule } = useSchedule();
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const canManage = role !== "coach";

  // Split recurring vs one-time
  const recurringSchedules = schedules.filter((s) => s.recurring);
  const oneTimeSchedules = schedules.filter((s) => !s.recurring);

  // Sort one-time by date ascending
  const sortedOneTime = [...oneTimeSchedules].sort((a, b) => {
    const toMs = (v: unknown): number => {
      if (v instanceof Date) return v.getTime();
      if (typeof v === "object" && v !== null && "toDate" in v) return (v as { toDate: () => Date }).toDate().getTime();
      if (typeof v === "string") return new Date(v).getTime();
      return 0;
    };
    return toMs(a.date) - toMs(b.date);
  });

  const filtered = typeFilter === "all" ? sortedOneTime : sortedOneTime.filter((s) => s.type === typeFilter);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSchedule(deleteTarget.id);
      toast.success("Evento removido.");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erro ao remover evento:", err);
      toast.error("Erro ao remover evento.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando agenda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Agenda</h2>
          <p className="text-sm text-muted-foreground mt-1">Treinos e jogos programados</p>
        </div>
        {canManage && <ScheduleForm onSubmit={createSchedule} />}
      </div>

      {/* Recurring trainings section */}
      {recurringSchedules.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Treinos Semanais Fixos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recurringSchedules.map((s) => (
              <div key={s.id} className="rounded-lg border border-primary/20 bg-primary/5 p-4 relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">{s.title}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs">{s.category}</Badge>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs hover:bg-primary/10">
                        <RefreshCw className="w-2.5 h-2.5 mr-1" />
                        Recorrente
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">{daysLabel(s.daysOfWeek)}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                    </div>
                    {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
                  </div>
                  {canManage && (
                    <div className="flex gap-1 shrink-0">
                      <ScheduleForm
                        schedule={s}
                        onSubmit={(data) => updateSchedule(s.id, data)}
                        trigger={
                          <span className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors cursor-pointer">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </span>
                        }
                      />
                      <button onClick={() => setDeleteTarget(s)} className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* One-time events filter */}
      {oneTimeSchedules.length > 0 && (
        <div className="flex gap-3">
          <Select value={typeFilter} onValueChange={(val) => val !== null && setTypeFilter(val)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="treino">Treinos</SelectItem>
              <SelectItem value="jogo">Jogos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Empty state */}
      {schedules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <CalendarDays className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Nenhum evento cadastrado</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Crie um treino recorrente para cada categoria ou agende eventos pontuais.
          </p>
        </div>
      )}

      {/* One-time events list */}
      {filtered.length > 0 && (
        <section>
          {recurringSchedules.length > 0 && (
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Eventos Pontuais
            </h3>
          )}
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className={`rounded-lg border p-4 ${s.type === "jogo" ? "border-amber-200/60 bg-amber-50/30" : "border-border/50 bg-card"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="font-semibold text-foreground text-sm">{s.title}</p>
                      <Badge variant="outline" className="text-xs">{s.category}</Badge>
                      <Badge className={`text-xs ${s.type === "jogo" ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"}`}>
                        {s.type === "jogo" ? "Jogo" : "Treino"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{formatDate(s.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.location}</span>
                    </div>
                    {s.notes && <p className="text-xs text-muted-foreground mt-1.5 italic">{s.notes}</p>}
                  </div>
                  {canManage && (
                    <div className="flex gap-1 shrink-0">
                      <ScheduleForm
                        schedule={s}
                        onSubmit={(data) => updateSchedule(s.id, data)}
                        trigger={
                          <span className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors cursor-pointer">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </span>
                        }
                      />
                      <button onClick={() => setDeleteTarget(s)} className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {oneTimeSchedules.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum evento encontrado com esse filtro.</p>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Evento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.title}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</> : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
