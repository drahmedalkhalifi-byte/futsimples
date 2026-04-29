"use client";

import { useState } from "react";
import {
  MessageSquare,
  XCircle,
  Trophy,
  Sunset,
  Megaphone,
  Shirt,
  Send,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";

// ─── Templates ────────────────────────────────────────────────────────────────

interface Template {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  message: string;
}

const TEMPLATES: Template[] = [
  {
    id: "cancelamento",
    label: "Cancelamento de treino",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    message:
      "Atenção pessoal!\n\nO treino de hoje ({data}) esta *CANCELADO*.\n\nMotivo: [informe o motivo]\n\nO próximo treino será no dia {data_proxima}.\n\nQualquer dúvida, é só chamar. Obrigado pela compreensão!",
  },
  {
    id: "jogo",
    label: "Jogo marcado",
    icon: Trophy,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    message:
      "Atenção pessoal!\n\nTemos *JOGO* marcado!\n\nData: *{data}*\nHorário: *{hora}*\nLocal: *{local}*\nCategoria: {categoria}\n\nTodos confirmados? Respondam aqui!\n\nVamos juntos!",
  },
  {
    id: "feriado",
    label: "Feriado sem treino",
    icon: Sunset,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    message:
      "Atenção pessoal!\n\nInformamos que não haverá treino no dia *{data}* em razão do feriado.\n\nOs treinos retornam normalmente na semana seguinte.\n\nBom feriado a todos!",
  },
  {
    id: "uniforme",
    label: "Uniforme / Material",
    icon: Shirt,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    message:
      "Atenção pessoal!\n\nOs uniformes/materiais já estão disponíveis para retirada!\n\nPor favor, passem na escolinha para buscar o seu.\n\nQualquer dúvida, é só chamar. Obrigado!",
  },
  {
    id: "geral",
    label: "Aviso geral",
    icon: Megaphone,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    message: "Atenção pessoal!\n\n[Escreva seu aviso aqui]\n\nObrigado!",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AvisosPage() {
  const [selected, setSelected]   = useState<string | null>(null);
  const [message, setMessage]     = useState("");
  const [copied, setCopied]       = useState(false);

  function handleSelectTemplate(t: Template) {
    setSelected(t.id);
    setMessage(t.message);
  }

  function handleSend() {
    if (!message.trim()) return;
    const text = encodeURIComponent(message.trim());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  async function handleCopy() {
    if (!message.trim()) return;
    await navigator.clipboard.writeText(message.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const charCount = message.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Avisos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escreva ou escolha um modelo e envie direto para seus grupos do WhatsApp.
        </p>
      </div>

      {/* Templates */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Modelos rápidos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TEMPLATES.map((t) => {
            const isActive = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                  isActive
                    ? `${t.bg} ${t.border} ring-1 ring-inset ${t.border}`
                    : "border-border bg-card hover:bg-accent/50"
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${t.bg} border ${t.border}`}>
                  <t.icon className={`w-4 h-4 ${t.color}`} />
                </div>
                <span className={`text-sm font-medium flex-1 ${isActive ? "text-foreground" : "text-foreground/70"}`}>
                  {t.label}
                </span>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-opacity ${isActive ? "opacity-60" : "opacity-20"} ${t.color}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Compose */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Mensagem</span>
        </div>

        {/* Textarea */}
        <div className="px-4 pb-4">
          <textarea
            id="aviso-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escolha um modelo acima ou escreva seu aviso aqui..."
            rows={9}
            className="w-full resize-none rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <div className="flex items-center justify-end mt-1.5 px-1">
            <span className={`text-xs font-mono ${charCount > 1000 ? "text-amber-400" : "text-muted-foreground"}`}>
              {charCount} caracteres
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          disabled={!message.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado!" : "Copiar texto"}
        </button>

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5a] active:scale-[0.98] text-white text-sm font-bold transition-all shadow-lg shadow-[#25D366]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Send className="w-4 h-4" />
          Enviar no WhatsApp
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center pb-4">
        Ao clicar em "Enviar no WhatsApp", o aplicativo abrirá com a mensagem pronta.
        Você escolhe para qual grupo ou contato enviar.
      </p>
    </div>
  );
}
