"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, CreditCard, CalendarCheck, FileBarChart,
  CalendarDays, Receipt, CheckCircle2, ArrowRight, Loader2,
  Star, Clock, AlertTriangle, ChevronDown, ChevronUp, Smartphone,
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
      q: "Como funciona o teste grátis?",
      a: "Você cria sua conta agora e tem 7 dias para usar o sistema completo sem pagar nada e sem precisar de cartão de crédito. Se gostar, assina. Se não gostar, cancela e não paga nada.",
    },
    {
      q: "Qual a diferença entre mensal e anual?",
      a: "No plano anual você paga R$599 uma vez por ano — equivalente a R$49,92/mês — e economiza R$119,80 em relação ao mensal. Mesmas funcionalidades, só o preço muda.",
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim. Sem contrato, sem fidelidade, sem multa. Cancela a qualquer momento pelo painel do Stripe ou mandando mensagem pra gente.",
    },
    {
      q: "Funciona pelo celular?",
      a: "100%. O FutSimples foi pensado para ser usado no celular, no campo, em qualquer lugar. Não precisa instalar nada — abre direto no navegador.",
    },
    {
      q: "Quantos alunos posso cadastrar?",
      a: "Alunos ilimitados. Não importa se sua escolinha tem 20 ou 300 alunos — o sistema suporta tudo sem custo extra.",
    },
    {
      q: "Meus dados ficam seguros?",
      a: "Sim. Os dados ficam no Google Firebase, mesma infraestrutura de milhares de empresas no mundo. Cada escola acessa apenas os próprios dados.",
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

        {/* ── Hero ── */}
        <section className="pt-32 pb-20 px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
            ⚽ Sistema de gestão para escolinhas de futebol
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6 max-w-4xl mx-auto">
            <span className="text-white">Pare de perder dinheiro</span>
            <span className="block mt-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              com inadimplência.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/55 max-w-xl mx-auto mb-3 leading-relaxed">
            Controle alunos, cobranças, presença e financeiro da sua escolinha — tudo simples, rápido e pelo celular.
          </p>

          <p className="text-sm text-emerald-400 font-semibold mb-10">
            ✓ 7 dias grátis sem pagar nada &nbsp;·&nbsp; ✓ Depois: Cartão ou Boleto &nbsp;·&nbsp; ✓ Cancele quando quiser
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/setup" className="relative group w-full sm:w-auto">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="relative inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
                Começar grátis — 7 dias
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 hover:bg-white/10 transition-all">
              Já tenho conta
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16">
            {[
              { icon: Smartphone, value: "100%", label: "Pelo celular" },
              { icon: Star, value: "7 dias", label: "Grátis para testar" },
              { icon: CheckCircle2, value: "Stripe", label: "Cartão ou Boleto" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <s.icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Problemas ── */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-3">
            Você se identifica com isso?
          </h2>
          <p className="text-white/40 text-center mb-10">Problemas que todo dono de escolinha enfrenta sem sistema.</p>
          <div className="space-y-4">
            {[
              { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", title: "Não sabe quem está em atraso", body: "A inadimplência corrói entre 15% e 30% do faturamento — e você só percebe no fim do mês quando o dinheiro não fecha." },
              { icon: Clock, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", title: "Perde horas cobrando um por um", body: "Mensagem no WhatsApp, caderno, planilha... Tempo que deveria estar no campo você perde com burocracia." },
              { icon: FileBarChart, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", title: "Não sabe se está no lucro ou prejuízo", body: "Sem controle de despesas e receitas, você não sabe se a escolinha está crescendo ou se você está bancando do próprio bolso." },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl border ${p.bg} p-5 flex gap-4`}>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
                  <p.icon className={`w-5 h-5 ${p.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-emerald-400 font-semibold mt-8">O FutSimples resolve os três. Em menos de 10 minutos.</p>
        </section>

        {/* ── Funcionalidades ── */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Tudo que você precisa</h2>
            <p className="text-white/40">Desenvolvido para donos de escolinha de futebol no Brasil.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: CreditCard, color: "from-emerald-500 to-green-400", title: "Cobrança em lote", desc: "Veja todos os inadimplentes e dispare cobranças no WhatsApp com sua chave PIX incluída. 2 minutos no lugar de 2 horas." },
              { icon: Users, color: "from-blue-500 to-cyan-400", title: "Gestão de alunos", desc: "Cadastro completo com ficha médica, responsável, categoria e histórico. Tudo no celular." },
              { icon: CalendarCheck, color: "from-violet-500 to-purple-400", title: "Presença digital", desc: "Marque presença por treino e categoria. O responsável acompanha o filho pelo portal sem ligar pra você." },
              { icon: CalendarDays, color: "from-orange-500 to-amber-400", title: "Agenda de treinos", desc: "Organize treinos e jogos. Professores veem a agenda deles sem precisar perguntar toda semana." },
              { icon: Receipt, color: "from-rose-500 to-pink-400", title: "Controle financeiro", desc: "Receitas, despesas, resultado líquido. Sabe no final do mês se teve lucro ou prejuízo — com número real." },
              { icon: FileBarChart, color: "from-cyan-500 to-teal-400", title: "Relatório em PDF", desc: "Exporta o relatório financeiro do mês em PDF para guardar no histórico ou mostrar pro contador." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-white/10 hover:bg-white/[0.06] transition-all">
                <div className={`mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="max-w-4xl mx-auto px-4 py-20" id="planos">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Escolha seu plano</h2>
            <p className="text-white/40">7 dias grátis em qualquer plano. Sem cartão para começar.</p>
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
              <p className="text-xs text-white/30 mb-6">Cobrado mensalmente</p>
              <ul className="space-y-2.5 mb-6">
                {["Alunos ilimitados","Cobrança em lote WhatsApp","Portal do responsável","Controle de presença","Agenda de treinos","Relatório financeiro PDF","Convite de professores"].map((item) => (
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
                {["Alunos ilimitados","Cobrança em lote WhatsApp","Portal do responsável","Controle de presença","Agenda de treinos","Relatório financeiro PDF","Convite de professores"].map((item) => (
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

        {/* ── Como funciona ── */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Como funciona</h2>
            <p className="text-white/40">Em menos de 10 minutos sua escolinha está organizada.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Cria sua conta", desc: "Cadastra sua escolinha em 2 minutos. Sem burocracia, sem cartão." },
              { step: "02", title: "Cadastra seus alunos", desc: "Adiciona alunos com categoria, responsável e ficha médica." },
              { step: "03", title: "Gerencia pelo celular", desc: "Pagamentos, presença, cobranças — tudo na palma da mão." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="text-4xl font-black text-emerald-500/20 mb-3">{s.step}</div>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">Perguntas frequentes</h2>
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

        {/* ── CTA Final ── */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Testa grátis por 7 dias.<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Sem cartão. Sem risco.
              </span>
            </h2>
            <p className="text-white/40 text-lg mb-10">
              Se gostar, assina por R$59,90/mês ou R$599/ano. Se não gostar, não paga nada.
            </p>
            <Link href="/setup" className="relative group inline-block">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
                Quero testar grátis agora
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            <p className="text-white/25 text-sm mt-4">7 dias grátis · Pagamento via Stripe (Cartão de crédito ou Boleto) · Cancele quando quiser</p>
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
