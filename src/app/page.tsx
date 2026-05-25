"use client";

import { useState, useEffect, useRef } from "react";
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
  Shield,
  Star,
  Users,
  Smartphone,
  BarChart3,
  Bell,
  FileText,
  Calendar,
  UserCheck,
  CreditCard,
  MousePointerClick,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ProductScreenshots } from "@/components/landing/product-screenshots";

const SETUP_URL = "/setup";
const LOGIN_URL = "/login";

/* ══════════════════════════════════════════════════════════════════════════════
   HOOKS
   ══════════════════════════════════════════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

function useMouseGlow(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, [ref]);
}

/* ══════════════════════════════════════════════════════════════════════════════
   ROOT
   ══════════════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && firebaseUser) router.replace("/dashboard");
  }, [firebaseUser, loading, router]);
  if (loading) return null;

  return (
    <div className="relative min-h-screen bg-[#060a0f] text-white antialiased selection:bg-emerald-500/30">
      {/* ── Global layers ── */}
      <GridBackground />
      <AuroraOrbs />
      <GrainOverlay />

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <LogoTicker />
        <PainSection />
        <BentoFeatures />
        <DemoSection />
        <HowItWorks />
        <StatsRibbon />
        <PricingSection />
        <FaqSection />
        <FinalCta />
        <Footer />
      </div>

      <LandingStyles />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BACKGROUND LAYERS
   ══════════════════════════════════════════════════════════════════════════════ */

function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Horizontal lines */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), rgba(255,255,255,0.08) 100%)",
          backgroundSize: "100% 120px",
        }}
      />
    </div>
  );
}

function AuroraOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />
    </div>
  );
}

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   NAVBAR — glass, floating
   ══════════════════════════════════════════════════════════════════════════════ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`flex w-full max-w-5xl items-center justify-between rounded-2xl border px-5 py-3 transition-all duration-500 ${
          scrolled
            ? "border-white/[0.08] bg-[#060a0f]/80 shadow-2xl shadow-black/40 backdrop-blur-2xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Trophy className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">FutSimples</span>
        </div>

        <div className="hidden items-center gap-7 text-[13px] text-white/50 md:flex">
          <a href="#problema" className="nav-link">Problema</a>
          <a href="#solucao" className="nav-link">Solução</a>
          <a href="#demo" className="nav-link">Demo</a>
          <a href="#preco" className="nav-link">Preço</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href={LOGIN_URL} className="hidden text-[13px] text-white/50 transition-colors duration-200 hover:text-white sm:inline cursor-pointer">
            Entrar
          </Link>
          <Link href={SETUP_URL} className="cta-button-sm cursor-pointer">
            Testar grátis
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HERO — cinematic, full-viewport
   ══════════════════════════════════════════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Radial spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,_oklch(0.72_0.19_162_/_0.12)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl w-full grid gap-16 lg:grid-cols-[1.2fr_0.8fr] items-center">
        {/* Left — Copy */}
        <div className="max-w-2xl">
          <div className="hero-enter hero-delay-1 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-1.5 text-xs font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Para donos de escolinha de futebol no Brasil
          </div>

          <h1 className="hero-enter hero-delay-2 mt-7 text-[clamp(2.8rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            Chega de cobrar
            <br />
            mensalidade no
            <br />
            <span className="hero-gradient-text">WhatsApp.</span>
          </h1>

          <p className="hero-enter hero-delay-3 mt-7 max-w-md text-lg leading-relaxed text-white/50">
            FutSimples organiza alunos, cobra inadimplentes com PIX e registra presença — tudo no celular, em 10 minutos.
          </p>

          <div className="hero-enter hero-delay-4 mt-9 flex flex-wrap items-center gap-4">
            <Link href={SETUP_URL} className="cta-button-lg group cursor-pointer">
              <span>Testar grátis por 7 dias</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a href="#demo" className="ghost-button cursor-pointer">
              Ver demo ao vivo
            </a>
          </div>

          <div className="hero-enter hero-delay-5 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/35">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500/60" /> Sem cartão</span>
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-emerald-500/60" /> 7 dias grátis</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500/60" /> Cancele quando quiser</span>
          </div>
        </div>

        {/* Right — Floating dashboard card */}
        <div className="hero-enter hero-delay-3 relative hidden lg:block">
          <div className="absolute -inset-20 bg-[radial-gradient(circle,oklch(0.72_0.19_162_/_0.15),transparent_65%)] blur-xl pointer-events-none" />
          <div className="hero-float relative">
            <div className="dashboard-card">
              {/* Mini dashboard header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1">
                  <span className="text-[10px] text-white/30">futsimples.netlify.app/dashboard</span>
                </div>
              </div>
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Alunos", value: "48", color: "from-blue-500/20 to-blue-500/5", text: "text-blue-400" },
                  { label: "Pendentes", value: "7", color: "from-amber-500/20 to-amber-500/5", text: "text-amber-400" },
                  { label: "Receita", value: "R$2.8k", color: "from-emerald-500/20 to-emerald-500/5", text: "text-emerald-400" },
                ].map((kpi) => (
                  <div key={kpi.label} className={`rounded-lg bg-gradient-to-b ${kpi.color} border border-white/5 p-2.5`}>
                    <div className="text-[9px] text-white/40">{kpi.label}</div>
                    <div className={`text-sm font-bold ${kpi.text}`}>{kpi.value}</div>
                  </div>
                ))}
              </div>
              {/* Chart bars */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                <div className="text-[9px] text-white/30 mb-2">Receita · Últimos 6 meses</div>
                <div className="flex items-end gap-1.5 h-16">
                  {[35, 50, 40, 65, 48, 80].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-all duration-500"
                      style={{
                        height: `${h}%`,
                        background: i === 5
                          ? "linear-gradient(to top, #10b981, #34d399)"
                          : "linear-gradient(to top, rgba(16,185,129,0.3), rgba(16,185,129,0.1))",
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Student rows */}
              <div className="mt-3 space-y-1">
                {[
                  { name: "Gabriel S.", status: "Pago", dot: "bg-emerald-400" },
                  { name: "Lucas O.", status: "Pendente", dot: "bg-amber-400" },
                  { name: "Pedro M.", status: "Pago", dot: "bg-emerald-400" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-md bg-white/[0.02] px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">
                        {s.name.charAt(0)}
                      </div>
                      <span className="text-[10px] text-white/60">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      <span className="text-[9px] text-white/40">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating notification card */}
            <div className="notification-float absolute -right-8 top-8">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-[#0c1a14]/90 backdrop-blur-xl px-3.5 py-2.5 shadow-xl shadow-emerald-900/20">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-emerald-300">PIX Recebido</div>
                  <div className="text-[9px] text-white/40">Gabriel Souza · R$60,00</div>
                </div>
              </div>
            </div>

            {/* Floating presença card */}
            <div className="notification-float-2 absolute -left-6 bottom-12">
              <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-[#0c1220]/90 backdrop-blur-xl px-3.5 py-2.5 shadow-xl shadow-blue-900/20">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
                  <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-blue-300">Presença registrada</div>
                  <div className="text-[9px] text-white/40">Sub-11 · 14 de 18 presentes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-enter hero-delay-5">
        <div className="flex flex-col items-center gap-2 text-white/20">
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-white/20 to-transparent scroll-line" />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LOGO TICKER — trust bar
   ══════════════════════════════════════════════════════════════════════════════ */

function LogoTicker() {
  const items = [
    "Escola Gol de Placa", "CT Estrelas", "Arena Kids FC",
    "Escola Bola Cheia", "CT Campeões", "Escolinha Drible",
    "Escola Gol de Placa", "CT Estrelas", "Arena Kids FC",
    "Escola Bola Cheia", "CT Campeões", "Escolinha Drible",
  ];
  return (
    <section className="relative border-y border-white/[0.04] bg-white/[0.01] overflow-hidden py-5">
      <div className="ticker-track">
        {items.map((name, i) => (
          <div key={i} className="flex items-center gap-2 px-8 shrink-0">
            <Trophy className="h-3.5 w-3.5 text-emerald-500/30" />
            <span className="text-xs text-white/20 font-medium whitespace-nowrap">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAIN — dramatic, red-accented
   ══════════════════════════════════════════════════════════════════════════════ */

function PainSection() {
  const { ref, visible } = useInView();
  const items = [
    { dor: "Cobrar atrasados um por um no WhatsApp", custo: "4h/mês", icon: Smartphone },
    { dor: "Não saber quem está inadimplente agora", custo: "Dinheiro sumindo", icon: CreditCard },
    { dor: "Presença no papel ou na memória", custo: "Zero histórico", icon: ClipboardCheck },
    { dor: "Fechar o mês no Excel e os números não batem", custo: "Decisão no chute", icon: BarChart3 },
    { dor: "Pai pergunta a frequência — você não sabe", custo: "Credibilidade", icon: Users },
  ];

  return (
    <section id="problema" className="relative py-32 lg:py-40">
      {/* Red accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(239,68,68,0.06),transparent_70%)] pointer-events-none" />

      <div ref={ref} className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <span className={`section-tag section-tag-red ${visible ? "in-view" : ""}`}>O problema</span>
          <h2 className={`section-title ${visible ? "in-view" : ""}`}>
            Você ainda faz isso <span className="text-red-400">todo mês?</span>
          </h2>
          <p className={`section-subtitle ${visible ? "in-view" : ""}`}>
            Não é falta de esforço — é tentar gerir uma empresa com ferramentas feitas para uso pessoal.
          </p>
        </div>

        <div className="mt-16 space-y-3">
          {items.map((it, i) => (
            <PainCard key={it.dor} item={it} index={i} parentVisible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PainCard({ item, index, parentVisible }: { item: { dor: string; custo: string; icon: typeof Smartphone }; index: number; parentVisible: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  useMouseGlow(cardRef);

  return (
    <div
      ref={cardRef}
      className={`glow-card group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-700 hover:border-red-500/20 hover:bg-red-500/[0.03] cursor-default ${
        parentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${index * 100 + 200}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/10 group-hover:bg-red-500/15 transition-colors duration-300">
          <item.icon className="h-4.5 w-4.5 text-red-400/70" />
        </div>
        <span className="text-[15px] text-white/80">{item.dor}</span>
      </div>
      <span className="shrink-0 rounded-full bg-red-500/10 border border-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-400">
        {item.custo}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BENTO FEATURES — Apple-style grid
   ══════════════════════════════════════════════════════════════════════════════ */

function BentoFeatures() {
  const { ref, visible } = useInView(0.05);

  return (
    <section id="solucao" className="relative py-32 lg:py-40">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,oklch(0.72_0.19_162_/_0.08),transparent_70%)] pointer-events-none" />

      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span className={`section-tag ${visible ? "in-view" : ""}`}>A solução</span>
          <h2 className={`section-title ${visible ? "in-view" : ""}`}>
            Tudo que sua escolinha precisa.
            <br />
            <span className="hero-gradient-text">Nada que não precisa.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="mt-16 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* Large card — Cobrança */}
          <BentoCard
            className="lg:col-span-2 lg:row-span-2"
            index={0}
            parentVisible={visible}
          >
            <div className="flex h-full flex-col justify-between p-8">
              <div>
                <div className="bento-icon-box bg-emerald-500/10 border-emerald-500/10">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-tight lg:text-3xl">
                  Cobrança em lote com PIX
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/40">
                  Todos os inadimplentes numa tela. Cobra todos com PIX em 2 cliques.
                  Chega de mandar mensagem um por um no WhatsApp.
                </p>
              </div>
              <div className="mt-6 relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <Image
                  src="/mockup-cobranca.png"
                  alt="Cobrança em lote via PIX"
                  width={1024}
                  height={1536}
                  className="w-full max-w-[280px] mx-auto drop-shadow-[0_8px_32px_rgba(16,185,129,0.15)]"
                  loading="lazy"
                />
              </div>
            </div>
          </BentoCard>

          {/* Presença */}
          <BentoCard index={1} parentVisible={visible}>
            <div className="p-7">
              <div className="bento-icon-box bg-blue-500/10 border-blue-500/10">
                <ClipboardCheck className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Presença digital</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Portal do responsável. Pai acompanha frequência do filho sem ligar para você.
              </p>
              <div className="mt-5 space-y-1.5">
                {["Sub-9 — 15/18", "Sub-11 — 12/14", "Sub-13 — 16/16"].map((row) => (
                  <div key={row} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-[11px]">
                    <span className="text-white/50">{row.split("—")[0]}</span>
                    <span className="text-blue-400 font-semibold">{row.split("—")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Financeiro */}
          <BentoCard index={2} parentVisible={visible}>
            <div className="p-7">
              <div className="bento-icon-box bg-violet-500/10 border-violet-500/10">
                <Wallet className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Financeiro real</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Receitas e despesas no sistema. Relatório PDF em um clique. Números que batem.
              </p>
              <div className="mt-5 flex items-end gap-1 h-20">
                {[30, 55, 42, 70, 50, 85, 60, 90].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-violet-500/40 to-violet-500/10 transition-all duration-300" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Agenda */}
          <BentoCard index={3} parentVisible={visible}>
            <div className="p-7">
              <div className="bento-icon-box bg-amber-500/10 border-amber-500/10">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Agenda de treinos</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Treinos, jogos e campeonatos organizados. Toda equipe alinhada.
              </p>
            </div>
          </BentoCard>

          {/* Portal do responsável */}
          <BentoCard index={4} parentVisible={visible}>
            <div className="p-7">
              <div className="bento-icon-box bg-cyan-500/10 border-cyan-500/10">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Portal do responsável</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Ficha médica, frequência e pagamentos. Pai acessa pelo celular.
              </p>
            </div>
          </BentoCard>

          {/* Relatórios */}
          <BentoCard index={5} parentVisible={visible}>
            <div className="p-7">
              <div className="bento-icon-box bg-rose-500/10 border-rose-500/10">
                <FileText className="h-5 w-5 text-rose-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Relatórios PDF</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Financeiro mensal pronto para imprimir. Decisão com dados, não com chute.
              </p>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({ children, className = "", index, parentVisible }: {
  children: React.ReactNode; className?: string; index: number; parentVisible: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useMouseGlow(cardRef);

  return (
    <div
      ref={cardRef}
      className={`glow-card group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] transition-all duration-700 hover:border-emerald-500/15 hover:bg-white/[0.03] ${className} ${
        parentVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.97]"
      }`}
      style={{ transitionDelay: `${index * 100 + 200}ms` }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   DEMO — Interactive product screenshots
   ══════════════════════════════════════════════════════════════════════════════ */

function DemoSection() {
  const { ref, visible } = useInView();
  return (
    <section id="demo" className="relative py-32 lg:py-40 border-t border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-6">
        <div ref={ref} className="text-center">
          <span className={`section-tag ${visible ? "in-view" : ""}`}>Demo ao vivo</span>
          <h2 className={`section-title ${visible ? "in-view" : ""}`}>
            Veja a interface <span className="hero-gradient-text">real.</span>
          </h2>
          <p className={`section-subtitle ${visible ? "in-view" : ""}`}>
            Clique nas abas para explorar. Dashboard, alunos, pagamentos — tudo num clique.
          </p>
        </div>
        <div className={`mt-14 transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <ProductScreenshots />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HOW IT WORKS — horizontal steps
   ══════════════════════════════════════════════════════════════════════════════ */

function HowItWorks() {
  const { ref, visible } = useInView();
  const steps = [
    { n: "01", title: "Cria sua conta", desc: "Email e senha. 2 minutos. Sem cartão.", icon: MousePointerClick, color: "emerald" },
    { n: "02", title: "Cadastra os alunos", desc: "Nome, turma, responsável. No seu ritmo.", icon: Users, color: "blue" },
    { n: "03", title: "Usa na beira do campo", desc: "Presença, cobrança, financeiro. No celular.", icon: Smartphone, color: "violet" },
  ];

  const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/10", text: "text-emerald-400", glow: "shadow-emerald-500/10" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/10" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/10", text: "text-violet-400", glow: "shadow-violet-500/10" },
  };

  return (
    <section className="relative py-32 lg:py-40 border-t border-white/[0.04]">
      <div ref={ref} className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span className={`section-tag ${visible ? "in-view" : ""}`}>Como funciona</span>
          <h2 className={`section-title ${visible ? "in-view" : ""}`}>
            Em 10 minutos, <span className="hero-gradient-text">funcionando.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => {
            const c = colors[s.color];
            return (
              <div
                key={s.n}
                className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.015] p-8 transition-all duration-700 hover:border-white/[0.1] hover:bg-white/[0.025] ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150 + 200}ms` }}
              >
                {/* Step number watermark */}
                <div className="absolute top-4 right-5 text-5xl font-black text-white/[0.03] select-none">{s.n}</div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} border ${c.border} shadow-lg ${c.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className={`h-5 w-5 ${c.text}`} />
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/40 leading-relaxed">{s.desc}</p>

                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                )}
              </div>
            );
          })}
        </div>

        <div className={`mt-12 text-center transition-all duration-700 delay-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link href={SETUP_URL} className="cta-button-lg group cursor-pointer">
            <span>Começar agora — é grátis</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   STATS RIBBON
   ══════════════════════════════════════════════════════════════════════════════ */

function StatsRibbon() {
  const { ref, visible } = useInView();
  const v1 = useCountUp(900, 2000, visible);
  const v2 = useCountUp(4, 1500, visible);
  const v3 = useCountUp(10, 1200, visible);

  const stats = [
    { value: `R$${v1}`, label: "perdidos por mês sem controle de inadimplência" },
    { value: `${v2}h`, label: "gastas todo mês cobrando aluno por aluno" },
    { value: `${v3}min`, label: "para configurar o FutSimples e começar a usar" },
  ];

  return (
    <section ref={ref} className="relative border-y border-white/[0.04] bg-white/[0.01] py-16">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <div className="text-4xl font-extrabold tracking-tight hero-gradient-text md:text-5xl">{s.value}</div>
            <p className="mt-2 text-sm text-white/35">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRICING
   ══════════════════════════════════════════════════════════════════════════════ */

function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const { ref, visible } = useInView();
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
    <section id="preco" className="relative py-32 lg:py-40">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,oklch(0.72_0.19_162_/_0.06),transparent_70%)] pointer-events-none" />

      <div ref={ref} className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <span className={`section-tag ${visible ? "in-view" : ""}`}>Preço</span>
          <h2 className={`section-title ${visible ? "in-view" : ""}`}>
            Simples, <span className="hero-gradient-text">como o nome.</span>
          </h2>
          <p className={`section-subtitle ${visible ? "in-view" : ""}`}>
            Menos do que um mês de inadimplência não controlada.
          </p>
        </div>

        {/* Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 cursor-pointer ${
                !annual ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "text-white/40 hover:text-white/60"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 cursor-pointer ${
                annual ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "text-white/40 hover:text-white/60"
              }`}
            >
              Anual <span className="ml-1 text-xs opacity-70">-17%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <PricingCard
            title="Mensal"
            price="R$ 59,90"
            per="/mês"
            note="Cobrado mensalmente."
            features={features}
            highlighted={!annual}
            visible={visible}
            delay={200}
          />
          <PricingCard
            title="Anual"
            price="R$ 49,92"
            per="/mês"
            note="R$ 599/ano · Economize R$ 119,80"
            features={features}
            badge="Melhor valor"
            highlighted={annual}
            visible={visible}
            delay={350}
          />
        </div>

        <p className="mt-8 text-center text-xs text-white/25">
          Stripe · Cartão ou Boleto · Cancele quando quiser
        </p>
      </div>
    </section>
  );
}

function PricingCard({ title, price, per, note, features, highlighted, badge, visible, delay }: {
  title: string; price: string; per: string; note: string;
  features: string[]; highlighted?: boolean; badge?: string;
  visible: boolean; delay: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useMouseGlow(cardRef);

  return (
    <div
      ref={cardRef}
      className={`glow-card relative rounded-2xl border p-8 transition-all duration-700 ${
        highlighted
          ? "border-emerald-500/25 bg-emerald-500/[0.04] shadow-[0_0_80px_oklch(0.72_0.19_162_/_0.12)]"
          : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.1]"
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25">
          {badge}
        </span>
      )}
      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">{title}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        <span className="text-white/40">{per}</span>
      </div>
      <p className="mt-2 text-sm text-white/35">{note}</p>
      <Link
        href={SETUP_URL}
        className={`mt-7 w-full cursor-pointer ${highlighted ? "cta-button-lg" : "ghost-button"} flex items-center justify-center gap-2`}
      >
        Testar 7 dias grátis
        <ArrowRight className="h-4 w-4" />
      </Link>
      <ul className="mt-7 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} />
            <span className="text-white/60">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FAQ — smooth accordion
   ══════════════════════════════════════════════════════════════════════════════ */

function FaqSection() {
  const items = [
    { q: "Preciso de cartão para testar?", a: "Não. Você cria a conta com email e senha e usa 7 dias completos sem informar nenhum cartão." },
    { q: "Quanto tempo leva para configurar?", a: "Em média 10 minutos. Cria a conta, cadastra os alunos e já pode cobrar e marcar presença." },
    { q: "Funciona no celular?", a: "Sim. Foi pensado para ser usado na beira do campo, no celular. Funciona no computador também." },
    { q: "Quantos alunos posso cadastrar?", a: "Ilimitado em qualquer plano. Sem cobrança por aluno." },
    { q: "E se eu não gostar?", a: "Cancela com um clique. Sem ligação, sem explicação, sem multa." },
    { q: "Qual a diferença entre mensal e anual?", a: "Mesmas funcionalidades. O plano anual sai 17% mais barato (cerca de 2 meses grátis)." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  const { ref, visible } = useInView();

  return (
    <section id="faq" className="relative py-32 lg:py-40 border-t border-white/[0.04]">
      <div ref={ref} className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <span className={`section-tag ${visible ? "in-view" : ""}`}>FAQ</span>
          <h2 className={`section-title ${visible ? "in-view" : ""}`}>Dúvidas frequentes</h2>
        </div>
        <div className={`mt-12 space-y-2 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {items.map((it, i) => (
            <FaqItem key={it.q} item={it} isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ item, isOpen, onToggle }: { item: { q: string; a: string }; isOpen: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => { if (bodyRef.current) setH(isOpen ? bodyRef.current.scrollHeight : 0); }, [isOpen]);

  return (
    <div className={`rounded-xl border transition-all duration-300 ${isOpen ? "border-emerald-500/15 bg-emerald-500/[0.03]" : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.1]"}`}>
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-5 text-left cursor-pointer">
        <span className="font-semibold text-[15px]">{item.q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/30 transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-400" : ""}`} />
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-out" style={{ height: h }}>
        <div ref={bodyRef} className="px-5 pb-5 text-sm text-white/45 leading-relaxed">{item.a}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FINAL CTA — cinematic
   ══════════════════════════════════════════════════════════════════════════════ */

function FinalCta() {
  const { ref, visible } = useInView();
  return (
    <section className="relative overflow-hidden py-36 lg:py-44">
      {/* Big glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,oklch(0.72_0.19_162_/_0.1),transparent_70%)] pointer-events-none" />

      <div ref={ref} className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className={`text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          Cada mês que passa,
          <br />
          é <span className="hero-gradient-text">dinheiro parado.</span>
        </h2>
        <p className={`mt-6 text-lg text-white/40 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          7 dias grátis. Sem cartão. Se não resolver — não paga nada.
        </p>
        <div className={`mt-10 transition-all duration-700 delay-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link href={SETUP_URL} className="cta-button-xl group cursor-pointer">
            <span>Começar agora — é grátis</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="border-t border-white/[0.04]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-white/30 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600">
            <Trophy className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-white/70">FutSimples</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/termos" className="hover:text-white/60 transition-colors cursor-pointer">Termos</Link>
          <Link href="/privacidade" className="hover:text-white/60 transition-colors cursor-pointer">Privacidade</Link>
          <a href="#" className="hover:text-white/60 transition-colors cursor-pointer">Contato</a>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   STYLES — all the magic
   ══════════════════════════════════════════════════════════════════════════════ */

function LandingStyles() {
  return (
    <style>{`
      /* ── Smooth scroll ── */
      html { scroll-behavior: smooth; }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* ── Aurora orbs ── */
      .aurora-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(100px);
      }
      .aurora-orb-1 {
        top: -10%; left: 20%;
        width: 600px; height: 400px;
        background: radial-gradient(circle, oklch(0.72 0.19 162 / 0.07), transparent 70%);
        animation: auroraFloat1 25s ease-in-out infinite;
      }
      .aurora-orb-2 {
        top: 30%; right: -5%;
        width: 500px; height: 500px;
        background: radial-gradient(circle, oklch(0.65 0.18 250 / 0.05), transparent 70%);
        animation: auroraFloat2 30s ease-in-out infinite;
      }
      .aurora-orb-3 {
        bottom: 10%; left: 10%;
        width: 400px; height: 300px;
        background: radial-gradient(circle, oklch(0.70 0.15 300 / 0.04), transparent 70%);
        animation: auroraFloat3 20s ease-in-out infinite;
      }
      @keyframes auroraFloat1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(60px, 40px) scale(1.1); }
        66% { transform: translate(-30px, 20px) scale(0.95); }
      }
      @keyframes auroraFloat2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-50px, 30px) scale(1.15); }
      }
      @keyframes auroraFloat3 {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(40px, -20px); }
      }

      /* ── Navbar link ── */
      .nav-link {
        transition: color 0.2s;
        cursor: pointer;
      }
      .nav-link:hover { color: rgba(255,255,255,0.9); }

      /* ── CTA Buttons ── */
      .cta-button-sm {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 20px;
        border-radius: 9999px;
        font-size: 13px; font-weight: 600;
        background: linear-gradient(135deg, #10b981, #34d399);
        color: #fff;
        box-shadow: 0 0 30px oklch(0.72 0.19 162 / 0.3), 0 1px 2px rgba(0,0,0,0.3);
        transition: all 0.2s;
      }
      .cta-button-sm:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 50px oklch(0.72 0.19 162 / 0.45), 0 4px 12px rgba(0,0,0,0.3);
      }

      .cta-button-lg {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 14px 32px;
        border-radius: 9999px;
        font-size: 15px; font-weight: 700;
        background: linear-gradient(135deg, #10b981, #34d399);
        color: #fff;
        box-shadow: 0 0 40px oklch(0.72 0.19 162 / 0.3), 0 2px 4px rgba(0,0,0,0.3);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cta-button-lg:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 0 70px oklch(0.72 0.19 162 / 0.5), 0 8px 24px rgba(0,0,0,0.3);
      }

      .cta-button-xl {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 18px 40px;
        border-radius: 9999px;
        font-size: 17px; font-weight: 800;
        background: linear-gradient(135deg, #10b981, #34d399);
        color: #fff;
        box-shadow: 0 0 60px oklch(0.72 0.19 162 / 0.35), 0 2px 4px rgba(0,0,0,0.3);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cta-button-xl:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 0 100px oklch(0.72 0.19 162 / 0.55), 0 12px 40px rgba(0,0,0,0.4);
      }

      .ghost-button {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 14px 28px;
        border-radius: 9999px;
        font-size: 15px; font-weight: 600;
        border: 1px solid rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.7);
        background: rgba(255,255,255,0.02);
        transition: all 0.2s;
      }
      .ghost-button:hover {
        border-color: rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.05);
        color: #fff;
      }

      /* ── Hero gradient text ── */
      .hero-gradient-text {
        background: linear-gradient(135deg, #10b981 0%, #34d399 30%, #6ee7b7 60%, #34d399 80%, #10b981 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: heroGradientShift 6s ease infinite;
      }
      @keyframes heroGradientShift {
        0%, 100% { background-position: 0% center; }
        50% { background-position: 200% center; }
      }

      /* ── Hero entrance ── */
      .hero-enter {
        opacity: 0;
        transform: translateY(30px);
        animation: heroEnter 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .hero-delay-1 { animation-delay: 0.1s; }
      .hero-delay-2 { animation-delay: 0.25s; }
      .hero-delay-3 { animation-delay: 0.4s; }
      .hero-delay-4 { animation-delay: 0.55s; }
      .hero-delay-5 { animation-delay: 0.7s; }
      @keyframes heroEnter {
        to { opacity: 1; transform: translateY(0); }
      }

      /* ── Hero float ── */
      .hero-float {
        animation: heroFloat 8s ease-in-out infinite;
      }
      @keyframes heroFloat {
        0%, 100% { transform: translateY(0) rotate(0.5deg); }
        50% { transform: translateY(-16px) rotate(-0.5deg); }
      }

      /* ── Dashboard card ── */
      .dashboard-card {
        background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        padding: 16px;
        backdrop-filter: blur(20px);
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.04),
          0 20px 60px rgba(0,0,0,0.5),
          0 0 100px oklch(0.72 0.19 162 / 0.08);
      }

      /* ── Notification floats ── */
      .notification-float {
        animation: notifFloat 5s ease-in-out infinite;
      }
      .notification-float-2 {
        animation: notifFloat2 6s ease-in-out infinite;
      }
      @keyframes notifFloat {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-8px) translateX(4px); }
      }
      @keyframes notifFloat2 {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(6px) translateX(-6px); }
      }

      /* ── Scroll indicator ── */
      .scroll-line {
        animation: scrollPulse 2s ease-in-out infinite;
      }
      @keyframes scrollPulse {
        0%, 100% { opacity: 0.3; transform: scaleY(1); }
        50% { opacity: 0.8; transform: scaleY(1.3); }
      }

      /* ── Logo ticker ── */
      .ticker-track {
        display: flex;
        animation: ticker 30s linear infinite;
        width: max-content;
      }
      @keyframes ticker {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      /* ── Section tags & titles ── */
      .section-tag {
        display: inline-block;
        font-size: 12px; font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #10b981;
        opacity: 0; transform: translateY(12px);
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .section-tag-red { color: #f87171; }
      .section-tag.in-view { opacity: 1; transform: translateY(0); }

      .section-title {
        margin-top: 16px;
        font-size: clamp(2rem, 4vw, 3.2rem);
        font-weight: 800;
        letter-spacing: -0.025em;
        line-height: 1.1;
        opacity: 0; transform: translateY(16px);
        transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
      }
      .section-title.in-view { opacity: 1; transform: translateY(0); }

      .section-subtitle {
        margin-top: 16px;
        color: rgba(255,255,255,0.4);
        max-width: 480px;
        margin-left: auto; margin-right: auto;
        opacity: 0; transform: translateY(12px);
        transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
      }
      .section-subtitle.in-view { opacity: 1; transform: translateY(0); }

      /* ── Glow card (mouse-tracking highlight) ── */
      .glow-card {
        position: relative;
        overflow: hidden;
      }
      .glow-card::before {
        content: '';
        position: absolute;
        top: var(--my, -100px);
        left: var(--mx, -100px);
        width: 300px; height: 300px;
        background: radial-gradient(circle, oklch(0.72 0.19 162 / 0.06), transparent 70%);
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 0;
      }
      .glow-card:hover::before { opacity: 1; }
      .glow-card > * { position: relative; z-index: 1; }

      /* ── Bento icon box ── */
      .bento-icon-box {
        display: flex;
        width: 44px; height: 44px;
        align-items: center; justify-content: center;
        border-radius: 12px;
        border: 1px solid;
      }
    `}</style>
  );
}
