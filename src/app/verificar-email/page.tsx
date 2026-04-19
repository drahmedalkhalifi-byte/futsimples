"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Trophy, Mail, Loader2, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function VerificarEmailPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  async function handleCheck() {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
      return;
    }
    setChecking(true);
    setError("");
    try {
      await user.reload();
      if (user.emailVerified) {
        router.replace("/dashboard");
      } else {
        setError("E-mail ainda não confirmado. Verifique sua caixa de entrada e tente novamente.");
      }
    } catch {
      setError("Erro ao verificar. Tente novamente.");
    } finally {
      setChecking(false);
    }
  }

  async function handleCancel() {
    const user = auth.currentUser;
    if (user) {
      try { await user.delete(); } catch { /* ignore — user can sign out instead */ }
    }
    await auth.signOut();
    router.replace("/");
  }

  async function handleResend() {
    const user = auth.currentUser;
    if (!user) return;
    setResending(true);
    setError("");
    try {
      await sendEmailVerification(user);
      setResent(true);
    } catch {
      setError("Não foi possível reenviar. Aguarde alguns minutos e tente novamente.");
    } finally {
      setResending(false);
    }
  }

  // Auto-poll every 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);
          router.replace("/dashboard");
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">FutSimples</h1>
        </div>

        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-5 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto">
              <Mail className="w-7 h-7 text-primary" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">Confirme seu e-mail</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enviamos um link de ativação para o seu e-mail. Clique no link e depois volte aqui.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-left">
                {error}
              </div>
            )}

            {resent && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 text-left flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                E-mail reenviado com sucesso!
              </div>
            )}

            <Button className="w-full" onClick={handleCheck} disabled={checking}>
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Já confirmei meu e-mail →"
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground gap-2"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Reenviar e-mail de confirmação
            </Button>

            <p className="text-xs text-muted-foreground">
              Verificando automaticamente a cada 5 segundos...
            </p>

            <div className="border-t border-border/50 pt-4">
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Cancelar e voltar para o início
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
