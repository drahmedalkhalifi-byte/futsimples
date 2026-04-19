"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Trophy, Check, Loader2, AlertCircle, Users, CalendarDays,
  DollarSign, ClipboardList, ShieldCheck, ArrowLeft, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const FEATURES = [
  { icon: Users,          text: "Cadastro ilimitado de alunos" },
  { icon: DollarSign,     text: "Controle financeiro completo (receitas e despesas)" },
  { icon: CalendarDays,   text: "Agenda de treinos, jogos e campeonatos" },
  { icon: ClipboardList,  text: "Controle de presença por categoria" },
  { icon: ShieldCheck,    text: "Portal do responsável com ficha médica" },
  { icon: Trophy,         text: "Gestão de campeonatos e categorias" },
];

type Plan = "monthly" | "annual";

function AssinarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { schoolId, subscriptionStatus, schoolName, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<Plan>("monthly");

  const canceled = searchParams.get("canceled") === "true";
  const alreadyActive = subscriptionStatus === "active";

  async function handleCheckout() {
    if (!schoolId) {
      setError("Sessão inválida. Faça login novamente.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erro desconhecido");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar pagamento.");
      setLoading(false);
    }
  }

  if (alreadyActive) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Assinatura ativa!</h2>
          <p className="text-sm text-muted-foreground">Sua escola <strong>{schoolName}</strong> já possui uma assinatura ativa.</p>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>Ir para o Dashboard</Button>
        </div>
      </div>
    );
  }

  const isAnnual = plan === "annual";
  const monthlyEquiv = isAnnual ? "49,92" : "59,90";
  const totalAmount = isAnnual ? "R$599/ano" : "R$59,90/mês";
  const savings = isAnnual ? "Economize R$119,80/ano" : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30 mx-auto">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {subscriptionStatus === "expired" ? "Seu teste gratuito encerrou" : "Assine o FutSimples"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {subscriptionStatus === "expired"
                ? "Continue gerenciando sua escola sem interrupções."
                : "Desbloqueie o sistema completo para sua escola."}
            </p>
          </div>
        </div>

        {/* Trial expired notice */}
        {subscriptionStatus === "expired" && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Os 14 dias de teste gratuito da escola <strong>{schoolName}</strong> expiraram. Assine para continuar usando.
            </p>
          </div>
        )}

        {/* Canceled notice */}
        {canceled && (
          <div className="flex items-start gap-3 rounded-xl bg-muted/60 border border-border p-4">
            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">Pagamento cancelado. Você pode tentar novamente quando quiser.</p>
          </div>
        )}

        {/* Plan toggle */}
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setPlan("monthly")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              plan === "monthly"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPlan("annual")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative ${
              plan === "annual"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            Anual
            <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
              plan === "annual" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
            }`}>
              -17%
            </span>
          </button>
        </div>

        {/* Plan card */}
        <div className="rounded-2xl border-2 border-primary bg-card shadow-lg shadow-primary/10 overflow-hidden">
          {/* Plan header */}
          <div className="bg-primary px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">
                {isAnnual ? "Plano Anual" : "Plano Mensal"}
              </p>
              {isAnnual && (
                <span className="flex items-center gap-1 text-xs font-bold bg-white/20 rounded-full px-2.5 py-1">
                  <Star className="w-3 h-3" /> Melhor valor
                </span>
              )}
            </div>
            {isAnnual ? (
              <div className="mt-1">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold">R$599</span>
                  <span className="text-sm opacity-70 mb-1">/ano</span>
                </div>
                <p className="text-xs opacity-80 mt-0.5">equivale a R${monthlyEquiv}/mês · 2 meses grátis</p>
              </div>
            ) : (
              <div className="flex items-end gap-1 mt-1">
                <span className="text-4xl font-extrabold">R$59</span>
                <span className="text-2xl font-bold">,90</span>
                <span className="text-sm opacity-70 mb-1">/mês</span>
              </div>
            )}
            <p className="text-xs opacity-70 mt-1">Cancele quando quiser · Sem fidelidade</p>
          </div>

          {/* Annual savings banner */}
          {savings && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-sm font-semibold text-emerald-700">{savings} em relação ao plano mensal</p>
            </div>
          )}

          {/* Features */}
          <div className="px-6 py-5 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <Button
              className="w-full h-12 text-base font-bold shadow-md shadow-primary/30"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Redirecionando...</>
                : `Assinar por ${totalAmount}`
              }
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Pagamento seguro via Stripe · Cartão de crédito ou Boleto
            </p>
          </div>
        </div>

        {/* Back / logout */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          {subscriptionStatus !== "expired" && (
            <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </button>
          )}
          <button
            onClick={async () => { await signOut(); router.push("/login"); }}
            className="hover:text-foreground transition-colors"
          >
            Sair da conta
          </button>
        </div>

      </div>
    </div>
  );
}

export default function AssinarPage() {
  return (
    <Suspense fallback={null}>
      <AssinarContent />
    </Suspense>
  );
}
