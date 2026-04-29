"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Users, CreditCard, CalendarCheck, Receipt,
  CheckCircle2, ArrowRight, Loader2, Star, X,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const PAINS = [
  { label: "Cobrar atrasados um por um no WhatsApp",          cost: "4h/mês" },
  { label: "Não saber quem está inadimplente agora",          cost: "Dinheiro sumindo" },
  { label: "Presença no papel ou na memória",                 cost: "Zero histórico" },
  { label: "Fechar o mês no Excel e os números não batem",    cost: "Decisão no chute" },
  { label: "Pai pergunta a frequência — você não sabe",       cost: "Credibilidade" },
];

const FEATURES = [
  {
    icon: CreditCard,
    accent: "#10b981",
    label: "Cobrança em lote",
    before: "Você manda mensagem no WhatsApp um por um. Todo mês. Do zero.",
    after:  "Todos os atrasados numa tela. PIX para todos em 2 cliques.",
  },
  {
    icon: Users,
    accent: "#3b82f6",
    label: "Gestão de alunos",
    before: "Alunos no caderno, no celular pessoal e na cabeça.",
    after:  "Cadastro completo: nome, turma, responsável, ficha médica.",
  },
  {
    icon: CalendarCheck,
    accent: "#8b5cf6",
    label: "Presença digital",
    before: "Papel. Pai liga perguntando se o filho foi ao treino.",
    after:  "Portal do responsável. Pai acompanha — sem ligar para você.",
  },
  {
    icon: Receipt,
    accent: "#f43f5e",
    label: "Financeiro real",
    before: "Você tenta fechar as contas no fim do mês e os números não batem.",
    after:  "Receitas e despesas no sistema. PDF em um clique.",
  },
];

const STEPS = [
  { n: "01", title: "Cria sua conta", desc: "Email e senha. 2 minutos. Sem cartão." },
  { n: "02", title: "Cadastra os alunos", desc: "Nome, turma, responsável. No seu ritmo." },
  { n: "03", title: "Usa na beira do campo", desc: "Presença, cobrança, financeiro. No celular." },
];

const FOR_YOU = [
  "Tem escolinha com 10+ alunos",
  "Cobra mensalidade todo mês",
  "Quer saber quem está em atraso sem calcular",
  "Quer parar de usar planilha para tudo",
  "Quer registrar presença rápido",
  "Quer relatório real no fim do mês",
];

const NOT_FOR_YOU = [
  "Você quer um sistema de ERP empresarial",
  "Você não cobra mensalidade",
  "Você prefere planilha e está satisfeito",
];

const FEATURES_LIST = [
  "Alunos ilimitados",
  "Cobrança em lote com PIX",
  "Portal do responsável",
  "Presença digital",
  "Agenda de treinos",
  "Relatório financeiro PDF",
  "Convite de professores",
];

