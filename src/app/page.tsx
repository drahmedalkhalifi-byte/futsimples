"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, CreditCard, CalendarCheck, FileBarChart,
  CalendarDays, Receipt, CheckCircle2, ArrowRight, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const features = [
  {
    icon: Users,
    title: "Gestão de Alunos",
    description: "Cadastre alunos, organize por categoria e mantenha o histórico completo de cada um.",
  },
  {
    icon: CreditCard,
    title: "Controle de Pagamentos",
    description: "Gere mensalidades, acompanhe pendências e avise os responsáveis pelo WhatsApp com um clique.",
  },
  {
    icon: CalendarCheck,
    title: "Registro de Presença",
    description: "Marque a presença de cada treino e consulte o histórico completo por categoria.",
  },
  {
    icon: CalendarDays,
    title: "Agenda de Treinos",
    description: "Organize treinos semanais e jogos pontuais. Tudo em um só lugar.",
  },
  {
    icon: Receipt,
    title: "Controle de Despesas",
    description: "Registre gastos fixos e variáveis e veja o resultado financeiro do mês.",
  },
  {
    icon: FileBarChart,
    title: "Relatórios Mensais",
    description: "Resumo financeiro completo com receitas, despesas e lista de pagamentos pendentes.",
  },
];

const plans = [
  "Alunos ilimitados",
  "Pagamentos e mensalidades",
  "Controle de presença",
  "Agenda de treinos e jogos",
  "Relatórios mensais",
  "Notificações via WhatsApp",
  "Acesso pelo celular ou computador",
];

export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (firebaseUser) router.replace("/dashboard");
  }, [firebaseUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (firebaseUser) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 shadow shadow-primary/30">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">FutSimples</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link
              href="/setup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
          <Trophy className="w-3.5 h-3.5" />
          Gestão simples para escolinhas de futebol
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-5">
          Gerencie sua escolinha<br />
          <span className="text-primary">sem complicação</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Alunos, pagamentos, presença, agenda e relatórios em um sistema simples, feito para treinadores e donos de escolinha.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Começar gratuitamente
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-4">Grátis para começar. Sem cartão de crédito.</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">Tudo que você precisa</h2>
        <p className="text-sm text-muted-foreground text-center mb-10">Em um sistema simples, rápido e acessível pelo celular.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">Simples assim</h2>
        <p className="text-sm text-muted-foreground text-center mb-10">Um plano. Tudo incluído. Sem surpresas.</p>
        <div className="max-w-sm mx-auto rounded-2xl border-2 border-primary/30 bg-card p-8 shadow-xl shadow-primary/5">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow shadow-primary/30 mb-4 mx-auto">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-foreground text-center mb-1">FutSimples</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">Tudo que sua escolinha precisa</p>
          <ul className="space-y-3 mb-8">
            {plans.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/setup"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Criar minha conta
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-primary">
              <Trophy className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">FutSimples</span>
            <span>· Gestão de escolinhas de futebol</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
