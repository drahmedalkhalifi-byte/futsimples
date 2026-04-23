"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      // Intentionally vague — don't reveal whether email exists
      return "Email ou senha incorretos. Verifique e tente novamente.";
    case "auth/invalid-email":
      return "O formato do email é inválido.";
    case "auth/user-disabled":
      return "Esta conta foi desativada. Entre em contato com o suporte.";
    case "auth/too-many-requests":
      return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
    case "auth/network-request-failed":
      return "Sem conexão. Verifique sua internet e tente novamente.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}

export default function LoginPage() {
  const { signIn, loading: authLoading, isReady, firebaseUser } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Reset-password panel
  const [showReset, setShowReset]     = useState(false);
  const [resetEmail, setResetEmail]   = useState("");
  const [resetSent, setResetSent]     = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError]   = useState("");

  // ── Redirect if already authenticated ──────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (isReady) {
      router.replace("/dashboard");
      return;
    }
    if (firebaseUser) {
      if (!firebaseUser.emailVerified) {
        // Auth user exists but email not verified → send to verification page
        router.replace("/verificar-email");
      } else {
        // Auth user exists, email verified, but no Firestore doc
        // (professor removed by admin, or orphaned account)
        // → send to setup so they see the message and can sign out
        router.replace("/setup");
      }
    }
  }, [authLoading, isReady, firebaseUser, router]);

  // ── Forgot password ─────────────────────────────────────────────────────────
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = resetEmail.trim();
    if (!trimmed) { setResetError("Digite seu email."); return; }

    setResetLoading(true);
    setResetError("");
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setResetSent(true);
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      // Don't reveal whether the email exists in the system
      if (code === "auth/invalid-email") {
        setResetError("O formato do email é inválido.");
      } else {
        // For user-not-found we show success anyway (security best practice)
        setResetSent(true);
      }
    } finally {
      setResetLoading(false);
    }
  }

  // ── Sign in ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError("Digite seu email."); return; }
    if (password.length < 1) { setError("Digite sua senha."); return; }

    setLoading(true);
    try {
      await signIn(trimmedEmail, password);
      // Keep loading=true — the useEffect above will handle the redirect
      // when isReady becomes true. This prevents the button from flickering.
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      setError(getFirebaseErrorMessage(code));
      setLoading(false); // only reset on error
    }
  }

  // ── Show spinner while auth context is resolving on first load ─────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">

        {/* Back to home */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              FutSimples
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entre na sua conta para continuar
            </p>
          </div>
        </div>

        {/* Card */}
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">

            {/* ── Login form ── */}
            {!showReset ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => { setShowReset(true); setResetEmail(email.trim()); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Entrando...</>
                    : "Entrar"
                  }
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Não tem conta?{" "}
                  <Link href="/setup" className="text-primary hover:underline font-medium">
                    Criar conta grátis
                  </Link>
                </p>
              </form>

            /* ── Reset password panel ── */
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Redefinir senha</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enviaremos um link de redefinição para o seu email.
                  </p>
                </div>

                {resetSent ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">
                        Se esse email estiver cadastrado, você receberá o link em breve.
                        Verifique sua caixa de entrada e a pasta de spam.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => { setShowReset(false); setResetSent(false); setResetError(""); }}
                    >
                      Voltar para o login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-3">
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => { setResetEmail(e.target.value); setResetError(""); }}
                      placeholder="seu@email.com"
                      autoFocus
                      disabled={resetLoading}
                      autoComplete="email"
                    />
                    {resetError && (
                      <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{resetError}</p>
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={resetLoading}>
                      {resetLoading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                        : "Enviar link de redefinição"
                      }
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setShowReset(false); setResetSent(false); setResetError(""); }}
                      className="text-xs text-primary hover:underline w-full text-center"
                    >
                      Voltar para o login
                    </button>
                  </form>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
