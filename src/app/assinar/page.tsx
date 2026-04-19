"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Trophy, Check, Loader2, AlertCircle, Users, CalendarDays,
  DollarSign, ClipboardList, ShieldCheck, ArrowLeft, Star,
  Copy, CheckCircle2, CreditCard, QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const FEATURES = [
  { icon: Users,         text: "Cadastro ilimitado de alunos" },
  { icon: DollarSign,   text: "Controle financeiro completo (receitas e despesas)" },
  { icon: CalendarDays, text: "Agenda de treinos, jogos e campeonatos" },
  { icon: ClipboardList,text: "Controle de presença por categoria" },
  { icon: ShieldCheck,  text: "Portal do responsável com ficha médica" },
  { icon: Trophy,       text: "Gestão de campeonatos e categorias" },
];

type Plan          = "monthly" | "annual";
type PaymentMethod = "stripe" | "pix";
type PixState      = "idle" | "loading" | "waiting" | "approved" | "error";

function AssinarContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { schoolId, subscriptionStatus, schoolName, signOut, firebaseUser } = useAuth();

  const [plan,        setPlan]        = useState<Plan>("monthly");
  const [method,      setMethod]      = useState<PaymentMethod>("pix");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  // PIX state
  const [pixState,    setPixState]    = useState<PixState>("idle");
  const [qrCodeImg,   setQrCodeImg]   = useState<string | null>(null);
  const [qrCode,      setQrCode]      = useState<string | null>(null);
  const [pixPaymentId,setPixPaymentId]= useState<string | null>(null);
  const [copied,      setCopied]      = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canceled    = searchParams.get("canceled") === "true";
  const alreadyActive = subscriptionStatus === "active";

  // Polling — verifica status do PIX a cada 5s
  useEffect(() => {
    if (pixState !== "waiting" || !pixPaymentId) return;

    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/mp/status?paymentId=${pixPaymentId}`);
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(pollRef.current!);
          setPixState("approved");
          setTimeout(() => router.replace("/dashboard"), 2500);
        }
      } catch { /* ignora erro de rede, tenta novamente */ }
    }, 5000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pixState, pixPaymentId, router]);

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

  const isAnnual     = plan === "annual";
  const monthlyEquiv = isAnnual ? "49,92" : "59,90";
  const totalAmount  = isAnnual ? "R$599/ano" : "R$59,90/mês";
  const savings      = isAnnual ? "Economize R$119,80/ano" : null;

  // ── Stripe checkout ──
  async function handleStripeCheckout() {
    if (!schoolId) { setError("Sessão inválida. Faça login novamente."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, plan }),
      });
      const text = await res.text();
      let data: { url?: string; error?: string } = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* vazio */ }
      if (!res.ok || !data.url) throw new Error(data.error ?? `Erro ${res.status}`);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar pagamento.");
      setLoading(false);
    }
  }

  // ── Gerar QR Code PIX ──
  async function handleGeneratePix() {
    if (!schoolId) { setError("Sessão inválida. Faça login novamente."); return; }
    setPixState("loading");
    setError("");
    try {
      const res  = await fetch("/api/mp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          plan,
          userEmail: firebaseUser?.email ?? "pagador@futsimples.com.br",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar PIX");
      setQrCodeImg(data.qrCodeBase64);
      setQrCode(data.qrCode);
      setPixPaymentId(data.paymentId);
      setPixState("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar PIX.");
      setPixState("error");
    }
  }

  function handleCopy() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

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

        {/* Avisos */}
        {subscriptionStatus === "expired" && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Os 7 dias de teste gratuito da escola <strong>{schoolName}</strong> expiraram. Assine para continuar usando.
            </p>
          </div>
        )}
        {canceled && (
          <div className="flex items-start gap-3 rounded-xl bg-muted/60 border border-border p-4">
            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">Pagamento cancelado. Você pode tentar novamente quando quiser.</p>
          </div>
        )}

        {/* Toggle plano */}
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => { setPlan("monthly"); setPixState("idle"); setQrCodeImg(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${plan === "monthly" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
          >Mensal</button>
          <button
            onClick={() => { setPlan("annual"); setPixState("idle"); setQrCodeImg(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative ${plan === "annual" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
          >
            Anual
            <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${plan === "annual" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"}`}>-17%</span>
          </button>
        </div>

        {/* Card do plano */}
        <div className="rounded-2xl border-2 border-primary bg-card shadow-lg shadow-primary/10 overflow-hidden">

          {/* Header do plano */}
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

          {/* Forma de pagamento */}
          <div className="px-6 pb-6 space-y-4">

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Forma de pagamento</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMethod("pix"); setPixState("idle"); setQrCodeImg(null); }}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${method === "pix" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                <QrCode className="w-5 h-5" />
                PIX
              </button>
              <button
                onClick={() => { setMethod("stripe"); setPixState("idle"); }}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${method === "stripe" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                <CreditCard className="w-5 h-5" />
                Cartão / Boleto
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* ── PIX flow ── */}
            {method === "pix" && (
              <div className="space-y-3">
                {pixState === "idle" && (
                  <>
                    <Button className="w-full h-12 text-base font-bold bg-[#32BCAD] hover:bg-[#2aa99b] text-white shadow-md" onClick={handleGeneratePix}>
                      <QrCode className="w-5 h-5 mr-2" />
                      Gerar QR Code PIX
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Via Mercado Pago · Aprovação instantânea
                    </p>
                  </>
                )}

                {pixState === "loading" && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
                  </div>
                )}

                {pixState === "waiting" && qrCodeImg && (
                  <div className="space-y-3">
                    <div className="flex flex-col items-center gap-2">
                      {/* QR Code */}
                      <div className="rounded-xl border-2 border-[#32BCAD] p-3 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:image/png;base64,${qrCodeImg}`}
                          alt="QR Code PIX"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Abra o app do seu banco e escaneie o QR Code</p>
                    </div>

                    {/* Copia e cola */}
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#32BCAD] text-[#32BCAD] py-2.5 text-sm font-semibold hover:bg-[#32BCAD]/5 transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copiado!" : "Copiar código PIX"}
                    </button>

                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 p-3">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-700">Aguardando pagamento... Assim que pagar, o acesso é liberado automaticamente.</p>
                    </div>

                    <button
                      onClick={() => { setPixState("idle"); setQrCodeImg(null); setQrCode(null); }}
                      className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      Gerar novo QR Code
                    </button>
                  </div>
                )}

                {pixState === "approved" && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="text-base font-bold text-green-700">PIX confirmado! 🎉</p>
                    <p className="text-sm text-muted-foreground text-center">Liberando seu acesso... Você será redirecionado em instantes.</p>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
            )}

            {/* ── Stripe flow ── */}
            {method === "stripe" && (
              <div className="space-y-2">
                <Button
                  className="w-full h-12 text-base font-bold shadow-md shadow-primary/30"
                  onClick={handleStripeCheckout}
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
            )}
          </div>
        </div>

        {/* Voltar / sair */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          {subscriptionStatus !== "expired" && (
            <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
          )}
          <button onClick={async () => { await signOut(); router.push("/login"); }} className="hover:text-foreground transition-colors">
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
