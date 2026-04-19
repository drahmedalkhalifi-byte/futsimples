"use client";

import { useState } from "react";

type ScreenKey = "dashboard" | "alunos" | "pagamentos";

const screens: { key: ScreenKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "alunos", label: "Alunos" },
  { key: "pagamentos", label: "Pagamentos" },
];

function DashboardScreen() {
  return (
    <svg viewBox="0 0 480 300" className="w-full" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Background */}
      <rect width="480" height="300" fill="#0f1117" rx="8" />
      {/* Sidebar */}
      <rect x="0" y="0" width="60" height="300" fill="#161920" rx="0" />
      <circle cx="30" cy="22" r="10" fill="#10b981" opacity="0.8" />
      {["Dashboard","Alunos","Pagamentos","Presença","Agenda","Relatório"].map((item, i) => (
        <g key={item}>
          <rect x="8" y={48 + i * 34} width="44" height="26" rx="6"
            fill={i === 0 ? "#10b98122" : "transparent"} />
          <rect x="18" y={56 + i * 34} width="24" height="3" rx="1.5"
            fill={i === 0 ? "#10b981" : "#ffffff33"} />
          <rect x="18" y={61 + i * 34} width="16" height="2" rx="1"
            fill={i === 0 ? "#10b98166" : "#ffffff1a"} />
        </g>
      ))}
      {/* Main content */}
      {/* Header */}
      <text x="76" y="22" fill="#fff" fontSize="10" fontWeight="700">Dashboard</text>
      <text x="76" y="34" fill="#ffffff55" fontSize="7">Visão geral da escola</text>
      {/* KPI cards */}
      {[
        { label: "Alunos Ativos", value: "48", color: "#3b82f6" },
        { label: "Pgtos. Pendentes", value: "7", color: "#f59e0b" },
        { label: "Receita do Mês", value: "R$2.880", color: "#10b981" },
        { label: "Resultado", value: "+R$1.240", color: "#8b5cf6" },
      ].map((card, i) => (
        <g key={card.label}>
          <rect x={72 + i * 101} y="44" width="96" height="44" rx="8"
            fill={card.color + "15"} stroke={card.color + "30"} strokeWidth="0.5" />
          <text x={80 + i * 101} y="59" fill={card.color} fontSize="6.5" fontWeight="600">{card.label}</text>
          <text x={80 + i * 101} y="76" fill={card.color} fontSize="13" fontWeight="800">{card.value}</text>
        </g>
      ))}
      {/* Charts */}
      <rect x="72" y="98" width="196" height="110" rx="8" fill="#ffffff08" stroke="#ffffff10" strokeWidth="0.5" />
      <text x="84" y="113" fill="#fff" fontSize="7" fontWeight="600">Receita dos Últimos 6 Meses</text>
      {/* Bar chart */}
      {[40, 60, 45, 75, 55, 90].map((h, i) => (
        <g key={i}>
          <rect x={88 + i * 28} y={185 - h} width="18" height={h} rx="3"
            fill={i === 5 ? "#10b981" : "#10b98144"} />
          <text x={97 + i * 28} y="200" fill="#ffffff44" fontSize="5.5" textAnchor="middle">
            {["Out","Nov","Dez","Jan","Fev","Mar"][i]}
          </text>
        </g>
      ))}
      {/* Donut chart */}
      <rect x="276" y="98" width="132" height="110" rx="8" fill="#ffffff08" stroke="#ffffff10" strokeWidth="0.5" />
      <text x="286" y="113" fill="#fff" fontSize="7" fontWeight="600">Por Categoria</text>
      <circle cx="342" cy="160" r="28" fill="none" stroke="#3b82f6" strokeWidth="8"
        strokeDasharray="52 100" strokeDashoffset="-10" strokeLinecap="round" />
      <circle cx="342" cy="160" r="28" fill="none" stroke="#10b981" strokeWidth="8"
        strokeDasharray="30 100" strokeDashoffset="-62" strokeLinecap="round" />
      <circle cx="342" cy="160" r="28" fill="none" stroke="#f59e0b" strokeWidth="8"
        strokeDasharray="18 100" strokeDashoffset="-92" strokeLinecap="round" />
      <text x="342" y="163" fill="#fff" fontSize="8" fontWeight="700" textAnchor="middle">48</text>
      <text x="342" y="172" fill="#ffffff55" fontSize="5.5" textAnchor="middle">alunos</text>
      {[
        { color: "#3b82f6", label: "Sub-9" },
        { color: "#10b981", label: "Sub-11" },
        { color: "#f59e0b", label: "Sub-13" },
      ].map((item, i) => (
        <g key={item.label}>
          <circle cx="282" cy={155 + i * 12} r="3" fill={item.color} />
          <text x="288" y={158 + i * 12} fill="#ffffff77" fontSize="6">{item.label}</text>
        </g>
      ))}
      {/* Bottom financial bar */}
      <rect x="72" y="218" width="336" height="52" rx="8" fill="#ffffff08" stroke="#ffffff10" strokeWidth="0.5" />
      <text x="84" y="232" fill="#fff" fontSize="7" fontWeight="600">Resumo Financeiro do Mês</text>
      <text x="84" y="246" fill="#ffffff55" fontSize="6">Receita recebida</text>
      <rect x="84" y="249" width="90" height="4" rx="2" fill="#ffffff15" />
      <rect x="84" y="249" width="70" height="4" rx="2" fill="#10b981" />
      <text x="196" y="246" fill="#ffffff55" fontSize="6">Despesas</text>
      <rect x="196" y="249" width="90" height="4" rx="2" fill="#ffffff15" />
      <rect x="196" y="249" width="40" height="4" rx="2" fill="#ef4444" />
      <text x="316" y="243" fill="#ffffff77" fontSize="6">Resultado</text>
      <text x="316" y="258" fill="#10b981" fontSize="10" fontWeight="800">+R$1.240</text>
    </svg>
  );
}

