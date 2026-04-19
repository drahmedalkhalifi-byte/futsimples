"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, CreditCard, CalendarCheck, FileBarChart,
  CalendarDays, Receipt, CheckCircle2, ArrowRight, Loader2,
  Star, Clock, AlertTriangle, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AnimatedBackground } from "@/components/landing/animated-bg";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.05 0.020 265)" }}>
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (firebaseUser) return null;

  const faqs = [
    {
      q: "Preciso de cartão de crédito para testar?",
      a: "Não. Cria sua conta agora e usa tudo por 7 dias sem colocar nenhum dado de pagamento. Só pede cartão ou boleto se você decidir continuar.",
    },
    {
      q: "Quanto tempo leva para configurar?",
      a: "Em torno de 10 minutos. Cria a conta, cadastra seus alunos e já começa a usar. Não tem treinamento obrigatório, não tem implantação, não tem técnico para esperar.",
    },
    {
      q: "Funciona no celular?",
      a: "100%. O FutSimples foi feito para ser usado na beira do campo, no celular. Não precisa instalar nada — abre direto no navegador como qualquer site.",
    },
    {
      q: "Quantos alunos posso cadastrar?",
      a: "Ilimitados. Não importa se tem 15 ou 400 alunos — o preço é o mesmo.",
    },
    {
      q: "E se eu não gostar?",
      a: "Cancela dentro dos 7 dias e não paga nada. Sem email de cobrança, sem multa, sem explicação necessária. Fácil assim.",
    },
    {
      q: "Qual a diferença entre mensal e anual?",
      a: "No anual você paga R$599 uma vez por ano — equivale a R$49,92/mês — e economiza R$119,80. Mesmas funcionalidades. A diferença é só no seu bolso.",
    },
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "oklch(0.05 0.020 265)" }}>
      <AnimatedBackground />

      <div className="relative" style={{ zIndex: 10 }}>

        {/* ── Navbar ── */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl border-b border-white/5" : ""}`}
          style={scrolled ? { background: "rgba(3,8,16,0.88)" } : undefined}
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

        {/* ── HERO ── */}
        <section className="pt-36 pb-20 px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
            ⚽ Para donos de escolinha de futebol no Brasil
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6 max-w-4xl mx-auto">
            <span className="text-white">Sua escolinha perde dinheiro</span>
            <span className="block mt-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              todo mês. E você sabe disso.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto mb-4 leading-relaxed">
            Mensalidades em atraso, presença no papel, cobrança um por um no WhatsApp. FutSimples resolve tudo isso em um sistema simples — sem precisar virar especialista em tecnologia.
          </p>

          <p className="text-sm text-emerald-400 font-semibold mb-10">
            Sem cartão de crédito · 7 dias grátis · Cancela quando quiser
          </p>

          <Link href="/setup" className="relative group inline-block">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
              Quero testar grátis por 7 dias
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
          <p className="text-xs text-white/25 mt-3">Não precisa de cartão. Cancela sem explicação.</p>
        </section>

        {/* ── AGITAÇÃO — "Você ainda faz isso?" ── */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              Se sua escolinha tem mais de 10 alunos, você provavelmente faz isso:
            </h2>
            <p className="text-white/40 text-sm mb-8">Anota mentalmente enquanto lê cada item abaixo.</p>

            <div className="space-y-4">
              {[
                { text: "Manda cobrança de mensalidade um por um no WhatsApp, todo mês, do zero.", cost: "3 a 5 horas perdidas por mês" },
                { text: "Não sabe de cabeça quantos alunos estão em atraso agora, nesse momento.", cost: "Dinheiro que você não sabe que perdeu" },
                { text: "Registra presença no papel, no celular pessoal ou simplesmente não registra.", cost: "Sem histórico, sem controle" },
                { text: "No fim do mês, tenta montar o resultado no Excel e os números não batem.", cost: "Decisões tomadas no escuro" },
                { text: "Quando um pai pergunta sobre a frequência do filho, você não sabe de cabeça.", cost: "Credibilidade que você perde" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-5 h-5 rounded border-2 border-amber-500/60 bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 leading-relaxed">{item.text}</p>
                    <p className="text-xs text-amber-400/70 mt-0.5">{item.cost}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/8 pt-6">
              <p className="text-sm text-white/60 leading-relaxed">
                Isso não é falta de esforço. É o que acontece quando você tenta gerenciar uma empresa usando ferramentas de uso pessoal. <span className="text-white font-semibold">Planilha, caderno e WhatsApp não foram feitos para gerir escolinha.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── CUSTO DA INAÇÃO ── */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", title: "15% a 30% do faturamento", body: "É o que escolinhas sem controle perdem em inadimplência. Em uma escola com R$3.000/mês, são até R$900 que somem sem você perceber." },
              { icon: Clock, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", title: "4 horas por mês perdidas", body: "Só em cobranças manuais. Tempo que você poderia usar no campo, com alunos, ou simplesmente descansando." },
              { icon: FileBarChart, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", title: "0 decisões baseadas em dados", body: "Sem relatório real, você toma decisão no feeling. Quando percebe que está no prejuízo, já perdeu meses de faturamento." },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl border ${p.bg} p-5`}>
                <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center mb-3">
                  <p.icon className={`w-4 h-4 ${p.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SOLUÇÃO — antes/depois ── */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Com FutSimples, isso muda em 10 minutos.
            </h2>
            <p className="text-white/40">Cada funcionalidade foi feita para substituir algo que dói no dia a dia.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: CreditCard,
                color: "from-emerald-500 to-green-400",
                before: "Cobra inadimplente um por um no WhatsApp, todo mês, sem parar.",
                after: "Vê todos os atrasados numa tela e dispara cobrança com PIX em 2 minutos. Para todos de uma vez.",
                label: "Cobrança em lote"
              },
              {
                icon: Users,
                color: "from-blue-500 to-cyan-400",
                before: "Alunos espalhados em caderno, celular pessoal, cabeça e papelzinho na gaveta.",
                after: "Cadastro completo: nome, responsável, categoria, ficha médica. Tudo num lugar, acessível no celular.",
                label: "Gestão de alunos"
              },
              {
                icon: CalendarCheck,
                color: "from-violet-500 to-purple-400",
                before: "Presença no papel. Pai liga perguntando se o filho foi ao treino e você não sabe responder.",
                after: "Presença marcada digital. Pai acompanha direto pelo portal do responsável — sem ligar pra você.",
                label: "Presença digital"
              },
              {
                icon: Receipt,
                color: "from-rose-500 to-pink-400",
                before: "No fim do mês você tenta fechar as contas e os números não batem. Você não sabe se teve lucro.",
                after: "Receitas e despesas no sistema. Resultado real do mês em um clique, exportável em PDF.",
                label: "Controle financeiro"
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
                        <p className="text-sm text-white/55 leading-relaxed">{f.before}</p>
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

        {/* ── COMO FUNCIONA ── */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Começa agora. Funciona hoje.</h2>
            <p className="text-white/40">Sem implantação. Sem técnico. Sem treinamento obrigatório.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Cria sua conta grátis", desc: "2 minutos. Só email e senha. Nenhum dado de pagamento pedido agora." },
              { step: "02", title: "Cadastra seus alunos", desc: "Nome, categoria, responsável. Depois vai adicionando os detalhes no seu ritmo." },
              { step: "03", title: "Usa no celular, no campo", desc: "Presença, cobrança, financeiro. Onde você estiver, quando precisar." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="text-4xl font-black text-emerald-500/20 mb-3">{s.step}</div>
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

        {/* ── PARA QUEM É ── */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">
            Para quem é o FutSimples
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">É pra você se...</p>
              <ul className="space-y-3">
                {[
                  "Tem escolinha com 10 ou mais alunos",
                  "Cobra mensalidade todo mês",
                  "Quer saber quem está em atraso sem precisar calcular",
                  "Quer parar de usar planilha, caderno ou WhatsApp para tudo",
                  "Quer registrar presença de forma rápida e digital",
                  "Quer um relatório real no fim do mês",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/75">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Não é pra você se...</p>
              <ul className="space-y-3">
                {[
                  "Você quer um sistema de ERP empresarial complexo",
                  "Você não cobra mensalidade dos seus alunos",
                  "Você prefere planilha e está satisfeito com ela",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/35">
                    <X className="w-4 h-4 text-white/25 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-white/8">
                <p className="text-xs text-white/30 leading-relaxed">O FutSimples foi feito para ser simples. Não tentamos resolver tudo — resolvemos o que mais dói para donos de escolinha.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="max-w-4xl mx-auto px-4 py-20" id="planos">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Quanto custa?</h2>
            <p className="text-white/40">Menos do que você perde em inadimplência em um único mês.</p>
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

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Mensal */}
            <div className={`rounded-2xl border p-6 transition-all ${plan === "monthly" ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/[0.03]"}`}>
              <p className="text-sm font-semibold text-white/60 mb-1">Plano Mensal</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-white">R$59</span>
                <span className="text-xl font-bold text-white">,90</span>
                <span className="text-sm text-white/40 mb-1">/mês</span>
              </div>
              <p className="text-xs text-white/30 mb-6">Cobrado mensalmente. Cancela quando quiser.</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Alunos ilimitados",
                  "Cobrança em lote com PIX",
                  "Portal do responsável",
                  "Controle de presença digital",
                  "Agenda de treinos",
                  "Relatório financeiro PDF",
                  "Convite de professores",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/setup" className="block w-full text-center rounded-xl border border-emerald-500/50 text-emerald-400 font-semibold py-3 text-sm hover:bg-emerald-500/10 transition-all">
                Testar 7 dias grátis
              </Link>
            </div>

            {/* Anual */}
            <div className={`rounded-2xl border p-6 transition-all relative ${plan === "annual" ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/[0.03]"}`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 px-3 py-1 text-xs font-bold text-white shadow">
                  <Star className="w-3 h-3" /> Melhor valor
                </span>
              </div>
              <p className="text-sm font-semibold text-white/60 mb-1">Plano Anual</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-white">R$599</span>
                <span className="text-sm text-white/40 mb-1">/ano</span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold mb-6">Equivale a R$49,92/mês · Economize R$119,80</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Alunos ilimitados",
                  "Cobrança em lote com PIX",
                  "Portal do responsável",
                  "Controle de presença digital",
                  "Agenda de treinos",
                  "Relatório financeiro PDF",
                  "Convite de professores",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/setup" className="relative group block">
                <div className="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 py-3 text-sm font-bold text-white">
                  Testar 7 dias grátis
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-white/30 mt-6">Pagamento via Stripe · Cartão de crédito ou Boleto bancário · Cancele quando quiser</p>
        </section>

        {/* ── OBJEÇÕES / FAQ ── */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-3">Perguntas frequentes</h2>
          <p className="text-white/40 text-center text-sm mb-10">Se ainda tem dúvida, a resposta provavelmente está aqui.</p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-24 px-4">
          <div className="max-w-2xl mx-auto text-center">

            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Cada mês que você espera é mais um mês perdendo dinheiro.
            </h2>
            <p className="text-white/40 text-lg mb-4">
              Teste agora. 7 dias grátis. Sem cartão. Se não resolver, não paga nada.
            </p>
            <p className="text-emerald-400 font-semibold text-sm mb-10">
              A configuração inteira leva menos de 10 minutos.
            </p>

            <Link href="/setup" className="relative group inline-block">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
                Quero começar agora — é grátis
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>

            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              {[
                "Sem cartão de crédito",
                "7 dias grátis",
                "Cancela quando quiser",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-white/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50" />
                  {item}
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
              <span className="text-sm text-white/30">· Gestão para escolinhas de futebol</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
            </div>
          </div>
          <p className="text-center text-xs text-white/20 mt-6">
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
            "description": "Sistema de gestão completo para escolinhas de futebol. Controle alunos, pagamentos, inadimplência, presença e relatórios financeiros.",
            "offers": [
              { "@type": "Offer", "price": "59.90", "priceCurrency": "BRL", "description": "Plano Mensal — 7 dias grátis" },
              { "@type": "Offer", "price": "599.00", "priceCurrency": "BRL", "description": "Plano Anual — 7 dias grátis, 2 meses grátis" },
            ],
            "url": "https://futsimples.netlify.app",
            "inLanguage": "pt-BR",
          })
        }}
      />

      <style>{`
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
