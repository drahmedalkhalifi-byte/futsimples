"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays, Plus, Loader2, Trash2, Pencil,
  MapPin, Clock, RefreshCw, Trophy, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { useSchedule } from "@/hooks/use-schedule";
import { useChampionships } from "@/hooks/use-championships";
import { useAuth } from "@/contexts/auth-context";
import type { Schedule, ScheduleType, StudentCategory, Championship } from "@/types";

const categories: StudentCategory[] = [
  "babyfoot","sub6","sub7","sub8","sub9","sub10","sub11","sub12","sub13","sub14","sub15",
];

const categoryColors: Record<StudentCategory, string> = {
  babyfoot: "bg-amber-100 text-amber-700 border-amber-200",
  sub6:  "bg-pink-100 text-pink-700 border-pink-200",
  sub7:  "bg-blue-100 text-blue-700 border-blue-200",
  sub8:  "bg-cyan-100 text-cyan-700 border-cyan-200",
  sub9:  "bg-green-100 text-green-700 border-green-200",
  sub10: "bg-teal-100 text-teal-700 border-teal-200",
  sub11: "bg-violet-100 text-violet-700 border-violet-200",
  sub12: "bg-purple-100 text-purple-700 border-purple-200",
  sub13: "bg-indigo-100 text-indigo-700 border-indigo-200",
  sub14: "bg-orange-100 text-orange-700 border-orange-200",
  sub15: "bg-rose-100 text-rose-700 border-rose-200",
};

const DAY_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

// ─── helpers ─────────────────────────────────────────────────────────────────

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value)
    return (value as { toDate: () => Date }).toDate();
  if (typeof value === "string") return new Date(value);
  return null;
}

function formatDate(value: unknown, opts?: Intl.DateTimeFormatOptions): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR", opts ?? {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateShort(value: unknown): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLabel(days: number[] = []): string {
  if (days.length === 0) return "Nenhum dia";
  const sorted = [...days].sort((a, b) => a - b).map((d) => DAY_LABELS[d]);
  if (sorted.length === 1) return `Toda ${sorted[0]}`;
  const last = sorted.pop();
  return `Toda ${sorted.join(", ")} e ${last}`;
}

type ChampStatus = "upcoming" | "ongoing" | "completed";

function getChampStatus(c: Championship): ChampStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = toDate(c.startDate);
  const end   = toDate(c.endDate ?? null);
  if (!start) return "upcoming";
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  if (s > today) return "upcoming";
  if (end) { const e = new Date(end); e.setHours(0, 0, 0, 0); if (e < today) return "completed"; }
  return "ongoing";
}

const STATUS_CONFIG: Record<ChampStatus, { label: string; dot: string; card: string }> = {
  upcoming:  { label: "Próximo",        dot: "bg-amber-400",  card: "border-amber-500/25 bg-amber-500/5" },
  ongoing:   { label: "Em andamento",   dot: "bg-primary",    card: "border-primary/25 bg-primary/5" },
  completed: { label: "Concluído",      dot: "bg-muted-foreground/40", card: "border-border/40 bg-muted/20" },
};

// ─── ChampionshipForm ─────────────────────────────────────────────────────────

interface ChampFormProps {
  champ?: Championship;
  onSubmit: (data: Omit<Championship, "id" | "schoolId" | "createdAt" | "updatedAt">) => Promise<void>;
  trigger?: React.ReactNode;
}