function AlunosScreen() {
  return (
    <svg viewBox="0 0 480 300" className="w-full" style={{ fontFamily: "Inter, sans-serif" }}>
      <rect width="480" height="300" fill="#0f1117" rx="8" />
      <rect x="0" y="0" width="60" height="300" fill="#161920" />
      <circle cx="30" cy="22" r="10" fill="#10b981" opacity="0.8" />
      {["Dashboard","Alunos","Pagamentos","Presença","Agenda","Relatório"].map((item, i) => (
        <g key={item}>
          <rect x="8" y={48 + i * 34} width="44" height="26" rx="6"
            fill={i === 1 ? "#10b98122" : "transparent"} />
          <rect x="18" y={56 + i * 34} width="24" height="3" rx="1.5"
            fill={i === 1 ? "#10b981" : "#ffffff33"} />
          <rect x="18" y={61 + i * 34} width="16" height="2" rx="1"
            fill={i === 1 ? "#10b98166" : "#ffffff1a"} />
        </g>
      ))}
      <text x="76" y="22" fill="#fff" fontSize="10" fontWeight="700">Alunos</text>
      <text x="76" y="34" fill="#ffffff55" fontSize="7">48 alunos ativos</text>
      {/* Search + button row */}
      <rect x="72" y="42" width="220" height="20" rx="6" fill="#ffffff0a" stroke="#ffffff18" strokeWidth="0.5" />
      <text x="84" y="55" fill="#ffffff44" fontSize="7">Buscar aluno...</text>
      <rect x="388" y="42" width="72" height="20" rx="6" fill="#10b981" />
      <text x="424" y="55" fill="#fff" fontSize="7" fontWeight="600" textAnchor="middle">+ Novo Aluno</text>
      {/* Filter tabs */}
      {["Todos (48)","Sub-9 (15)","Sub-11 (18)","Sub-13 (15)"].map((tab, i) => (
        <g key={tab}>
          <rect x={72 + i * 78} y="68" width={tab.length * 4 + 12} height="16" rx="6"
            fill={i === 0 ? "#10b981" : "#ffffff0a"} stroke={i === 0 ? "#10b981" : "#ffffff18"} strokeWidth="0.5" />
          <text x={72 + i * 78 + (tab.length * 4 + 12) / 2} y="79"
            fill={i === 0 ? "#fff" : "#ffffff66"} fontSize="6.5" textAnchor="middle">{tab}</text>
        </g>
      ))}
      {/* Student rows */}
      {[
        { name: "Gabriel Souza", cat: "Sub-9", status: "pago", statusColor: "#10b981" },
        { name: "Lucas Oliveira", cat: "Sub-11", status: "pendente", statusColor: "#f59e0b" },
        { name: "Pedro Martins", cat: "Sub-13", status: "pago", statusColor: "#10b981" },
        { name: "João Santos", cat: "Sub-9", status: "atrasado", statusColor: "#ef4444" },
        { name: "Matheus Costa", cat: "Sub-11", status: "pago", statusColor: "#10b981" },
        { name: "Thiago Alves", cat: "Sub-13", status: "pago", statusColor: "#10b981" },
        { name: "Felipe Ramos", cat: "Sub-9", status: "pendente", statusColor: "#f59e0b" },
      ].map((student, i) => (
        <g key={student.name}>
          <rect x="72" y={92 + i * 29} width="336" height="26" rx="6"
            fill={i % 2 === 0 ? "#ffffff05" : "transparent"} />
          <circle cx="87" cy={92 + i * 29 + 13} r="9"
            fill={["#3b82f6","#10b981","#8b5cf6","#f59e0b","#3b82f6","#10b981","#ef4444"][i] + "33"} />
          <text x="87" y={92 + i * 29 + 16} fill="#fff" fontSize="7" fontWeight="700" textAnchor="middle">
            {student.name.charAt(0)}
          </text>
          <text x="102" y={92 + i * 29 + 12} fill="#fff" fontSize="7.5" fontWeight="600">{student.name}</text>
          <text x="102" y={92 + i * 29 + 22} fill="#ffffff55" fontSize="6">{student.cat} · 10 anos</text>
          <rect x="310" y={92 + i * 29 + 6} width="50" height="14" rx="5"
            fill={student.statusColor + "22"} />
          <text x="335" y={92 + i * 29 + 16} fill={student.statusColor} fontSize="6.5"
            fontWeight="600" textAnchor="middle">{student.status}</text>
          <text x="378" y={92 + i * 29 + 16} fill="#ffffff33" fontSize="10">›</text>
        </g>
      ))}
    </svg>
  );
}

