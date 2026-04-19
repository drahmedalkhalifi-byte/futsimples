"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Trophy, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  createUserWithEmailAndPassword,
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
  { name: "Lucas Mendes", age: 9, category: "sub9", guardian: "Maria Mendes", phone: "(11) 98765-4321", email: "maria@email.com" },
  { name: "Ana Carolina Silva", age: 6, category: "sub6", guardian: "Carlos Silva", phone: "(11) 91234-5678", email: "carlos@email.com" },
  { name: "Pedro Oliveira", age: 13, category: "sub13", guardian: "Fernanda Oliveira", phone: "(11) 99876-5432", email: "fernanda@email.com" },
  { name: "Sofia Santos", age: 5, category: "babyfoot", guardian: "Roberto Santos", phone: "(11) 97654-3210", email: "roberto@email.com" },
  { name: "Gabriel Costa", age: 11, category: "sub11", guardian: "Juliana Costa", phone: "(11) 96543-2109", email: "juliana@email.com" },
];

export default function SetupPage() {
  const router = useRouter();
  const { isReady, schoolId } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("Administrador");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

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

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();

    if (!adminEmail.trim() || !adminPassword || adminPassword.length < 6) {
      setErrorMsg("Preencha email e senha (mínimo 6 caracteres).");
      return;
    }

    if (schoolId) {
      setErrorMsg("Sua conta já está configurada. Faça login normalmente.");
      return;
    }

    setStep("running");
    setErrorMsg("");

    try {
      // 1. Create auth user FIRST — Firestore rules require request.auth != null
      //    for every write, so we must be authenticated before touching Firestore.
      addLog("Criando usuário admin...");
      const cred = await createUserWithEmailAndPassword(
        auth,
        adminEmail.trim(),
        adminPassword
      );
      updateLastLog("done");

      // 2. Create school (user is now authenticated)
      addLog("Criando escola...");
      const schoolRef = await addDoc(collection(db, "schools"), {
        name: schoolName.trim(),
        subscriptionStatus: "trial",
        trialStartedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      updateLastLog("done");

      // 3. Create user document
      addLog("Configurando permissões...");
      await setDoc(doc(db, "users", cred.user.uid), {
        schoolId: schoolRef.id,
        email: adminEmail.trim(),
        name: adminName.trim(),
        role: "admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      updateLastLog("done");

      // 4. Create sample students
      addLog("Cadastrando 5 alunos de exemplo...");
      for (const student of sampleStudents) {
        await addDoc(collection(db, "students"), {
          ...student,
          schoolId: schoolRef.id,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      updateLastLog("done");

      // 5. Send welcome email (fire-and-forget — don't block setup on email failure)
      fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: adminEmail.trim(),
          adminName: adminName.trim(),
          schoolName: schoolName.trim(),
        }),
      }).catch(() => { /* non-critical */ });

      setStep("done");
    } catch (err: unknown) {
      updateLastLog("error");
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      if (code === "auth/email-already-in-use") {
        setErrorMsg("Este email já está em uso. Escolha outro.");
      } else if (code === "auth/weak-password") {
        setErrorMsg("Senha muito fraca. Use pelo menos 6 caracteres.");
      } else {
        setErrorMsg(
          `Erro: ${code || (err instanceof Error ? err.message : "Desconhecido")}`
        );
      }
      setStep("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
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

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">
            {/* Form */}
            {step === "form" && (
              <form onSubmit={handleSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nome da Escola</Label>
                  <Input
                    id="schoolName"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Ex: FutSimples, Escolinha do Bairro..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminName">Seu Nome</Label>
                  <Input
                    id="adminName"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Nome do administrador"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setupEmail">Email de Acesso</Label>
                  <Input
                    id="setupEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@suaescola.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setupPassword">Senha</Label>
                  <Input
                    id="setupPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  </div>
                )}
                <Button type="submit" className="w-full">
                  Configurar Escola
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Isso criará 1 escola, 1 admin e 5 alunos de exemplo.
                </p>
              </form>
            )}

            {/* Progress */}
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
                      <span className="text-sm text-foreground">
                        {log.message}
                      </span>
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setStep("form");
                      setLogs([]);
                    }}
                  >
                    Tentar Novamente
                  </Button>
                )}
              </div>
            )}

            {/* Done */}
            {step === "done" && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Tudo pronto!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sua escola foi configurada com sucesso. Você já pode acessar o sistema.
                  </p>
                </div>
                <div className="space-y-3">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm text-foreground">
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                  disabled={!isReady}
                >
                  {!isReady ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparando...
                    </>
                  ) : (
                    "Ir para o Dashboard"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
