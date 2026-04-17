"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
      return "Nenhuma conta encontrada com este email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Senha incorreta. Tente novamente.";
    case "auth/invalid-email":
      return "O formato do email é inválido.";
    case "auth/user-disabled":
      return "Esta conta foi desativada. Fale com o administrador.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";
    default:
      return "Erro ao entrar. Tente novamente.";
  }
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

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
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        setResetError("Email não encontrado. Verifique e tente novamente.");
      } else {
        setResetError("Erro ao enviar. Tente novamente.");
      }
    } finally {
      setResetLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Digite seu email.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await signIn(trimmedEmail, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      setError(getFirebaseErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
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

        {/* Login Form */}
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="p-6">
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
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => { setShowReset(true); setResetEmail(email); }}
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
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Entrando...</> : "Entrar"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Redefinir senha</h3>
                  <p className="text-xs text-muted-foreground mt-1">Enviaremos um link para o seu email.</p>
                </div>
                {resetSent ? (
                  <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">Email enviado! Verifique sua caixa de entrada.</p>
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
                    />
                    {resetError && (
                      <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{resetError}</p>
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={resetLoading}>
                      {resetLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : "Enviar link"}
                    </Button>
                  </form>
                )}
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setResetSent(false); setResetError(""); }}
                  className="text-xs text-primary hover:underline w-full text-center"
                >
                  Voltar para o login
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
