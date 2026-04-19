"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Settings, UserPlus, Loader2, Trash2, AlertCircle, CheckCircle2, Users, QrCode } from "lucide-react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import { doc, setDoc, serverTimestamp, collection, query, where, onSnapshot, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "coach";
  createdAt: unknown;
}

export default function ConfiguracoesPage() {
  const { schoolId, schoolName, role, user } = useAuth();
  const isAdmin = role === "admin";

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteDone, setInviteDone] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  // PIX key
  const [pixKey, setPixKey] = useState("");
  const [savingPix, setSavingPix] = useState(false);

  // Load school data (for PIX key)
  useEffect(() => {
    if (!schoolId) return;
    getDoc(doc(db, "schools", schoolId)).then((snap) => {
      if (snap.exists()) setPixKey(snap.data().pixKey ?? "");
    });
  }, [schoolId]);

  async function handleSavePix() {
    if (!schoolId) return;
    setSavingPix(true);
    try {
      await updateDoc(doc(db, "schools", schoolId), { pixKey: pixKey.trim(), updatedAt: serverTimestamp() });
      toast.success("Chave PIX salva!");
    } catch {
      toast.error("Erro ao salvar chave PIX.");
    } finally {
      setSavingPix(false);
    }
  }

  // Load team members
  useEffect(() => {
    if (!schoolId) return;
    const q = query(collection(db, "users"), where("schoolId", "==", schoolId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember));
      setMembers(data);
      setLoadingMembers(false);
    }, () => setLoadingMembers(false));
    return unsub;
  }, [schoolId]);

  function resetInvite() {
    setName("");
    setEmail("");
    setPassword("");
    setInviteError("");
    setInviteDone(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setInviteError("Digite o nome do professor."); return; }
    if (!email.trim()) { setInviteError("Digite o email."); return; }
    if (password.length < 6) { setInviteError("A senha deve ter pelo menos 6 caracteres."); return; }

    setSaving(true);
    setInviteError("");

    // Use a secondary Firebase app so we don't log out the current admin.
    // createUserWithEmailAndPassword automatically signs in the new user on
    // the primary auth instance — that would kick the admin out.
    const secondaryApp = initializeApp(auth.app.options, `secondary-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
      await setDoc(doc(db, "users", cred.user.uid), {
        schoolId,
        email: email.trim(),
        name: name.trim(),
        role: "coach",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setInviteDone(true);
      toast.success(`${name.trim()} adicionado com sucesso!`);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code === "auth/email-already-in-use") {
        setInviteError("Este email já está em uso.");
      } else if (code === "auth/invalid-email") {
        setInviteError("Email inválido.");
      } else {
        setInviteError("Erro ao adicionar professor. Tente novamente.");
      }
    } finally {
      setSaving(false);
      // Always clean up the secondary app to avoid memory leaks
      await deleteApp(secondaryApp).catch(() => {});
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", deleteTarget.id));
      toast.success(`${deleteTarget.name} removido da escola.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao remover professor.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Configurações
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie sua escola e equipe</p>
      </div>

      {/* School info */}
      <section className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Informações da Escola</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nome da escola</p>
            <p className="text-sm font-medium text-foreground">{schoolName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sua conta</p>
            <p className="text-sm font-medium text-foreground">{user?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
          </div>
        </div>
      </section>

      {/* PIX Key */}
      {isAdmin && (
        <section className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Chave PIX</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Essa chave aparece automaticamente nas mensagens de cobrança enviadas pelo WhatsApp.
          </p>
          <div className="flex gap-2">
            <Input
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, CNPJ, email, celular ou chave aleatória"
              className="flex-1"
            />
            <Button onClick={handleSavePix} disabled={savingPix} className="shrink-0">
              {savingPix ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </section>
      )}

      {/* Team */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Equipe
          </h3>
          {isAdmin && (
            <Button size="sm" className="gap-2" onClick={() => { resetInvite(); setShowInvite(true); }}>
              <UserPlus className="w-4 h-4" />
              Adicionar Professor
            </Button>
          )}
        </div>

        {loadingMembers ? (
          <div className="flex items-center gap-2 py-6">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            {members.map((m, i) => (
              <div key={m.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border/30" : ""}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <Badge variant="outline" className={m.role === "admin" ? "text-xs bg-primary/10 text-primary border-primary/20" : "text-xs"}>
                      {m.role === "admin" ? "Admin" : "Professor"}
                    </Badge>
                    {m.id === user?.id && <span className="text-xs text-muted-foreground">(você)</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>
                </div>
                {isAdmin && m.id !== user?.id && (
                  <button
                    onClick={() => setDeleteTarget(m)}
                    className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-destructive/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!isAdmin && (
          <p className="text-xs text-muted-foreground">Somente administradores podem gerenciar a equipe.</p>
        )}
      </section>

      {/* Invite dialog */}
      <Dialog open={showInvite} onOpenChange={(open) => { if (!open) setShowInvite(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Professor</DialogTitle>
            <DialogDescription>Crie uma conta para um professor da sua escola.</DialogDescription>
          </DialogHeader>
          {inviteDone ? (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  Professor adicionado! Passe o email e senha para ele acessar o sistema.
                </p>
              </div>
              <Button className="w-full" onClick={() => { resetInvite(); setShowInvite(false); }}>Fechar</Button>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coachName">Nome</Label>
                <Input id="coachName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do professor" disabled={saving} autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coachEmail">Email</Label>
                <Input id="coachEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="professor@email.com" disabled={saving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coachPassword">Senha provisória</Label>
                <Input id="coachPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" disabled={saving} />
                <p className="text-xs text-muted-foreground">O professor pode trocar a senha depois.</p>
              </div>
              {inviteError && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{inviteError}</p>
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</> : "Adicionar Professor"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remover Professor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{deleteTarget?.name}</strong> da escola? Ele não conseguirá mais acessar o sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo...</> : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