const FAQS = [
  { q: "Preciso de cartão para testar?",             a: "Não. 7 dias grátis sem nenhum dado de pagamento. Só pede cartão se você decidir continuar." },
  { q: "Quanto tempo leva para configurar?",         a: "10 minutos. Cria a conta, cadastra os alunos, já começa a usar. Sem treinamento." },
  { q: "Funciona no celular?",                       a: "Foi feito para isso. Abre no navegador, sem instalar nada. Funciona na beira do campo." },
  { q: "Quantos alunos posso cadastrar?",            a: "Ilimitados. 15 ou 400 alunos — o preço é o mesmo." },
  { q: "E se eu não gostar?",                        a: "Cancela nos 7 dias e não paga nada. Sem cobrança, sem multa, sem precisar explicar." },
  { q: "Qual a diferença entre mensal e anual?",     a: "No anual você paga R$599/ano — R$49,92/mês — e economiza R$119,80." },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [plan, setPlan]         = useState<"monthly" | "annual">("annual");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (firebaseUser) router.replace("/dashboard");
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050505" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.15)" }} />
      </div>
    );
  }
  if (firebaseUser) return null;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#050505", color: "#fff" }}>

      {/* ────────────────────────────────────────────────────────────────
          NAVBAR — Ultra-minimal. 64px. Glassmorphism on scroll.
          Layout: flex row, logo left · nav right.
          Components: text logo, ghost link, solid CTA button.
          Typography: 13px / font-bold.
      ──────────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled ? {
          background: "rgba(5,5,5,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        } : undefined}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 64 }}>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 28, height: 28, background: "#10b981" }}
            >
              <Trophy style={{ width: 14, height: 14, color: "#fff" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "-0.02em" }}>FutSimples</span>
          </div>

          {/* Nav */}
          <div className="flex items-center" style={{ gap: 4 }}>
            <Link
              href="/login"
              className="transition-colors"
              style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.35)", borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              Entrar
            </Link>
            <Link
              href="/setup"
              className="transition-all"
              style={{
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                background: "#10b981",
                borderRadius: 10,
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#059669")}
              onMouseLeave={e => (e.currentTarget.style.background = "#10b981")}
            >
              Testar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────
          HERO — Full viewport height. Center-aligned. Typography-first.
          Layout: 1 coluna centralizada. Max-width 780px.
          Components: eyebrow pill, headline H1 gigante, subheadline,
                      CTA primário, trust signals inline.
          Typography: h1 = 88px / black / tracking -0.04em / leading 0.92.
          Cores: bg puro #050505, acento emerald, resto white variants.
          Spacing: pt-[100px] para navbar + pt-20 extra. Muito ar.
          Interação: CTA hover → translateY(-2px) + shadow intensifica.
          Ambient glow: único, central, opacidade 3%.
      ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "100svh", paddingTop: 100, paddingBottom: 120 }}
      >
        {/* Ambient glow — single, subtle */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-10"
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
            Para donos de escolinha de futebol no Brasil
          </div>

          {/* H1 — The star of the show */}
          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 88px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              marginBottom: 32,
              color: "#fff",
            }}
          >
            Chega de cobrar<br />
            mensalidade no{" "}
            <span style={{ color: "#10b981" }}>WhatsApp.</span>
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.6,
              maxWidth: 520,
              margin: "0 auto 48px",
            }}
          >
            FutSimples organiza alunos, cobra inadimplentes com PIX
            e registra presença. Tudo no celular. Em 10 minutos.
          </p>

          {/* CTA */}
          <div style={{ marginBottom: 48 }}>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 group transition-all duration-200"
              style={{
                padding: "16px 36px",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                background: "#10b981",
                borderRadius: 14,
                letterSpacing: "-0.02em",
                boxShadow: "0 0 0 0 rgba(16,185,129,0.4)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(16,185,129,0.3)";
                e.currentTarget.style.background = "#059669";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 0 0 rgba(16,185,129,0.4)";
                e.currentTarget.style.background = "#10b981";
              }}
            >
              Testar grátis por 7 dias
              <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
          </div>

          {/* Trust signals */}
          <div
            className="flex flex-wrap items-center justify-center"
            style={{ gap: "8px 24px" }}
          >
            {["Sem cartão de crédito", "7 dias grátis", "Cancela sem explicação"].map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5"
                style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", fontWeight: 500 }}
              >
                <CheckCircle2 style={{ width: 12, height: 12, color: "rgba(16,185,129,0.4)" }} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-10 left-1/2"
          style={{ transform: "translateX(-50%)", opacity: 0.15 }}
        >
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))" }} />
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          NÚMEROS — O custo do caos. 3 stats brutais.
          Layout: 3 colunas separadas por dividers. Bento grid flush.
          Components: stat gigante (80px bold), label, descrição pequena.
          Cores: amber / rose / violet para cada stat.
          Spacing: 64px interno por célula.
          Interação: hover → célula levanta 4px com shadow suave.
      ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingTop: 64, paddingBottom: 128 }}>
        <p
          className="text-center"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.18)",
            marginBottom: 64,
          }}
        >
          O que custa não ter controle
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {[
            { value: "R$900", suffix: "/mês", label: "em inadimplência perdida", sub: "Uma escola de R$3k/mês perde até 30% sem perceber.", color: "#f59e0b" },
            { value: "4h",    suffix: "",      label: "de cobranças manuais",     sub: "Mandando mensagem no WhatsApp um por um. Todo mês.",           color: "#f43f5e" },
            { value: "0",     suffix: "",      label: "relatórios reais",         sub: "Sem dados, você decide no feeling. E o buraco cresce.",         color: "#a78bfa" },
          ].map((stat, i) => (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                background: "#050505",
                padding: "52px 48px",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                cursor: "default",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.015)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = "#050505";
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 12 }}>
                <span style={{ fontSize: "clamp(52px,6vw,72px)", fontWeight: 900, letterSpacing: "-0.04em", color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span style={{ fontSize: 20, fontWeight: 700, color: stat.color, opacity: 0.6 }}>{stat.suffix}</span>
                )}
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 10 }}>{stat.label}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", lineHeight: 1.6 }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          PROBLEMA — Recognition. Se identifica, fica.
          Layout: 2 colunas (40/60). Título sticky esquerda.
                  Lista de dores rolável à direita.
          Components: rows com checkbox amber, texto, cost badge.
          Typography: título 48px black. Rows 14px medium.
          Spacing: seção py-20. Rows: p-5. Gap entre rows: 8px.
          Interação: row hover → bg levemente mais claro + text mais opaco.
      ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingBottom: 128 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: 80,
            alignItems: "start",
          }}
        >
          {/* Left — sticky title */}
          <div style={{ position: "sticky", top: 96 }}>
            <p
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.18)",
                marginBottom: 24,
              }}
            >
              O problema
            </p>
            <h2
              style={{
                fontSize: "clamp(32px,4vw,48px)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                color: "#fff",
                marginBottom: 20,
              }}
            >
              Você ainda faz isso todo mês?
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.28)", lineHeight: 1.7 }}>
              Não é falta de esforço — é tentar gerir uma empresa com ferramentas feitas para uso pessoal.
            </p>
          </div>

          {/* Right — pain rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PAINS.map((item, i) => (
              <div
                key={i}
                className="transition-all duration-150"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "18px 22px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: "1px solid rgba(245,158,11,0.3)",
                      background: "rgba(245,158,11,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <CheckCircle2 style={{ width: 11, height: 11, color: "#f59e0b" }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700, color: "rgba(245,158,11,0.55)",
                    whiteSpace: "nowrap", flexShrink: 0,
                    display: "none",
                  }}
                  className="sm:block"
                >
                  {item.cost}
                </span>
              </div>
            ))}

            <p
              style={{
                fontSize: 12, color: "rgba(255,255,255,0.18)",
                fontStyle: "italic", paddingTop: 8, paddingLeft: 4,
              }}
            >
              Planilha e WhatsApp não foram feitos para gerir uma empresa.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          SOLUÇÃO — Antes × Depois em tabela 3 colunas.
          Layout: cada feature = 1 row dividido em 3 colunas:
                  [Feature] [Hoje] [Com FutSimples]
          Components: ícone colorido + label | texto fraco | texto forte.
          Typography: label 11px uppercase. Textos 13px.
          Cores: coluna Hoje bg rose/[0.03]. Coluna FutSimples bg emerald/[0.04].
          Spacing: seção py-32. Célula p-6.
          Interação: row hover → borda ligeiramente mais visível.
          Header fixo com labels das colunas.
      ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingBottom: 128 }}>
        <div className="text-center" style={{ marginBottom: 80 }}>
          <p
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.18)",
              marginBottom: 24,
            }}
          >
            A solução
          </p>
          <h2
            style={{
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: 900, letterSpacing: "-0.03em",
              color: "#fff", marginBottom: 16,
            }}
          >
            Isso muda em 10 minutos.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.28)", maxWidth: 400, margin: "0 auto" }}>
            Cada função existe para eliminar algo que drena tempo ou dinheiro hoje.
          </p>
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            marginBottom: 6,
            padding: "0 0 12px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)" }}>
            Funcionalidade
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(244,63,94,0.4)", paddingLeft: 24 }}>
            Hoje
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(16,185,129,0.6)", paddingLeft: 24 }}>
            Com FutSimples
          </p>
        </div>

        {/* Feature rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="transition-all duration-150"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)")}
            >
              {/* Col 1 — Feature */}
              <div
                style={{
                  padding: "24px 24px",
                  background: "rgba(255,255,255,0.02)",
                  borderRight: "1px solid rgba(255,255,255,0.04)",
                  display: "flex", flexDirection: "column", gap: 10, justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: f.accent + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <f.icon style={{ width: 17, height: 17, color: f.accent }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{f.label}</p>
              </div>

              {/* Col 2 — Before */}
              <div
                style={{
                  padding: "24px 24px",
                  background: "rgba(244,63,94,0.025)",
                  borderRight: "1px solid rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center",
                }}
              >
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", lineHeight: 1.6 }}>{f.before}</p>
              </div>

              {/* Col 3 — After */}
              <div
                style={{
                  padding: "24px 24px",
                  background: "rgba(16,185,129,0.03)",
                  display: "flex", alignItems: "center",
                }}
              >
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>{f.after}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          COMO FUNCIONA — 3 passos editoriais.
          Layout: 3 colunas com linha conectora horizontal (desktop).
          Components: círculo com número grande faded, título, desc.
          Typography: número 12px uppercase. título 16px bold. desc 13px.
          Cores: números em white/10. Linha conectora white/[0.04].
          Spacing: seção py-24. Cards p-8. Gap 32px.
          Interação: hover no card → número fica emerald.
          CTA secundário abaixo.
      ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingBottom: 128 }}>
        <div className="text-center" style={{ marginBottom: 80 }}>
          <p
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.18)",
              marginBottom: 24,
            }}
          >
            Como funciona
          </p>
          <h2
            style={{
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: 900, letterSpacing: "-0.03em", color: "#fff",
            }}
          >
            Em 10 minutos, funcionando.
          </h2>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            position: "relative",
          }}
        >
          {/* Connector line */}
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              top: 28,
              left: "calc(16.67% + 4px)",
              right: "calc(16.67% + 4px)",
              height: 1,
              background: "rgba(255,255,255,0.05)",
              pointerEvents: "none",
            }}
          />

          {STEPS.map((s, i) => (
            <div
              key={i}
              className="group transition-all duration-200"
              style={{
                padding: "32px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.02)",
                cursor: "default",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.035)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
              }}
            >
              {/* Step circle */}
              <div
                style={{
                  width: 48, height: 48,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 24,
                  transition: "all 0.2s",
                }}
              >
                <span
                  style={{
                    fontSize: 11, fontWeight: 900, letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  {s.n}
                </span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA under steps */}
        <div className="text-center" style={{ marginTop: 56 }}>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 transition-all duration-200"
            style={{
              padding: "14px 32px",
              fontSize: 14,
              fontWeight: 700,
              color: "#000",
              background: "#fff",
              borderRadius: 12,
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#fff";
            }}
          >
            Começar agora — é grátis
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          PARA QUEM — Qualificação. 2 colunas.
          Layout: grid 2 colunas. Coluna esquerda: verde. Direita: neutra.
          Components: list items com ícones. Divider interno na direita.
          Typography: label uppercase 10px. Items 13px.
          Cores: left border emerald/20 bg emerald/[0.04].
                 right border white/[0.05] bg white/[0.02].
          Spacing: seção py-24. Cards p-8.
      ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6" style={{ paddingBottom: 128 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Is for you */}
          <div
            style={{
              padding: 40,
              borderRadius: 20,
              border: "1px solid rgba(16,185,129,0.18)",
              background: "rgba(16,185,129,0.04)",
            }}
          >
            <p
              style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "#10b981",
                marginBottom: 28,
              }}
            >
              É pra você se...
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {FOR_YOU.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <CheckCircle2 style={{ width: 15, height: 15, color: "#10b981", flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not for you */}
          <div
            style={{
              padding: 40,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <p
              style={{
                fontSize: 10, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
                marginBottom: 28,
              }}
            >
              Não é pra você se...
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              {NOT_FOR_YOU.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <X style={{ width: 15, height: 15, color: "rgba(255,255,255,0.15)", flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.22)", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
            <div
              style={{
                paddingTop: 24,
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", lineHeight: 1.7 }}>
                FutSimples resolve o que mais dói para dono de escolinha. Não resolvemos tudo — de propósito.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          PREÇO — Clareza total. Sem fricção.
          Layout: toggle centrado + 2 cards lado a lado. max-w-2xl.
          Components: toggle pill (mensal/anual), 2 cards, feature list.
          Typography: preço 56px black. Label 12px. Features 13px.
          Cores: card ativo → border emerald/30 bg emerald/[0.05].
          Spacing: seção py-32. Cards p-8.
          Interação: toggle switch smooth. Botão CTA hover → translateY.
      ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6" id="planos" style={{ paddingBottom: 128 }}>
        <div className="text-center" style={{ marginBottom: 64 }}>
          <p
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.18)",
              marginBottom: 24,
            }}
          >
            Preço
          </p>
          <h2
            style={{
              fontSize: "clamp(32px,4vw,52px)",
              fontWeight: 900, letterSpacing: "-0.03em",
              color: "#fff", marginBottom: 16,
            }}
          >
            Quanto custa?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.28)" }}>
            Menos do que um mês de inadimplência não controlada.
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              padding: 4,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.03)",
              gap: 2,
            }}
          >
            {(["monthly", "annual"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className="transition-all duration-200"
                style={{
                  padding: "8px 24px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: plan === p ? "#fff" : "transparent",
                  color: plan === p ? "#000" : "rgba(255,255,255,0.3)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {p === "monthly" ? "Mensal" : "Anual"}
                {p === "annual" && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      padding: "2px 6px",
                      borderRadius: 999,
                      background: plan === "annual" ? "#10b981" : "rgba(16,185,129,0.2)",
                      color: plan === "annual" ? "#fff" : "#10b981",
                      letterSpacing: "0.03em",
                    }}
                  >
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          {/* Mensal */}
          <div
            className="transition-all duration-300"
            style={{
              padding: 36,
              borderRadius: 20,
              border: plan === "monthly" ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.05)",
              background: plan === "monthly" ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>Mensal</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: "clamp(40px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>R$59</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>,90</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>/mês</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>Cobrado mensalmente.</p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {FEATURES_LIST.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "rgba(16,185,129,0.5)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/setup"
              className="block text-center transition-all duration-200"
              style={{
                padding: "12px",
                borderRadius: 12,
                border: "1px solid rgba(16,185,129,0.35)",
                color: "#10b981",
                fontSize: 13,
                fontWeight: 700,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,185,129,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Testar 7 dias grátis
            </Link>
          </div>

          {/* Anual */}
          <div
            className="transition-all duration-300"
            style={{
              padding: 36,
              borderRadius: 20,
              border: plan === "annual" ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.05)",
              background: plan === "annual" ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
              position: "relative",
            }}
          >
            {/* Badge */}
            <div style={{ position: "absolute", top: -12, left: 28 }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#10b981",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                }}
              >
                <Star style={{ width: 9, height: 9 }} /> Melhor valor
              </span>
            </div>

            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>Anual</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: "clamp(40px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>R$599</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>/ano</span>
            </div>
            <p style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginBottom: 28 }}>
              R$49,92/mês · Economize R$119,80
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {FEATURES_LIST.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: "rgba(16,185,129,0.5)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/setup"
              className="block text-center transition-all duration-200"
              style={{
                padding: "12px",
                borderRadius: 12,
                background: "#10b981",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#059669";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#10b981";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Testar 7 dias grátis →
            </Link>
          </div>
        </div>

        <p
          className="text-center"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", marginTop: 24 }}
        >
          Stripe · Cartão ou Boleto · Cancele quando quiser
        </p>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          FAQ — Accordion limpo. Max-w-2xl centralizado.
          Layout: coluna única. max-w-2xl.
          Components: accordion rows. ChevronDown/Up.
          Typography: pergunta 14px medium. Resposta 13px/40%.
          Cores: row border white/[0.05]. Hover bg white/[0.02].
          Spacing: seção py-24. Row px-6 py-4.
          Interação: open/close suave com animação de altura.
      ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6" style={{ paddingBottom: 128 }}>
        <div className="text-center" style={{ marginBottom: 64 }}>
          <p
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.18)",
              marginBottom: 24,
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontSize: "clamp(28px,3.5vw,44px)",
              fontWeight: 900, letterSpacing: "-0.03em", color: "#fff",
            }}
          >
            Dúvidas frequentes
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}
            >
              <button
                className="w-full transition-colors duration-150"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 24,
                  padding: "18px 22px",
                  textAlign: "left",
                  background: openFaq === i ? "rgba(255,255,255,0.03)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                onMouseEnter={e => { if (openFaq !== i) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={e => { if (openFaq !== i) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp style={{ width: 16, height: 16, color: "#10b981", flexShrink: 0 }} />
                  : <ChevronDown style={{ width: 16, height: 16, color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                }
              </button>
              {openFaq === i && (
                <div
                  style={{
                    padding: "0 22px 20px",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.7, paddingTop: 16 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          CTA FINAL — Full bleed. Apple-style. Uma mensagem. Um botão.
          Layout: coluna centralizada. max-w-3xl.
          Typography: headline 80px / black / -0.04em. Brutalmente grande.
          Cores: headline split — branco / branco/20 na segunda linha.
          Spacing: seção py-48. Muito ar.
          Interação: botão primary com hover lift forte.
      ──────────────────────────────────────────────────────────────── */}
      <section
        style={{ paddingTop: 120, paddingBottom: 160, paddingLeft: 24, paddingRight: 24 }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(40px,7vw,80px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              color: "#fff",
              marginBottom: 32,
            }}
          >
            Cada mês que passa,<br />
            <span style={{ color: "rgba(255,255,255,0.18)" }}>é dinheiro parado.</span>
          </h2>

          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              color: "rgba(255,255,255,0.28)",
              marginBottom: 56,
              maxWidth: 360,
              margin: "0 auto 56px",
            }}
          >
            7 dias grátis. Sem cartão. Se não resolver — não paga nada.
          </p>

          <Link
            href="/setup"
            className="inline-flex items-center gap-2 transition-all duration-200"
            style={{
              padding: "18px 44px",
              fontSize: 17,
              fontWeight: 700,
              color: "#fff",
              background: "#10b981",
              borderRadius: 16,
              letterSpacing: "-0.02em",
              boxShadow: "0 0 0 0 rgba(16,185,129,0)",
              display: "inline-flex",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(16,185,129,0.35)";
              e.currentTarget.style.background = "#059669";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 0 0 0 rgba(16,185,129,0)";
              e.currentTarget.style.background = "#10b981";
            }}
          >
            Começar agora — é grátis
            <ArrowRight style={{ width: 20, height: 20 }} />
          </Link>

          {/* Micro trust */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
              flexWrap: "wrap",
              marginTop: 32,
            }}
          >
            {["Sem cartão", "7 dias grátis", "Cancela sem explicação"].map((item) => (
              <span
                key={item}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12, color: "rgba(255,255,255,0.14)", fontWeight: 500,
                }}
              >
                <CheckCircle2 style={{ width: 12, height: 12, color: "rgba(16,185,129,0.3)" }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: 40,
          paddingBottom: 40,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div
          className="max-w-6xl mx-auto"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 24, height: 24, borderRadius: 8,
                background: "#10b981",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Trophy style={{ width: 12, height: 12, color: "#fff" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 900 }}>FutSimples</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.12)" }}>· Gestão para escolinhas de futebol</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {[
              { href: "/privacidade", label: "Privacidade" },
              { href: "/termos",      label: "Termos" },
              { href: "/login",       label: "Entrar" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <p
          className="text-center"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.08)", marginTop: 24 }}
        >
          © {new Date().getFullYear()} FutSimples. Sistema de gestão para escolinhas de futebol no Brasil.
        </p>
      </footer>

      {/* SEO */}
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
              { "@type": "Offer", "price": "59.90", "priceCurrency": "BRL" },
              { "@type": "Offer", "price": "599.00", "priceCurrency": "BRL" },
            ],
            "url": "https://futsimples.netlify.app",
            "inLanguage": "pt-BR",
          }),
        }}
      />
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .problem-grid { grid-template-columns: 1fr !important; }
          .feature-table-row { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .qual-grid { grid-template-columns: 1fr !important; }
          .price-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
