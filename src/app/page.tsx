"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, CreditCard, CalendarCheck, FileBarChart,
  CalendarDays, Receipt, CheckCircle2, ArrowRight, Loader2,
  Zap, Star, Shield, MessageCircle, TrendingUp, Clock,
  AlertTriangle, ChevronDown, ChevronUp, Smartphone, Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { AnimatedBackground } from "@/components/landing/animated-bg";
import { ProductScreenshots } from "@/components/landing/product-screenshots";

// ─── Data ──────────────────────────────────────────────────────────────────────

const pains = [
  {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Você sabe exatamente quem está em atraso agora?",
    body: "A maioria dos donos de escolinha perde entre 15% e 30% do faturamento por inadimplência invisível. O aluno some, a mensalidade some junto — e você só percebe no fim do mês quando o dinheiro não fecha.",
  },
  {
    icon: Clock,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    title: "Quantas horas por semana você perde com cobrança e burocracia?",
    body: "Cobrar um por um no WhatsApp, anotar em caderno, procurar em planilha quem pagou, responder pai perguntando se filho foi no treino... Isso é tempo que deveria estar no campo, não no celular.",
  },
  {
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Sua escolinha está no lucro ou no prejuízo?",
    body: "Aluguel do campo, material, árbitro, uniforme — os gastos aparecem no meio do mês sem aviso. Sem controle financeiro, você não sabe se está crescendo ou bancando a escolinha do próprio bolso.",
  },
];

const features = [
  {
    icon: CreditCard, color: "from-emerald-500 to-green-400", glow: "shadow-emerald-500/30",
    title: "Cobrança automática",
    description: "Veja todos os inadimplentes de uma vez e dispare mensagens de cobrança no WhatsApp em lote — com sua chave PIX incluída. Em 2 minutos o que levava 2 horas.",
  },
  {
    icon: Users, color: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/30",
    title: "Gestão de alunos",
    description: "Cadastro completo com ficha médica, tipo sanguíneo, alergias, contato de emergência e autorização dos pais. Tudo em um lugar, acessível do celular.",
  },
  {
    icon: CalendarCheck, color: "from-violet-500 to-purple-400", glow: "shadow-violet-500/30",
    title: "Presença digital",
    description: "Marque a presença de cada treino por categoria. O responsável vê o histórico do filho pelo portal sem precisar ligar pra você.",
  },
  {
    icon: CalendarDays, color: "from-orange-500 to-amber-400", glow: "shadow-orange-500/30",
    title: "Agenda de treinos e jogos",
    description: "Organize treinos recorrentes e jogos num só lugar. Professores enxergam a agenda deles sem precisar perguntar toda semana.",
  },
  {
    icon: Receipt, color: "from-rose-500 to-pink-400", glow: "shadow-rose-500/30",
    title: "Controle de despesas",
    description: "Registre aluguel, material, árbitro e outros gastos. Veja no final do mês se a escolinha deu lucro ou prejuízo — com número real, não chute.",
  },
  {
    icon: FileBarChart, color: "from-cyan-500 to-teal-400", glow: "shadow-cyan-500/30",
    title: "Relatório financeiro",
    description: "Receitas, despesas, inadimplência e saldo do mês num relatório que você exporta em PDF para mostrar pro contador ou guardar no histórico.",
  },
];

const plans = [
  "Alunos ilimitados",
  "Cobrança em lote via WhatsApp",
  "Ficha médica dos alunos",
  "Portal do responsável",
  "Controle de presença",
  "Agenda de treinos e jogos",
  "Relatório financeiro mensal",
  "Acesso pelo celular",
  "Convidar professores",
];

const stats = [
  { value: "100%", label: "Pelo celular", icon: Smartphone },
  { value: "14 dias", label: "Grátis para testar", icon: Star },
  { value: "Seguro", label: "Google Firebase", icon: Lock },
];