function PagamentosScreen() {
  return (
    <svg viewBox="0 0 480 300" className="w-full" style={{ fontFamily: "Inter, sans-serif" }}>
      <rect width="480" height="300" fill="#0f1117" rx="8" />
      <rect x="0" y="0" width="60" height="300" fill="#161920" />
      <circle cx="30" cy="22" r="10" fill="#10b981" opacity="0.8" />
      {["Dashboard","Alunos","Pagamentos","Presença","Agenda","Relatório"].map((item, i) => (
        <g key={item}>
          <rect x="8" y={48 + i * 34} width="44" height="26" rx="6"
            fill={i === 2 ? "#10b98122" : "transparent"} />
          <rect x="18" y={56 + i * 34} width="24" height="3" rx="1.5"
            fill={i === 2 ? "#10b981" : "#ffffff33"} />
          <rect x="18" y={61 + i * 34} width="16" height="2" rx="1"
            fill={i === 2 ? "#10b98166" : "#ffffff1a"} />
        </g>
      ))}
      <text x="76" y="22" fill="#fff" fontSize="10" fontWeight="700">Pagamentos</text>
      <text x="76" y="34" fill="#ffffff55" fontSize="7">Abril 2025</text>
      {/* Summary cards */}
      {[
        { label: "Recebido", value: "R$2.880", color: "#10b981" },
        { label: "Pendente", value: "R$420", color: "#f59e0b" },
        { label: "Atrasado", value: "R$180", color: "#ef4444" },
      ].map((c, i) => (
        <g key={c.label}>
          <rect x={72 + i * 120} y="44" width="112" height="36" rx="8"
            fill={c.color + "18"} stroke={c.color + "35"} strokeWidth="0.5" />
          <text x={80 + i * 120} y="58" fill={c.color} fontSize="6" fontWeight="500">{c.label}</text>
          <text x={80 + i * 120} y="72" fill={c.color} fontSize="12" fontWeight="800">{c.value}</text>
        </g>
      ))}
      {/* Batch WhatsApp button */}
      <rect x="432" y="44" width="26" height="36" rx="8" fill="#25d36622" stroke="#25d36644" strokeWidth="0.5" />
      <text x="445" y="66" fill="#25d366" fontSize="6.5" fontWeight="700" textAnchor="middle">📲</text>
      {/* Table header */}
      <rect x="72" y="90" width="336" height="18" rx="0" fill="#ffffff08" />
      <text x="84" y="102" fill="#ffffff44" fontSize="6.5" fontWeight="600">ALUNO</text>
      <text x="210" y="102" fill="#ffffff44" fontSize="6.5" fontWeight="600">CATEGORIA</text>
      <text x="280" y="102" fill="#ffffff44" fontSize="6.5" fontWeight="600">VALOR</text>
      <text x="340" y="102" fill="#ffffff44" fontSize="6.5" fontWeight="600">STATUS</text>
      {/* Payment rows */}
      {[
        { name: "Gabriel Souza", cat: "Sub-9", value: "R$60", status: "pago", color: "#10b981", priority: null },
        { name: "Lucas Oliveira", cat: "Sub-11", value: "R$60", status: "pendente", color: "#f59e0b", priority: "⚠" },
        { name: "João Santos", cat: "Sub-9", value: "R$60", status: "atrasado", color: "#ef4444", priority: "🔴" },
        { name: "Pedro Martins", cat: "Sub-13", value: "R$60", status: "pago", color: "#10b981", priority: null },
        { name: "Matheus Costa", cat: "Sub-11", value: "R$60", status: "pago", color: "#10b981", priority: null },
        { name: "Thiago Alves", cat: "Sub-13", value: "R$60", status: "pendente", color: "#f59e0b", priority: "⚠" },
        { name: "Felipe Ramos", cat: "Sub-9", value: "R$60", status: "atrasado", color: "#ef4444", priority: "🔴" },
      ].map((row, i) => (
        <g key={row.name}>
          <rect x="72" y={108 + i * 26} width="336" height="23" rx="0"
            fill={i % 2 === 0 ? "#ffffff04" : "transparent"} />
          <text x="84" y={108 + i * 26 + 14} fill="#fff" fontSize="7.5" fontWeight="600">{row.name}</text>
          <text x="84" y={108 + i * 26 + 21} fill="#ffffff44" fontSize="6">{row.priority ? row.priority + " " : ""}Vence 05/04</text>
          <text x="210" y={108 + i * 26 + 15} fill="#ffffff66" fontSize="7">{row.cat}</text>
          <text x="280" y={108 + i * 26 + 15} fill="#fff" fontSize="7.5" fontWeight="700">{row.value}</text>
          <rect x="334" y={108 + i * 26 + 5} width="50" height="13" rx="4"
            fill={row.color + "20"} />
          <text x="359" y={108 + i * 26 + 14} fill={row.color} fontSize="6.5"
            fontWeight="600" textAnchor="middle">{row.status}</text>
        </g>
      ))}
    </svg>
  );
}

