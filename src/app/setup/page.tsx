"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Trophy, Loader2, CheckCircle2, AlertCircle, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Step = "form" | "running" | "done" | "error";

interface LogEntry {
  message: string;
  status: "pending" | "done" | "error";
}

const sampleStudents = [
  { name: "Lucas Mendes",      age: 9,  category: "sub9",     guardian: "Maria Mendes",     phone: "(11) 98765-4321", email: "maria@email.com"    },
  { name: "Ana Carolina Silva",age: 6,  category: "sub6",     guardian: "Carlos Silva",     phone: "(11) 91234-5678", email: "carlos@email.com"   },
  { name: "Pedro Oliveira",    age: 13, category: "sub13",    guardian: "Fernanda Oliveira",phone: "(11) 99876-5432", email: "fernanda@email.com" },
  { name: "Sofia Santos",      age: 5,  category: "babyfoot", guardian: "Roberto Santos",   phone: "(11) 97654-3210", email: "roberto@email.com"  },
  { name: "Gabriel Costa",     age: 11, category: "sub11",    guardian: "Juliana Costa",    phone: "(11) 96543-2109", email: "juliana@email.com"  },
];

export default function SetupPage() {
  const router = useRouter();
  const { loading: authLoading, isReady, firebaseUser, schoolId } = useAuth();

  const [step, setStep]           = useState<Step>("form");
  const [logs, setLogs]           = useState<LogEntry[]>([]);
  const [errorMsg, setErrorMsg]   = useState("");
  const [emailInUse, setEmailInUse] = useState(false);

  const [schoolName,     setSchoolName]     = useState("");
  const [adminName,      setAdminName]      = useState("");
  const [adminEmail,     setAdminEmail]     = useState("");
  const [adminPassword,  setAdminPassword]  = useState("");

  // Orphaned state: Firebase Auth user exists but Firestore user/school doc does not.
  // Happens when setup crashes after step 1 (Auth creation) but before step 3 (user doc).
  const isOrphaned = !authLoading && !!firebaseUser && !schoolId;

  // ── Redirect if already fully configured ───────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (isReady) router.replace("/dashboard");
  }, [authLoading, isReady, router]);

  // ── Pre-fill email from existing auth user (orphaned recovery) ─────────────
  useEffect(() => {
    if (isOrphaned && firebaseUser?.email && !adminEmail) {
      setAdminEmail(firebaseUser.email);
    }
  }, [isOrphaned, firebaseUser, adminEmail]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function addLog(message: string, status: LogEntry["status"] = "pending") {
    setLogs((prev) => [...prev, { message, status }]);
  }

  function updateLastLog(status: LogEntry["status"]) {
    setLogs((prev) => {
      const copy = [...prev];
      if (copy.length > 0) copy[copy.length - 1].status = status;
      return copy;
    });
  }

  async function handleCancel() {
    try { await signOut(auth); } catch { /* ignore */ }
    router.replace("/");
  }

  // ── Setup flow ──────────────────────────────────────────────────────────────
  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setEmailInUse(false);
    setErrorMsg("");

    const trimmedSchool = schoolName.trim();
    const trimmedName   = adminName.trim();
    const trimmedEmail  = adminEmail.trim();

    // ── Validation ──
    if (trimmedSchool.length < 2) {
      setErrorMsg("O nome da escola deve ter pelo menos 2 caracteres.");
      return;
    }
    if (trimmedSchool.length > 80) {
      setErrorMsg("O nome da escola deve ter no máximo 80 caracteres.");
      return;
    }
    if (!trimmedName) {
      setErrorMsg("Digite o seu nome.");
      return;
    }
    if (!isOrphaned) {
      if (!trimmedEmail) { setErrorMsg("Digite o email."); return; }
      if (!adminPassword || adminPassword.length < 6) {
        setErrorMsg("A senha deve ter no mínimo 6 caracteres.");
        return;
      }
    }

    setStep("running");
    setLogs([]);

    try {
      let uid: string;
      let userEmail: string;

      if (isOrphaned && firebaseUser) {
        // Reuse the existing auth user — no need to re-create
        addLog("Conta de acesso verificada...");
        uid       = firebaseUser.uid;
        userEmail = firebaseUser.email ?? trimmedEmail;
        updateLastLog("done");
      } else {
        // Normal path: create Firebase Auth user first (rules need request.auth)
        addLog("Criando conta de acesso...");
        const cred = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          adminPassword
        );
        uid       = cred.user.uid;
        userEmail = trimmedEmail;
        updateLastLog("done");
      }

      // Create school document
      addLog("Criando escola...");
      const schoolRef = await addDoc(collection(db, "schools"), {
        name:               trimmedSchool,
        subscriptionStatus: "trial",
        trialStartedAt:     serverTimestamp(),
        createdAt:          serverTimestamp(),
        updatedAt:          serverTimestamp(),
      });
      updateLastLog("done");

      // Create user document (links auth uid → schoolId)
      addLog("Configurando permissões...");
      await setDoc(doc(db, "users", uid), {
        schoolId:  schoolRef.id,
        email:     userEmail,
        name:      trimmedName,
        role:      "admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      updateLastLog("done");

      // Seed sample students
      addLog("Cadastrando alunos de exemplo...");
      for (const student of sampleStudents) {
        await addDoc(collection(db, "students"), {
          ...student,
          schoolId:  schoolRef.id,
          active:    true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      updateLastLog("done");

      // Send email verification (non-critical — skip if already verified)
      try {
        const currentUser = auth.currentUser;
        if (currentUser && !currentUser.emailVerified) {
          await sendEmailVerification(currentUser);
        }
      } catch { /* non-critical — user can resend from verify page */ }

      setStep("done");
    } catch (err: unknown) {
      updateLastLog("error");
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";

      if (code === "auth/email-already-in-use") {
        setEmailInUse(true);
        setErrorMsg("Este email já possui uma conta. Faça login para continuar.");
      } else if (code === "auth/weak-password") {
        setErrorMsg("Senha muito fraca. Use pelo menos 6 caracteres.");
      } else if (code === "auth/invalid-email") {
        setErrorMsg("O formato do email é inválido.");
      } else {
        setErrorMsg(
          `Erro inesperado: ${code || (err instanceof Error ? err.message : "Tente novamente.")}`
        );
      }
      setStep("error");
    }
  }

  // ── Spinner while auth context is resolving ─────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-6">

        {/* Back to home */}
        {!isOrphaned && step === "form" && (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o início
          </Link>
        )}

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">
              FutSimples
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure sua escola em poucos segundos
            </p>
          </div>
        </div>

        {/* Orphaned-state warning banner */}
        {isOrphaned && step === "form" && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Conta sem escola vinculada</p>
              <p className="mt-1">
                <strong>Professor?</strong> Seu acesso foi removido ou a configuração ficou incompleta.
                Peça ao administrador da escola para refazer o seu convite e clique em &quot;Cancelar e sair&quot; abaixo.
              </p>
              <p className="mt-1">
                <strong>Administrador?</strong> Preencha os dados abaixo para concluir o cadastro da sua escola.
              </p>
            </div>
          </div>
        )}

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">

            {/* ── Form ── */}
            {step === "form" && (
              <form onSubmit={handleSetup} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nome da Escola</Label>
                  <Input
                    id="schoolName"
                    value={schoolName}
                    onChange={(e) => { setSchoolName(e.target.value); if (errorMsg) setErrorMsg(""); }}
                    placeholder="Ex: FutSimples Academy, Escolinha do Bairro..."
                    required
                    autoFocus
                    maxLength={80}
                    autoComplete="organization"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">Seu Nome</Label>
                  <Input
                    id="adminName"
                    value={adminName}
                    onChange={(e) => { setAdminName(e.target.value); if (errorMsg) setErrorMsg(""); }}
                    placeholder="Nome do administrador"
                    required
                    autoComplete="name"
                  />
                </div>

                {/* Email & password: hidden/read-only when recovering an orphaned account */}
                {isOrphaned ? (
                  <div className="space-y-1">
                    <Label>Email de Acesso</Label>
                    <Input
                      value={adminEmail}
                      disabled
                      className="bg-muted/50 text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Conta existente — não é necessário criar uma nova senha.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="setupEmail">Email de Acesso</Label>
                      <Input
                        id="setupEmail"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => { setAdminEmail(e.target.value); if (errorMsg) setErrorMsg(""); }}
                        placeholder="admin@suaescola.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="setupPassword">Senha</Label>
                      <Input
                        id="setupPassword"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => { setAdminPassword(e.target.value); if (errorMsg) setErrorMsg(""); }}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                    </div>
                  </>
                )}

                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Configurar Escola
                </Button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline w-full text-center"
                >
                  {isOrphaned ? "Cancelar e sair" : "Voltar para o início"}
                </button>

                {!isOrphaned && (
                  <p className="text-center text-sm text-muted-foreground">
                    Já tem conta?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                      Fazer login
                    </Link>
                  </p>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Isso criará 1 escola, 1 administrador e 5 alunos de exemplo.
                </p>
              </form>
            )}

            {/* ── Progress / Error ── */}
            {(step === "running" || step === "error") && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {log.status === "pending" && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                      )}
                      {log.status === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      )}
                      {log.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                      )}
                      <span className="text-sm text-foreground">{log.message}</span>
                    </div>
                  ))}
                </div>

                {step === "error" && errorMsg && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  </div>
                )}

                {step === "error" && (
                  <div className="space-y-2">
                    {emailInUse ? (
                      <Button className="w-full" asChild>
                        <Link href="/login">
                          <LogIn className="w-4 h-4 mr-2" />
                          Ir para o Login
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => { setStep("form"); setLogs([]); setErrorMsg(""); }}
                      >
                        Tentar Novamente
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline w-full text-center"
                    >
                      Cancelar e sair
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Done ── */}
            {step === "done" && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {auth.currentUser?.emailVerified
                      ? "Escola configurada com sucesso!"
                      : "Conta criada! Confirme seu e-mail"}
                  </h3>
                  {!auth.currentUser?.emailVerified && (
                    <>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enviamos um link de confirmação para{" "}
                        <strong>{adminEmail}</strong>. Clique no link e depois acesse o sistema.
                      </p>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 mt-3">
                        Verifique sua caixa de entrada e a pasta de spam.
                      </div>
                    </>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() =>
                    auth.currentUser?.emailVerified
                      ? router.replace("/dashboard")
                      : router.replace("/verificar-email")
                  }
                >
                  {auth.currentUser?.emailVerified
                    ? "Acessar o sistema →"
                    : "Já confirmei meu e-mail →"}
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">Início</Link>
          {" · "}
          <Link href="/privacidade" className="hover:underline">Privacidade</Link>
          {" · "}
          <Link href="/termos" className="hover:underline">Termos de Uso</Link>
        </p>

      </div>
    </div>
  );
}
