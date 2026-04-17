"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, CreditCard, CalendarCheck, FileBarChart,
  CalendarDays, Receipt, CheckCircle2, ArrowRight, Loader2,
  Zap, Star, Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const features = [
  { icon: Users,        color: "from-blue-500 to-cyan-400",    glow: "shadow-blue-500/30",   title: "Gestão de Alunos",      description: "Cadastre e organize alunos por categoria. Histórico completo em segundos." },
  { icon: CreditCard,   color: "from-emerald-500 to-green-400",glow: "shadow-emerald-500/30", title: "Pagamentos",            description: "Mensalidades, cobranças via WhatsApp e relatório financeiro automático." },
  { icon: CalendarCheck,color: "from-violet-500 to-purple-400",glow: "shadow-violet-500/30",  title: "Presença",              description: "Marque a presença de cada treino e veja o histórico por categoria." },
  { icon: CalendarDays, color: "from-orange-500 to-amber-400", glow: "shadow-orange-500/30",  title: "Agenda",                description: "Treinos semanais e jogos pontuais organizados em um só lugar." },
  { icon: Receipt,      color: "from-rose-500 to-pink-400",    glow: "shadow-rose-500/30",    title: "Despesas",              description: "Controle gastos fixos e variáveis. Veja o resultado financeiro do mês." },
  { icon: FileBarChart, color: "from-cyan-500 to-teal-400",    glow: "shadow-cyan-500/30",    title: "Relatórios",            description: "Relatório mensal completo com receitas, despesas e inadimplência." },
];

const plans = [
  "Alunos ilimitados",
  "Controle de pagamentos",
  "Registro de presença",
  "Agenda de treinos e jogos",
  "Relatórios mensais",
  "Cobranças via WhatsApp",
  "Acesso pelo celular",
  "Convidar professores",
];

const stats = [
  { value: "100%", label: "Online", icon: Zap },
  { value: "Grátis", label: "Para começar", icon: Star },
  { value: "Seguro", label: "Google Firebase", icon: Shield },
];

export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (firebaseUser) return null;

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#030712]/90 backdrop-blur-xl border-b border-white/5" : ""}`}>
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
                Criar conta
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-24 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-8">
          <Zap className="w-3.5 h-3.5" />
          Sistema completo para escolinhas de futebol
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6">
          <span className="block text-white">Gerencie sua</span>
          <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]">
            escolinha
          </span>
          <span className="block text-white/90 mt-2">sem complicação</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Alunos, pagamentos, presença, agenda e relatórios — tudo em um sistema simples, rápido e acessível pelo celular.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/setup" className="relative group w-full sm:w-auto">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="relative inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
              Começar gratuitamente
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur">
            Já tenho conta
          </Link>
        </div>

        {/* Stats */}
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

      {/* ── Features ── */}
      <section className="relative max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Tudo que você precisa
          </h2>
          <p className="text-white/40 text-lg">Em um sistema simples. Sem planilha. Sem papel.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300"
            >
              {/* Card glow on hover */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${f.color} blur-2xl -z-10`} style={{ opacity: 0 }} />

              <div className={`relative mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} shadow-lg ${f.glow}`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="relative max-w-6xl mx-auto px-4 py-24">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Simples assim</h2>
          <p className="text-white/40 text-lg">Um plano. Tudo incluído.</p>
        </div>

        <div className="max-w-md mx-auto relative">
          {/* Outer glow */}
          <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-2xl" />

          {/* Card */}
          <div className="relative rounded-3xl border border-emerald-500/30 bg-[#0a1a0f] p-8 shadow-2xl">
            {/* Top badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
                <Star className="w-3 h-3" />
                MAIS POPULAR
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
                <p className="text-xs text-emerald-400">Gestão completa</p>
              </div>
            </div>

            <div className="text-center my-6">
              <div className="text-5xl font-black text-white mb-1">Grátis</div>
              <p className="text-sm text-white/40">para começar · sem cartão</p>
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
                Criar minha conta grátis
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
          Pronto para começar?
        </h2>
        <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto">
          Junte-se a donos de escolinha que já simplificaram sua gestão com o FutSimples.
        </p>
        <Link href="/setup" className="relative group inline-block">
          <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-300 transition-all">
            Criar conta gratuita
            <ArrowRight className="w-5 h-5" />
          </span>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600">
              <Trophy className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white">FutSimples</span>
            <span className="text-sm text-white/30">· Gestão de escolinhas</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