const faqs = [
  {
    q: "Como funciona o período de teste?",
    a: "Você cria sua conta e tem 14 dias para testar o sistema completo sem pagar nada e sem precisar de cartão de crédito. Depois dos 14 dias, assina por R$59,90/mês para continuar usando.",
  },
  {
    q: "Quanto custa após o teste?",
    a: "R$59,90 por mês, com tudo incluído. Sem taxa de instalação, sem contratos, sem fidelidade. Cancele quando quiser.",
  },
  {
    q: "Precisa instalar algum aplicativo?",
    a: "Não. O FutSimples funciona direto no navegador do celular ou computador, sem instalar nada. Acesse de qualquer dispositivo com internet.",
  },
  {
    q: "Quantos alunos posso cadastrar?",
    a: "Alunos ilimitados. Não importa se sua escolinha tem 20 ou 200 alunos — o sistema aguenta sem custo extra.",
  },
  {
    q: "Como funciona o portal do responsável?",
    a: "Cada aluno tem um link único. Você copia e manda no WhatsApp pro pai. Ele abre no celular sem fazer login e vê a presença do filho, status de pagamento e histórico. Elimina 90% das perguntas que os pais mandam pra você.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Sim. Os dados ficam no Google Firebase, a mesma infraestrutura usada por milhares de empresas no mundo. Cada escola acessa apenas os próprios dados.",
  },
  {
    q: "Posso usar com minha equipe de professores?",
    a: "Sim. Você convida os professores para o sistema e define o que cada um pode ver e fazer. Professor marca presença, você controla o financeiro.",
  },
  {
    q: "Funciona para qualquer tipo de escolinha?",
    a: "Funciona para qualquer escolinha de futebol — desde escolinhas de bairro com 30 alunos até escolinhas estruturadas com múltiplas categorias e professores.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
                  <Trophy className="w-4.5 h-4.5 text-white" />
                </div>
              </div>
              <span className="text-base font-black tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                FutSimples
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5">
                Entrar
              </Link>
              <Link href="/setup" className="relative group">
                <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-50 group-hover:opacity-80 transition-opacity" />
                <span className="relative inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-white transition-colors">
                  Criar conta grátis
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative pt-36 pb-20 px-4 text-center overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
            <Zap className="w-3.5 h-3.5" />
            Sistema completo para escolinhas de futebol
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="block text-white">Chega de planilha.</span>
            <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]">
              Sua escolinha
            </span>
            <span className="block text-white/90 mt-2">no controle.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto mb-4 leading-relaxed">
            O sistema de gestão feito para donos de escolinha de futebol. Controle alunos, mensalidades, presença e inadimplência — tudo simples, rápido e pelo celular.
          </p>
          <p className="text-sm text-emerald-400/80 mb-10 font-medium">
            14 dias grátis para testar · depois R$59,90/mês · Cartão ou Boleto
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/setup" className="relative group w-full sm:w-auto">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="relative inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
                Começar grátis — 14 dias
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur">
              Já tenho conta
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            {stats.map((s) => (
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

        {/* ── Pain Section ── */}
        <section className="relative max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Você se identifica com alguma dessas situações?
            </h2>
            <p className="text-white/40">São os problemas mais comuns de quem gerencia escolinha sem sistema.</p>
          </div>
          <div className="space-y-4">
            {pains.map((p, i) => (
              <div key={i} className={`rounded-2xl border ${p.bg} p-5 flex gap-4`}>
                <div className={`shrink-0 w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center`}>
                  <p.icon className={`w-5 h-5 ${p.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-white/50 text-sm mb-4">O FutSimples resolve os três de uma vez.</p>
            <Link href="/setup" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors">
              Quero organizar minha escolinha <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── Product Screenshots ── */}
        <section className="relative max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Veja como funciona na prática
            </h2>
            <p className="text-white/40">Interface simples, pensada para uso no celular.</p>
          </div>
          <ProductScreenshots />
        </section>

        {/* ── Features ── */}
        <section className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Tudo que uma escolinha precisa
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">Desenvolvido especificamente para donos e gestores de escolinhas de futebol no Brasil.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className={`relative mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} shadow-lg ${f.glow}`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="relative max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Como funciona na prática</h2>
            <p className="text-white/40">Em menos de 10 minutos sua escolinha está organizada.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Crie sua conta", desc: "Cadastre sua escolinha em menos de 2 minutos. Sem burocracia, sem cartão." },
              { step: "02", title: "Cadastre seus alunos", desc: "Importe ou cadastre seus alunos com categoria, responsável, telefone e ficha médica." },
              { step: "03", title: "Gerencie tudo pelo celular", desc: "Pagamentos, presença, agenda, cobranças — tudo na palma da mão, de qualquer lugar." },
            ].map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="text-4xl font-black text-emerald-500/20 mb-3">{s.step}</div>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Simples assim</h2>
            <p className="text-white/40 text-lg">Um plano. Tudo incluído. 14 dias grátis para testar.</p>
          </div>

          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl border border-emerald-500/30 bg-[#0a1a0f] p-8 shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
                  <Star className="w-3 h-3" />
                  TUDO INCLUÍDO
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 mb-2 mt-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-md opacity-70" />
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">FutSimples</h3>
                  <p className="text-xs text-emerald-400">Plano Mensal</p>
                </div>
              </div>
              <div className="text-center my-6">
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-black text-white">R$59</span>
                  <span className="text-2xl font-black text-white">,90</span>
                  <span className="text-base text-white/40 mb-1">/mês</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <Clock className="w-3 h-3" />
                  14 dias grátis · sem cartão agora
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plans.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/setup" className="relative group block">
                <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 py-4 text-base font-bold text-white shadow-xl hover:from-emerald-400 hover:to-green-300 transition-all">
                  Começar grátis — 14 dias
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <p className="text-center text-xs text-white/30 mt-3">Cancele quando quiser · Sem fidelidade</p>
              <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-white/5">
                <span className="text-xs text-white/30">Pagamento via</span>
                <span className="text-xs font-semibold text-white/50 bg-white/5 rounded px-2 py-0.5">Cartão de crédito</span>
                <span className="text-xs font-semibold text-white/50 bg-white/5 rounded px-2 py-0.5">Boleto</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="relative max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Perguntas frequentes
            </h2>
            <p className="text-white/40">Dúvidas sobre o sistema de gestão para escolinhas</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
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

        {/* ── Final CTA ── */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Sua escolinha organizada<br />a partir de hoje.
          </h2>
          <p className="text-white/40 text-lg mb-3 max-w-lg mx-auto">
            Pare de perder dinheiro com inadimplência e tempo com burocracia. Teste grátis por 14 dias, sem cartão.
          </p>
          <p className="text-emerald-400/70 text-sm mb-10">
            14 dias grátis · depois R$59,90/mês · Cancele quando quiser
          </p>
          <Link href="/setup" className="relative group inline-block">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
              Quero organizar minha escolinha agora
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/5 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600">
                  <Trophy className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-black text-white">FutSimples</span>
                <span className="text-sm text-white/30">· Sistema de gestão para escolinhas de futebol</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/30">
                <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
                <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
                <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
              </div>
            </div>
            <p className="text-center text-xs text-white/20">
              © {new Date().getFullYear()} FutSimples. Sistema de gestão para escolinhas de futebol no Brasil.
            </p>
          </div>
        </footer>

      </div>{/* end z-10 wrapper */}

      {/* JSON-LD Structured Data */}
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
            "offers": {
              "@type": "Offer",
              "price": "59.90",
              "priceCurrency": "BRL",
              "description": "14 dias grátis, depois R$59,90/mês. Pagamento via cartão de crédito ou boleto bancário."
            },
            "url": "https://futsimples.netlify.app",
            "inLanguage": "pt-BR",
            "audience": {
              "@type": "Audience",
              "audienceType": "Donos e gestores de escolinhas de futebol"
            },
            "featureList": [
              "Gestão de alunos com ficha médica",
              "Controle de pagamentos e mensalidades",
              "Cobrança em lote via WhatsApp com PIX",
              "Portal do responsável",
              "Controle de presença por categoria",
              "Agenda de treinos e jogos",
              "Controle de despesas",
              "Relatório financeiro mensal",
              "Convite de professores"
            ]
          })
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
