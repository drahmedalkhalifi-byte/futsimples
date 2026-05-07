"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  ClipboardCheck,
  Wallet,
  ChevronDown,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const SETUP_URL = "/setup";
const LOGIN_URL = "/login";

// ─── Root ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser) router.replace("/dashboard");
  }, [firebaseUser, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ backgroundImage: "none" }}>
      <Header />
      <Hero />
      <SocialProofBar />
      <Pain />
      <Solution />
      <HowItWorks />
      <FitFor />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Trophy className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">FutSimples</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#problema" className="transition-colors hover:text-foreground">Problema</a>
          <a href="#solucao" className="transition-colors hover:text-foreground">Solução</a>
          <a href="#preco" className="transition-colors hover:text-foreground">Preço</a>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href={LOGIN_URL} className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">
            Entrar
          </Link>
          <Link
            href={SETUP_URL}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
          >
            Testar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-glow">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Para donos de escolinha de futebol no Brasil
          </div>
          <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Chega de cobrar mensalidade no{" "}
            <span className="text-gradient-primary">WhatsApp.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            FutSimples organiza alunos, cobra inadimplentes com PIX e registra presença.
            Tudo no celular. Em 10 minutos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={SETUP_URL}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
            >
              Testar grátis por 7 dias
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#solucao"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              Ver como funciona
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Sem cartão</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> 7 dias grátis</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Cancele quando quiser</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="absolute -inset-10 -z-10 bg-hero-glow blur-2xl" />
          <Image
            src="/mockup-cobranca.png"
            alt="Tela do FutSimples mostrando cobrança em lote via PIX"
            width={1024}
            height={1536}
            className="w-full drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof Bar ────────────────────────────────────────────────────────