function ChampionshipForm({ champ, onSubmit, trigger }: ChampFormProps) {
  const isEditing = !!champ;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function dateStr(val: unknown) {
    const d = toDate(val);
    return d ? d.toISOString().slice(0, 10) : "";
  }

  const [name,       setName]       = useState(champ?.name ?? "");
  const [organizer,  setOrganizer]  = useState(champ?.organizer ?? "");
  const [startDate,  setStartDate]  = useState(dateStr(champ?.startDate));
  const [endDate,    setEndDate]    = useState(dateStr(champ?.endDate));
  const [location,   setLocation]   = useState(champ?.location ?? "");
  const [selCats,    setSelCats]    = useState<StudentCategory[]>(champ?.categories ?? []);
  const [notes,      setNotes]      = useState(champ?.notes ?? "");

  function toggleCat(cat: StudentCategory) {
    setSelCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function reset() {
    if (isEditing) return;
    setName(""); setOrganizer(""); setStartDate(""); setEndDate("");
    setLocation(""); setSelCats([]); setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim())      { toast.error("Preencha o nome do campeonato."); return; }
    if (!startDate)        { toast.error("Informe a data de início."); return; }
    if (!location.trim())  { toast.error("Informe o local."); return; }
    if (selCats.length === 0) { toast.error("Selecione ao menos uma categoria."); return; }

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        organizer: organizer.trim() || undefined,
        startDate: new Date(startDate + "T12:00:00"),
        endDate:   endDate ? new Date(endDate + "T12:00:00") : undefined,
        location:  location.trim(),
        categories: selCats,
        notes: notes.trim() || undefined,
      });
      setOpen(false);
      reset();
      toast.success(isEditing ? "Campeonato atualizado!" : "Campeonato cadastrado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar campeonato.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger
        ? <DialogTrigger className="inline-flex items-center">{trigger}</DialogTrigger>
        : (
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Novo Campeonato
          </DialogTrigger>
        )
      }
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            {isEditing ? "Editar Campeonato" : "Novo Campeonato"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados do campeonato." : "Cadastre um campeonato e selecione as categorias participantes."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="cname">Nome do campeonato *</Label>
            <Input id="cname" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Copa Municipal Sub9, Torneio de Verão..." disabled={saving} autoFocus />
          </div>

          {/* Organizador */}
          <div className="space-y-2">
            <Label htmlFor="org">Organizador (opcional)</Label>
            <Input id="org" value={organizer} onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Liga Municipal, Federação..." disabled={saving} />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startD">Data de início *</Label>
              <Input id="startD" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endD">Data de fim (opcional)</Label>
              <Input id="endD" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                min={startDate} disabled={saving} />
            </div>
          </div>

          {/* Local */}
          <div className="space-y-2">
            <Label htmlFor="cloc">Local *</Label>
            <Input id="cloc" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Campo X, Complexo Esportivo..." disabled={saving} />
          </div>

          {/* Categorias */}
          <div className="space-y-2">
            <Label>
              Categorias participantes *
              {selCats.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {selCats.length} selecionada{selCats.length !== 1 ? "s" : ""}
                </span>
              )}
            </Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-all ${
                    selCats.includes(cat)
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={() => setSelCats([...categories])}
                className="text-xs text-primary hover:underline">Selecionar todas</button>
              <span className="text-xs text-muted-foreground">·</span>
              <button type="button" onClick={() => setSelCats([])}
                className="text-xs text-muted-foreground hover:underline">Limpar</button>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="cnotes">Observações (opcional)</Label>
            <Input id="cnotes" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações sobre grupos, regras, premiação..." disabled={saving} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                : isEditing ? "Salvar Alterações" : "Cadastrar Campeonato"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── ChampionshipCard ─────────────────────────────────────────────────────────

interface ChampCardProps {
  champ: Championship;
  canManage: boolean;
  onEdit: (data: Omit<Championship, "id"|"schoolId"|"createdAt"|"updatedAt">) => Promise<void>;
  onDelete: () => void;
}

function ChampionshipCard({ champ, canManage, onEdit, onDelete }: ChampCardProps) {
  const status = getChampStatus(champ);
  const cfg    = STATUS_CONFIG[status];

  const dateRange = (() => {
    const s = formatDateShort(champ.startDate);
    const e = champ.endDate ? formatDateShort(champ.endDate) : null;
    return e && e !== s ? `${s} → ${e}` : s;
  })();

  return (
    <div className={`rounded-xl border p-5 transition-all ${cfg.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="font-bold text-foreground">{champ.name}</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status === "ongoing"   ? "bg-primary/15 text-primary" :
              status === "upcoming"  ? "bg-amber-500/15 text-amber-400" :
                                       "bg-muted text-muted-foreground"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Organizer */}
          {champ.organizer && (
            <p className="text-xs text-muted-foreground mb-2">Organização: {champ.organizer}</p>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-3">
            {champ.categories.map((cat) => (
              <Badge key={cat} variant="outline" className={`text-[11px] py-0 ${categoryColors[cat]}`}>
                {cat}
              </Badge>
            ))}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              {dateRange}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {champ.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 shrink-0" />
              {champ.categories.length} categoria{champ.categories.length !== 1 ? "s" : ""}
            </span>
          </div>

          {champ.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-border/50 pl-2">
              {champ.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        {canManage && (
          <div className="flex gap-1 shrink-0">
            <ChampionshipForm
              champ={champ}
              onSubmit={onEdit}
              trigger={
                <span className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors cursor-pointer">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </span>
              }
            />
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ScheduleForm ─────────────────────────────────────────────────────────────

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
  const [title,     setTitle]     = useState(schedule?.title ?? "");
  const [type,      setType]      = useState<ScheduleType>(schedule?.type ?? "treino");
  const [category,  setCategory]  = useState<StudentCategory>(schedule?.category ?? "sub9");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(schedule?.daysOfWeek ?? []);
  const [date,      setDate]      = useState(() => {
    const d = schedule?.date;
    if (!d) return "";
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    if (typeof d === "object" && "toDate" in d) return (d as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
    return "";
  });
  const [time,      setTime]      = useState(schedule?.time ?? "");
  const [location,  setLocation]  = useState(schedule?.location ?? "");
  const [notes,     setNotes]     = useState(schedule?.notes ?? "");

  function toggleDay(day: number) {
    setDaysOfWeek((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  function reset() {
    if (!isEditing) {
      setRecurring(false); setTitle(""); setType("treino"); setCategory("sub9");
      setDaysOfWeek([]); setDate(""); setTime(""); setLocation(""); setNotes("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Preencha o título do evento."); return; }
    if (recurring && daysOfWeek.length === 0) { toast.error("Selecione pelo menos um dia da semana."); return; }
    if (!recurring && !date) { toast.error("Informe a data do evento."); return; }
    if (!time) { toast.error("Informe o horário."); return; }
    if (!location.trim()) { toast.error("Informe o local."); return; }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(), type, category,
        date: recurring ? new Date() : new Date(date + "T12:00:00"),
        time, location: location.trim(),
        notes: notes.trim() || undefined,
        recurring,
        daysOfWeek: recurring ? daysOfWeek : undefined,
      });
      setOpen(false);
      reset();
      toast.success(isEditing ? "Evento atualizado!" : "Evento cadastrado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar evento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger
        ? <DialogTrigger className="inline-flex items-center">{trigger}</DialogTrigger>
        : (
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Novo Evento
          </DialogTrigger>
        )
      }
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Novo Evento"}</DialogTitle>
          <DialogDescription>{isEditing ? "Atualize os dados do evento." : "Agende um treino ou jogo."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(type === "treino" || !isEditing) && (
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
              <button type="button" onClick={() => { setRecurring(false); setType("treino"); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!recurring ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                Pontual
              </button>
              <button type="button" onClick={() => { setRecurring(true); setType("treino"); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${recurring ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <RefreshCw className="w-3.5 h-3.5" />
                Recorrente
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treino Sub9, Jogo vs Flamengo..." disabled={saving} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          {recurring && (
            <div className="space-y-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, i) => (
                  <button type="button" key={i} onClick={() => toggleDay(i)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium border transition-colors ${
                      daysOfWeek.includes(i)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

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

          {recurring && (
            <div className="space-y-2">
              <Label htmlFor="timeR">Horário (24h)</Label>
              <Input id="timeR" type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={saving} className="w-36" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Campo principal, Ginásio..." disabled={saving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais..." disabled={saving} />
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
  const { schedules, loading: loadingSched, createSchedule, updateSchedule, deleteSchedule } = useSchedule();
  const { championships, loading: loadingChamp, createChampionship, updateChampionship, deleteChampionship } = useChampionships();

  const [tab, setTab] = useState<"agenda" | "campeonatos">("agenda");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; kind: "schedule" | "championship" } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const canManage = role !== "coach";

  const loading = loadingSched || loadingChamp;

  // ── Schedule data ──────────────────────────────────────────────────────────
  const recurringSchedules = schedules.filter((s) => s.recurring);
  const oneTimeSchedules   = schedules.filter((s) => !s.recurring);
  const sortedOneTime      = [...oneTimeSchedules].sort((a, b) => {
    const ms = (v: unknown) => toDate(v)?.getTime() ?? 0;
    return ms(a.date) - ms(b.date);
  });
  const filtered = typeFilter === "all"
    ? sortedOneTime
    : sortedOneTime.filter((s) => s.type === typeFilter);

  // ── Championship data ──────────────────────────────────────────────────────
  const sortedChamps = [...championships].sort((a, b) => {
    const order: Record<ChampStatus, number> = { ongoing: 0, upcoming: 1, completed: 2 };
    const sa = order[getChampStatus(a)];
    const sb = order[getChampStatus(b)];
    if (sa !== sb) return sa - sb;
    return (toDate(a.startDate)?.getTime() ?? 0) - (toDate(b.startDate)?.getTime() ?? 0);
  });

  const ongoingChamps   = sortedChamps.filter((c) => getChampStatus(c) === "ongoing");
  const upcomingChamps  = sortedChamps.filter((c) => getChampStatus(c) === "upcoming");
  const completedChamps = sortedChamps.filter((c) => getChampStatus(c) === "completed");

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "schedule") await deleteSchedule(deleteTarget.id);
      else await deleteChampionship(deleteTarget.id);
      toast.success("Removido com sucesso.");
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao remover.");
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
          <p className="text-sm text-muted-foreground mt-1">Treinos, jogos e campeonatos</p>
        </div>
        {canManage && (
          tab === "agenda"
            ? <ScheduleForm onSubmit={createSchedule} />
            : <ChampionshipForm onSubmit={createChampionship} />
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab("agenda")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "agenda" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <CalendarDays className="w-4 h-4" />
          Agenda
          {schedules.length > 0 && (
            <span className={`rounded-full text-xs px-1.5 py-0.5 font-semibold ${tab === "agenda" ? "bg-primary/10 text-primary" : "bg-muted-foreground/20 text-muted-foreground"}`}>
              {schedules.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("campeonatos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "campeonatos" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Trophy className="w-4 h-4" />
          Campeonatos
          {championships.length > 0 && (
            <span className={`rounded-full text-xs px-1.5 py-0.5 font-semibold ${tab === "campeonatos" ? "bg-amber-500/15 text-amber-400" : "bg-muted-foreground/20 text-muted-foreground"}`}>
              {championships.length}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════ TAB: AGENDA ══════════════ */}
      {tab === "agenda" && (
        <>
          {/* Recurring trainings */}
          {recurringSchedules.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Treinos Semanais Fixos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recurringSchedules.map((s) => (
                  <div key={s.id} className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">{s.title}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs">{s.category}</Badge>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs hover:bg-primary/10">
                            <RefreshCw className="w-2.5 h-2.5 mr-1" />Recorrente
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
                          <ScheduleForm schedule={s} onSubmit={(data) => updateSchedule(s.id, data)}
                            trigger={<span className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></span>} />
                          <button onClick={() => setDeleteTarget({ id: s.id, title: s.title, kind: "schedule" })}
                            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors">
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

          {/* Filter */}
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

          {/* One-time events */}
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
                          <ScheduleForm schedule={s} onSubmit={(data) => updateSchedule(s.id, data)}
                            trigger={<span className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors cursor-pointer"><Pencil className="w-4 h-4 text-muted-foreground" /></span>} />
                          <button onClick={() => setDeleteTarget({ id: s.id, title: s.title, kind: "schedule" })}
                            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors">
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
        </>
      )}

      {/* ══════════════ TAB: CAMPEONATOS ══════════════ */}
      {tab === "campeonatos" && (
        <div className="space-y-6">

          {/* Empty state */}
          {championships.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 mb-4">
                <Trophy className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Nenhum campeonato cadastrado</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Cadastre campeonatos e selecione quais categorias (sub8, sub9…) vão participar.
              </p>
            </div>
          )}

          {/* Em andamento */}
          {ongoingChamps.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 text-primary">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                Em Andamento ({ongoingChamps.length})
              </h3>
              <div className="space-y-3">
                {ongoingChamps.map((c) => (
                  <ChampionshipCard key={c.id} champ={c} canManage={canManage}
                    onEdit={(data) => updateChampionship(c.id, data)}
                    onDelete={() => setDeleteTarget({ id: c.id, title: c.name, kind: "championship" })} />
                ))}
              </div>
            </section>
          )}

          {/* Próximos */}
          {upcomingChamps.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 text-amber-400">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                Próximos ({upcomingChamps.length})
              </h3>
              <div className="space-y-3">
                {upcomingChamps.map((c) => (
                  <ChampionshipCard key={c.id} champ={c} canManage={canManage}
                    onEdit={(data) => updateChampionship(c.id, data)}
                    onDelete={() => setDeleteTarget({ id: c.id, title: c.name, kind: "championship" })} />
                ))}
              </div>
            </section>
          )}

          {/* Concluídos */}
          {completedChamps.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" />
                Concluídos ({completedChamps.length})
              </h3>
              <div className="space-y-3">
                {completedChamps.map((c) => (
                  <ChampionshipCard key={c.id} champ={c} canManage={canManage}
                    onEdit={(data) => updateChampionship(c.id, data)}
                    onDelete={() => setDeleteTarget({ id: c.id, title: c.name, kind: "championship" })} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir</DialogTitle>
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
