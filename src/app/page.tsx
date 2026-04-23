"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, CreditCard, CalendarCheck, FileBarChart,
  CalendarDays, Receipt, CheckCircle2, ArrowRight, Loader2,
  Star, Clock, AlertTriangle, ChevronDown, ChevronUp, X,
  MessageCircle, TrendingDown, Smartphone,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AnimatedBackground } from "@/components/landing/animated-bg";

// ── Phone Mockup ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  const payments = [
    { name: "João Silva",    amount: "R$120", status: "atrasado", days: "12 dias" },
    { name: "Pedro Mendes", amount: "R$120", status: "atrasado", days: "5 dias"  },
    { name: "Lucas Costa",  amount: "R$150", status: "atrasado", days: "3 dias"  },
    { name: "Ana Beatriz",  amount: "R$120", status: "pago",     days: null      },
    { name: "Sofia Lima",   amount: "R$120", status: "pago",     days: null      },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-75" />
      <div
        className="relative w-[240px] sm:w-[260px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/60"
        style={{ border: "8px solid #111", background: "#f8fafc" }}
      >
        <div className="flex justify-center pt-2 pb-1 bg-white">
          <div className="w-16 h-4 bg-[#111] rounded-full" />
        </div>
        <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
              <Trophy className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs font-black text-slate-800">FutSimples</span>
          </div>
          <span className="text-[10px] text-slate-400">Cobranças</span>
        </div>
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[10px] font-semibold text-amber-700">3 em atraso · R$390 pendente</span>
        </div>
        <div className="bg-white divide-y divide-slate-50">
          {payments.map((p, i) => (
            <div key={i} className="px-3 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-800 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-400">Mensalidade</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-bold text-slate-700">{p.amount}</p>
                {p.status === "atrasado" ? (
                  <span className="text-[9px] font-bold text-rose-500">{p.days} atraso</span>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5 justify-end">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Pago
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white border-t border-slate-100 p-3">
          <div className="w-full rounded-xl bg-[#25D366] flex items-center justify-center gap-1.5 py-2.5">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-bold text-white">Cobrar 3 atrasados</span>
          </div>
        </div>
        <div className="bg-white flex justify-center py-1.5">
          <div className="w-20 h-1 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (firebaseUser) router.replace("/dashboard");
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.05 0.025 145)" }}>
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (firebaseUser) return null;

  const faqs = [
    {
      q: "Preciso de cartão de crédito para testar?",
      a: "Não. 7 dias grátis sem colocar nenhum dado de pagamento. Só pede cartão se você decidir continuar.",
    },
    {
      q: "Quanto tempo leva para configurar?",
      a: "10 minutos. Cria a conta, cadastra os alunos e já começa a usar. Sem treinamento, sem técnico.",
    },
    {
      q: "Funciona no celular?",
      a: "Foi feito para isso. Abre direto no navegador, não precisa instalar nada. Funciona na beira do campo.",
    },
    {
      q: "Quantos alunos posso cadastrar?",
      a: "Ilimitados. 15 ou 400 alunos — o preço é o mesmo.",
    },
    {
      q: "E se eu não gostar?",
      a: "Cancela nos 7 dias e não paga nada. Sem cobrança, sem multa, sem precisar explicar.",
    },
    {
      q: "Qual a diferença entre mensal e anual?",
      a: "No anual você paga R$599 por ano — R$49,92/mês — e economiza R$119,80. Mesmas funcionalidades.",
    },
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "oklch(0.05 0.025 145)" }}>
      <AnimatedBackground />

      <div className="relative" style={{ zIndex: 10 }}>

        {/* ── Navbar ── */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl border-b border-white/5" : ""}`}
          style={scrolled ? { background: "rgba(3,10,5,0.90)" } : undefined}
        >
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-md opacity-60" />
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-base font-black tracking-tight">FutSimples</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5">
                Entrar
              </Link>
              <Link href="/setup" className="relative group">
                <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-50 group-hover:opacity-80 transition-opacity" />
                <span className="relative inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-white transition-colors">
                  Testar grátis
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            1. HERO
            Objetivo: prender atenção em 3 segundos. Headline na dor,
            subheadline na solução, CTA único e direto.
        ══════════════════════════════════════════════════════════════════ */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Texto */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
                  ⚽ Para donos de escolinha de futebol no Brasil
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight leading-[1.05] mb-6">
                  <span className="text-white">Dono de escolinha não deveria</span>
                  <span className="block mt-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    perder horas cobrando mensalidade.
                  </span>
                </h1>

                <p className="text-lg text-white/55 mb-3 leading-relaxed max-w-lg">
                  FutSimples organiza alunos, cobra inadimplentes com PIX e registra presença — tudo no celular, em 10 minutos.
                </p>

                <p className="text-sm text-emerald-400 font-semibold mb-10">
                  Sem cartão de crédito · 7 dias grátis · Cancela quando quiser
                </p>

                <Link href="/setup" className="relative group inline-block">
                  <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
                    Testar grátis por 7 dias
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
                <p className="text-xs text-white/25 mt-3">Não precisa de cartão. Cancela sem explicação.</p>

                {/* Trust bar */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8">
                  {[
                    { icon: "💳", label: "Cartão ou Boleto" },
                    { icon: "💬", label: "Cobrança via WhatsApp + PIX" },
                    { icon: "📱", label: "100% pelo celular" },
                    { icon: "🔒", label: "Dados seguros" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs text-white/35">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone mockup */}
              <div className="flex items-center justify-center lg:justify-end">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            2. DOR — "Você faz isso todo mês"
            Objetivo: o visitante se identifica e sente que o problema é real.
            Uma dor por linha. Curto. Sem enrolação.
        ══════════════════════════════════════════════════════════════════ */}
        <section className="max-w-2xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Você ainda faz isso todo mês?
            </h2>
            <p className="text-white/35 text-sm mb-8">Marque o que é verdade para você.</p>

            <div className="space-y-5">
              {[
                { pain: "Cobrar mensalidade um por um no WhatsApp",          cost: "4 horas perdidas por mês" },
                { pain: "Não saber quem está em atraso agora, nesse momento",cost: "Dinheiro sumindo sem você ver" },
                { pain: "Presença em papel, no celular pessoal ou na memória",cost: "Zero histórico, zero controle" },
                { pain: "Fechar o mês no Excel e os números não fecham",      cost: "Decisão no chute" },
                { pain: "Pai pergunta a frequência do filho e você não sabe", cost: "Credibilidade jogada fora" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded border-2 border-amber-500/60 bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 font-medium">{item.pain}</p>
                    <p className="text-xs text-amber-400/70 mt-0.5">{item.cost}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/8 pt-6">
              <p className="text-sm text-white/50 leading-relaxed">
                Não é falta de esforço. É tentar gerir uma empresa com ferramentas de uso pessoal.{" "}
                <span className="text-white/80 font-semibold">Planilha e WhatsApp não foram feitos para isso.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            3. CUSTO DA INAÇÃO — números concretos
            Objetivo: tornar o custo do problema tangível e urgente.
        ══════════════════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: TrendingDown,
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
                stat: "Até R$900/mês",
                body: "Em inadimplência não controlada. Em uma escola com R$3.000/mês, de 15% a 30% some sem você perceber.",
              },
              {
                icon: Clock,
                color: "text-rose-400",
                bg: "bg-rose-500/10 border-rose-500/20",
                stat: "4 horas por mês",
                body: "Só em cobranças manuais. Tempo que poderia estar no campo — ou simplesmente descansando.",
              },
              {
                icon: FileBarChart,
                color: "text-violet-400",
                bg: "bg-violet-500/10 border-violet-500/20",
                stat: "0 relatórios reais",
                body: "Sem número claro, você decide no feeling. Quando percebe o prejuízo, já perdeu meses.",
              },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl border ${p.bg} p-6`}>
                <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center mb-4">
                  <p.icon className={`w-4 h-4 ${p.color}`} />
                </div>
                <p className={`text-xl font-black mb-2 ${p.color}`}>{p.stat}</p>
                <p className="text-sm text-white/50 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            4. SOLUÇÃO — antes × depois
            Objetivo: mostrar claramente o que muda com FutSimples.
            Contraste visual direto: "hoje" vs "com FutSimples".
        ══════════════════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Isso muda em 10 minutos.
            </h2>
            <p className="text-white/35 text-base max-w-md mx-auto">
              Cada funcionalidade existe para eliminar algo que consome seu tempo e dinheiro hoje.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: CreditCard, color: "from-emerald-500 to-green-400",
                label: "Cobrança em lote",
                before: "Você cobra atrasado um por um no WhatsApp. Todo mês. Do zero.",
                after:  "Todos os atrasados em uma tela. Dispara cobrança com link PIX para todos em 2 cliques.",
              },
              {
                icon: Users, color: "from-blue-500 to-cyan-400",
                label: "Gestão de alunos",
                before: "Alunos no caderno, no celular pessoal e na cabeça. Espalhados.",
                after:  "Cadastro completo: nome, turma, responsável, ficha médica. Tudo num lugar.",
              },
              {
                icon: CalendarCheck, color: "from-violet-500 to-purple-400",
                label: "Presença digital",
                before: "Presença no papel. Pai liga perguntando se o filho foi ao treino.",
                after:  "Presença digital. Pai acompanha pelo portal do responsável — sem ligar pra você.",
              },
              {
                icon: Receipt, color: "from-rose-500 to-pink-400",
                label: "Financeiro real",
                before: "No fim do mês você tenta fechar as contas e os números não batem.",
                after:  "Receitas e despesas no sistema. Resultado do mês em um clique, exportável em PDF.",
              },
            ].map((f) => (
              <div key={f.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 sm:p-6">
                <div className="flex gap-4 items-start">
                  <div className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                    <f.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">{f.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-rose-500/5 border border-rose-500/15 p-3">
                        <p className="text-xs font-bold text-rose-400 mb-1.5">Hoje</p>
                        <p className="text-sm text-white/50 leading-relaxed">{f.before}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                        <p className="text-xs font-bold text-emerald-400 mb-1.5">Com FutSimples</p>
                        <p className="text-sm text-white/80 leading-relaxed">{f.after}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            5. COMO FUNCIONA — 3 passos
            Objetivo: eliminar a objeção "parece complicado".
            Três passos. Simples. Sem jargão.
        ══════════════════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Começa agora. Funciona hoje.</h2>
            <p className="text-white/35">Sem implantação. Sem técnico. Sem treinamento obrigatório.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Cria sua conta",
                desc: "2 minutos. Só email e senha. Nenhum dado de pagamento pedido agora.",
              },
              {
                step: "02",
                title: "Cadastra os alunos",
                desc: "Nome, turma, responsável. Vai completando os detalhes no seu ritmo.",
              },
              {
                step: "03",
                title: "Usa na beira do campo",
                desc: "Presença, cobrança, financeiro. No celular, onde você estiver.",
              },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/5 bg-white/[0.03] p-7">
                <div className="text-5xl font-black text-emerald-500/15 mb-4 leading-none">{s.step}</div>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/setup" className="relative group inline-block">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <span className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-emerald-500/20">
                Começar agora — é grátis
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            6. PARA QUEM É — qualificação
            Objetivo: o visitante certo se identifica e o errado sai.
            Filtra lead ruim e reforça identidade do certo.
        ══════════════════════════════════════════════════════════════════ */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">
            Para quem é o FutSimples
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-7">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-5">É pra você se...</p>
              <ul className="space-y-3.5">
                {[
                  "Tem escolinha com 10 ou mais alunos",
                  "Cobra mensalidade todo mês",
                  "Quer saber quem está em atraso sem calcular",
                  "Quer parar de usar planilha e WhatsApp para tudo",
                  "Quer registrar presença de forma rápida",
                  "Quer um relatório real no fim do mês",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/75">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-7">
              <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-5">Não é pra você se...</p>
              <ul className="space-y-3.5">
                {[
                  "Você quer um sistema de ERP empresarial",
                  "Você não cobra mensalidade dos alunos",
                  "Você prefere planilha e está satisfeito",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/30">
                    <X className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-white/8">
                <p className="text-xs text-white/25 leading-relaxed">
                  FutSimples foi feito para ser simples. Não resolvemos tudo — resolvemos o que mais dói para dono de escolinha.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            7. PREÇO — clareza total
            Objetivo: eliminar a objeção de custo mostrando que custa
            menos do que a inadimplência que resolve.
        ══════════════════════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-4 py-20" id="planos">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Quanto custa?</h2>
            <p className="text-white/40 text-base">
              Menos do que você perde em um único mês de inadimplência não controlada.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setPlan("monthly")}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${plan === "monthly" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setPlan("annual")}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${plan === "annual" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
              >
                Anual
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${plan === "annual" ? "bg-emerald-500 text-white" : "bg-emerald-500/20 text-emerald-400"}`}>
                  -17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Mensal */}
            <div className={`rounded-2xl border p-7 transition-all ${plan === "monthly" ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/[0.03]"}`}>
              <p className="text-sm font-semibold text-white/50 mb-2">Plano Mensal</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-white">R$59</span>
                <span className="text-xl font-bold text-white">,90</span>
                <span className="text-sm text-white/40 mb-1">/mês</span>
              </div>
              <p className="text-xs text-white/30 mb-7">Cobrado mensalmente. Cancela quando quiser.</p>
              <ul className="space-y-2.5 mb-7">
                {["Alunos ilimitados","Cobrança em lote com PIX","Portal do responsável","Presença digital","Agenda de treinos","Relatório financeiro PDF","Convite de professores"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/65">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <Link href="/setup" className="block w-full text-center rounded-xl border border-emerald-500/40 text-emerald-400 font-semibold py-3 text-sm hover:bg-emerald-500/10 transition-all">
                Testar 7 dias grátis
              </Link>
            </div>

            {/* Anual */}
            <div className={`rounded-2xl border p-7 transition-all relative ${plan === "annual" ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/[0.03]"}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 px-3 py-1 text-xs font-bold text-white shadow">
                  <Star className="w-3 h-3" /> Melhor valor
                </span>
              </div>
              <p className="text-sm font-semibold text-white/50 mb-2">Plano Anual</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-white">R$599</span>
                <span className="text-sm text-white/40 mb-1">/ano</span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold mb-7">
                R$49,92/mês · Economize R$119,80
              </p>
              <ul className="space-y-2.5 mb-7">
                {["Alunos ilimitados","Cobrança em lote com PIX","Portal do responsável","Presença digital","Agenda de treinos","Relatório financeiro PDF","Convite de professores"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/65">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <Link href="/setup" className="relative group block">
                <div className="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 py-3 text-sm font-bold text-white">
                  Testar 7 dias grátis <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-white/25 mt-6">
            Pagamento via Stripe · Cartão de crédito ou Boleto · Cancele quando quiser
          </p>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            8. FAQ
            Objetivo: matar as últimas objeções antes da conversão.
            Respostas curtas. Diretas. Sem rodeio.
        ══════════════════════════════════════════════════════════════════ */}
        <section className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Dúvidas frequentes</h2>
            <p className="text-white/35 text-sm">A resposta provavelmente está aqui.</p>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            9. CTA FINAL
            Objetivo: conversão. Uma só mensagem. Um só botão.
            Urgência real. Risco zero para o visitante.
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-28 px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight tracking-tight">
              Cada mês que passa é mais dinheiro parado na inadimplência.
            </h2>
            <p className="text-white/40 text-lg mb-2">
              7 dias grátis. Sem cartão. Se não resolver, não paga nada.
            </p>
            <p className="text-emerald-400 font-semibold text-sm mb-12">
              Configuração completa em menos de 10 minutos.
            </p>
            <Link href="/setup" className="relative group inline-block">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
                Começar agora — é grátis
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              {["Sem cartão de crédito", "7 dias grátis", "Cancela sem explicação"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-white/25">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/5 py-10">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600">
                <Trophy className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-black text-white">FutSimples</span>
              <span className="text-sm text-white/25">· Gestão para escolinhas de futebol</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
            </div>
          </div>
          <p className="text-center text-xs text-white/15 mt-6">
            © {new Date().getFullYear()} FutSimples. Sistema de gestão para escolinhas de futebol no Brasil.
          </p>
        </footer>

      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "FutSimples",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Sistema de gestão para escolinhas de futebol. Controle alunos, pagamentos, inadimplência, presença e relatórios financeiros.",
            "offers": [
              { "@type": "Offer", "price": "59.90", "priceCurrency": "BRL", "description": "Plano Mensal — 7 dias grátis" },
              { "@type": "Offer", "price": "599.00", "priceCurrency": "BRL", "description": "Plano Anual — 7 dias grátis" },
            ],
            "url": "https://futsimples.netlify.app",
            "inLanguage": "pt-BR",
          })
        }}
      />
      <style>{`html { scroll-behavior: smooth; }`}</style>
    </div>
  );
}