function SocialProofBar() {
  const stats = [
    { value: "R$900", label: "perdidos por mês em inadimplência sem controle" },
    { value: "4h", label: "gastas todo mês cobrando aluno por aluno" },
    { value: "0", label: "relatórios reais quando você usa só planilha" },
  ];
  return (
    <section className="border-y border-border/50 bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.value} className="text-center md:text-left">
            <div className="text-4xl font-bold text-gradient-primary md:text-5xl">{s.value}</div>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pain ─────────────────────────────────────────────────────────────────────

function Pain() {
  const items = [
    { dor: "Cobrar atrasados um por um no WhatsApp", custo: "4h/mês" },
    { dor: "Não saber quem está inadimplente agora", custo: "Dinheiro sumindo" },
    { dor: "Presença no papel ou na memória", custo: "Zero histórico" },
    { dor: "Fechar o mês no Excel e os números não batem", custo: "Decisão no chute" },
    { dor: "Pai pergunta a frequência — você não sabe", custo: "Credibilidade" },
  ];
  return (
    <section id="problema" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">O problema</span>
        <h2 className="mt-3 text-4xl font-bold md:text-5xl">Você ainda faz isso todo mês?</h2>
        <p className="mt-4 text-muted-foreground">
          Não é falta de esforço — é tentar gerir uma empresa com ferramentas feitas para uso pessoal.
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((it) => (
          <div key={it.dor} className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                <X className="h-3.5 w-3.5 text-destructive" strokeWidth={3} />
              </div>
              <span className="text-foreground">{it.dor}</span>
            </div>
            <span className="shrink-0 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              {it.custo}
            </span>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
        Planilha e WhatsApp não foram feitos para gerir uma empresa.
      </p>
    </section>
  );
}

// ─── Solution ─────────────────────────────────────────────────────────────────

function Solution() {
  const features = [
    {
      icon: Zap,
      title: "Cobrança em lote",
      hoje: "Você manda mensagem no WhatsApp um por um. Todo mês. Do zero.",
      novo: "Todos os atrasados numa tela. PIX para todos em 2 cliques.",
      img: "/mockup-cobranca.png",
    },
    {
      icon: ClipboardCheck,
      title: "Presença digital",
      hoje: "Papel. Pai liga perguntando se o filho foi ao treino.",
      novo: "Portal do responsável. Pai acompanha — sem ligar para você.",
      img: "/mockup-presenca.png",
    },
    {
      icon: Wallet,
      title: "Financeiro real",
      hoje: "Você tenta fechar as contas no fim do mês e os números não batem.",
      novo: "Receitas e despesas no sistema. PDF em um clique.",
      img: "/mockup-financeiro.png",
    },
  ];
  return (
    <section id="solucao" className="border-t border-border/50 bg-card/20">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">A solução</span>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">Isso muda em 10 minutos.</h2>
          <p className="mt-4 text-muted-foreground">
            Cada função existe para eliminar algo que drena tempo ou dinheiro hoje.
          </p>
        </div>

        <div className="mt-16 space-y-24">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-accent-foreground">
                  <f.icon className="h-3.5 w-3.5" />
                  {f.title}
                </div>
                <h3 className="mt-4 text-3xl font-bold md:text-4xl">{f.novo.split(".")[0]}.</h3>
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                      <X className="h-3 w-3 text-destructive" strokeWidth={3} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hoje</div>
                      <p className="text-sm text-foreground/80">{f.hoje}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-primary">Com FutSimples</div>
                      <p className="text-sm text-foreground">{f.novo}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-xs">
                <div className="absolute -inset-8 -z-10 bg-hero-glow blur-2xl" />
                <Image
                  src={f.img}
                  alt={`Tela do FutSimples — ${f.title}`}
                  width={1024}
                  height={1536}
                  loading="lazy"
                  className="w-full drop-shadow-2xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { n: "01", t: "Cria sua conta", d: "Email e senha. 2 minutos. Sem cartão." },
    { n: "02", t: "Cadastra os alunos", d: "Nome, turma, responsável. No seu ritmo." },
    { n: "03", t: "Usa na beira do campo", d: "Presença, cobrança, financeiro. No celular." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">Como funciona</span>
        <h2 className="mt-3 text-4xl font-bold md:text-5xl">Em 10 minutos, funcionando.</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
            <div className="text-5xl font-bold text-gradient-primary">{s.n}</div>
            <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          href={SETUP_URL}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          Começar agora — é grátis
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

// ─── Fit For ──────────────────────────────────────────────────────────────────

function FitFor() {
  const yes = [
    "Tem escolinha com 10+ alunos",
    "Cobra mensalidade todo mês",
    "Quer saber quem está em atraso sem calcular",
    "Quer parar de usar planilha para tudo",
    "Quer registrar presença rápido",
    "Quer relatório real no fim do mês",
  ];
  const no = [
    "Você quer um sistema de ERP empresarial",
    "Você não cobra mensalidade",
    "Você prefere planilha e está satisfeito",
  ];
  return (
    <section className="border-t border-border/50 bg-card/20">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-20 md:grid-cols-2 lg:py-24">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-7">
          <h3 className="text-xl font-bold">É pra você se...</h3>
          <ul className="mt-5 space-y-3">
            {yes.map((y) => (
              <li key={y} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                <span>{y}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-xl font-bold">Não é pra você se...</h3>
          <ul className="mt-5 space-y-3">
            {no.map((n) => (
              <li key={n} className="flex items-start gap-3 text-sm text-muted-foreground">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={3} />
                <span>{n}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            FutSimples resolve o que mais dói para dono de escolinha. Não resolvemos tudo — de propósito.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const features = [
    "Alunos ilimitados",
    "Cobrança em lote com PIX",
    "Portal do responsável",
    "Presença digital",
    "Agenda de treinos",
    "Relatório financeiro PDF",
    "Convite de professores",
  ];
  return (
    <section id="preco" className="mx-auto max-w-5xl px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">Preço</span>
        <h2 className="mt-3 text-4xl font-bold md:text-5xl">Quanto custa?</h2>
        <p className="mt-4 text-muted-foreground">
          Menos do que um mês de inadimplência não controlada.
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              annual ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Anual <span className="ml-1 text-xs opacity-80">−17%</span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <PriceCard
          title="Mensal"
          price="R$ 59,90"
          per="/mês"
          note="Cobrado mensalmente."
          features={features}
          highlighted={!annual}
        />
        <PriceCard
          title="Anual"
          price="R$ 49,92"
          per="/mês"
          note="R$ 599/ano · Economize R$ 119,80"
          features={features}
          badge="Melhor valor"
          highlighted={annual}
        />
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Stripe · Cartão ou Boleto · Cancele quando quiser
      </p>
    </section>
  );
}

function PriceCard({
  title, price, per, note, features, highlighted, badge,
}: {
  title: string; price: string; per: string; note: string;
  features: string[]; highlighted?: boolean; badge?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-7 ${
        highlighted ? "border-primary/50 bg-primary/5 shadow-glow" : "border-border bg-card"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {badge}
        </span>
      )}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-5xl font-bold">{price}</span>
        <span className="text-muted-foreground">{per}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      <Link
        href={SETUP_URL}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
          highlighted
            ? "bg-gradient-primary text-primary-foreground shadow-glow hover:scale-[1.02]"
            : "border border-border bg-background text-foreground hover:bg-muted"
        }`}
      >
        Testar 7 dias grátis
        <ArrowRight className="h-4 w-4" />
      </Link>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function Faq() {
  const items = [
    { q: "Preciso de cartão para testar?", a: "Não. Você cria a conta com email e senha e usa 7 dias completos sem informar nenhum cartão." },
    { q: "Quanto tempo leva para configurar?", a: "Em média 10 minutos. Cria a conta, cadastra os alunos e já pode cobrar e marcar presença." },
    { q: "Funciona no celular?", a: "Sim. Foi pensado para ser usado na beira do campo, no celular. Funciona no computador também." },
    { q: "Quantos alunos posso cadastrar?", a: "Ilimitado em qualquer plano. Sem cobrança por aluno." },
    { q: "E se eu não gostar?", a: "Cancela com um clique. Sem ligação, sem explicação, sem multa." },
    { q: "Qual a diferença entre mensal e anual?", a: "Mesmas funcionalidades. O plano anual sai 17% mais barato (cerca de 2 meses grátis)." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-border/50 bg-card/20">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">FAQ</span>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">Dúvidas frequentes</h2>
        </div>
        <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((it, i) => (
            <div key={it.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/40"
              >
                <span className="font-medium">{it.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground">{it.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-hero-glow">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
        <h2 className="text-4xl font-bold leading-tight md:text-6xl">
          Cada mês que passa,
          <br />
          é <span className="text-gradient-primary">dinheiro parado.</span>
        </h2>
        <p className="mt-5 text-muted-foreground">
          7 dias grátis. Sem cartão. Se não resolver — não paga nada.
        </p>
        <Link
          href={SETUP_URL}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          Começar agora — é grátis
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
            <Trophy className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-foreground">FutSimples</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-foreground">Termos</a>
          <a href="#" className="hover:text-foreground">Privacidade</a>
          <a href="#" className="hover:text-foreground">Contato</a>
        </div>
      </div>
    </footer>
  );
}