const screenComponents: Record<ScreenKey, React.FC> = {
  dashboard: DashboardScreen,
  alunos: AlunosScreen,
  pagamentos: PagamentosScreen,
};

export function ProductScreenshots() {
  const [active, setActive] = useState<ScreenKey>("dashboard");
  const ActiveScreen = screenComponents[active];

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Glow */}
      <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-2xl" />

      {/* Browser chrome */}
      <div className="relative rounded-2xl border border-white/10 bg-[#0a0d13] overflow-hidden shadow-2xl shadow-black/60">
        {/* Tab bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-[#0d1019]">
          {/* Traffic lights */}
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          {/* URL bar */}
          <div className="flex-1 mx-4 flex items-center gap-2 rounded-md bg-white/5 border border-white/8 px-3 py-1">
            <span className="text-emerald-400 text-xs">🔒</span>
            <span className="text-xs text-white/40">futsimples.netlify.app/</span>
            <span className="text-xs text-white/60 font-medium">{active}</span>
          </div>
        </div>

        {/* Screen toggle tabs */}
        <div className="flex border-b border-white/5">
          {screens.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`px-5 py-2.5 text-xs font-semibold transition-colors ${
                active === s.key
                  ? "text-emerald-400 border-b-2 border-emerald-400 -mb-px bg-white/[0.03]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Screen content */}
        <div className="p-0">
          <ActiveScreen />
        </div>
      </div>

      {/* Caption */}
      <p className="text-center text-xs text-white/30 mt-4">
        Interface real do FutSimples · 100% pelo celular ou computador
      </p>
    </div>
  );
}
