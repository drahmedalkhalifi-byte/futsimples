/**
 * Email utility using Resend.
 * RESEND_API_KEY must be set in environment variables.
 *
 * Anti-spam improvements applied:
 *  - text/plain fallback included in every send (many filters penalise HTML-only)
 *  - Reply-To set so replies don't go to a no-reply address
 *  - List-Unsubscribe header present on all transactional messages
 *  - Subject lines avoid ALL-CAPS, excessive punctuation and emojis
 *  - Preheader text prevents "[no preview text]" in inboxes
 *  - Minimal inline CSS (no pink/purple gradients that trip Barracuda/SpamAssassin)
 *
 * NOTE: The most effective deliverability fix is connecting a custom domain
 * (e.g. futsimples.com.br) in Resend and setting SPF + DKIM + DMARC records.
 * While EMAIL_FROM is onboarding@resend.dev, some emails will land in spam.
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS   = process.env.EMAIL_FROM        ?? "FutSimples <onboarding@resend.dev>";
const REPLY_TO       = process.env.EMAIL_REPLY_TO    ?? "suporte@futsimples.com.br";
const APP_URL        = process.env.NEXT_PUBLIC_APP_URL ?? "https://futsimples.netlify.app";

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY não configurado — e-mail ignorado.");
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      reply_to: REPLY_TO,
      to,
      subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<mailto:${REPLY_TO}?subject=Cancelar%20emails>`,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Erro Resend:", res.status, body);
  }
}

// ── Shared layout helpers ─────────────────────────────────────────────────────

function emailWrapper(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FutSimples</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#f4f6f9;font-size:1px;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        ${body}
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
            FutSimples — Sistema de gestão para escolinhas de futebol<br>
            Para deixar de receber estes emails, responda com "cancelar".
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail({
  to,
  adminName,
  schoolName,
}: {
  to: string;
  adminName: string;
  schoolName: string;
}): Promise<void> {
  const subject = `Bem-vindo ao FutSimples, ${adminName}`;

  const html = emailWrapper(
    `Sua escola ${schoolName} está pronta. Veja por onde começar.`,
    `
    <!-- Header -->
    <tr><td style="background-color:#10b981;padding:32px;text-align:center;">
      <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">FutSimples</p>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Gestão simplificada para escolinhas</p>
    </td></tr>
    <!-- Body -->
    <tr><td style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:bold;">Olá, ${adminName}!</h2>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
        A escola <strong>${schoolName}</strong> está configurada no FutSimples.
        Você tem <strong style="color:#10b981;">7 dias gratuitos</strong> para explorar tudo.
      </p>
      <!-- Steps -->
      <table role="presentation" width="100%" style="background:#f9fafb;border-radius:8px;padding:0;margin-bottom:24px;">
        <tr><td style="padding:20px;">
          <p style="margin:0 0 14px;color:#111827;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Por onde começar:</p>
          <p style="margin:0 0 10px;color:#374151;font-size:14px;"><strong>1. Cadastre seus alunos</strong><br><span style="color:#6b7280;">Nome, categoria e responsável</span></p>
          <p style="margin:0 0 10px;color:#374151;font-size:14px;"><strong>2. Marque presença no treino</strong><br><span style="color:#6b7280;">Registre a frequência dos alunos</span></p>
          <p style="margin:0 0 10px;color:#374151;font-size:14px;"><strong>3. Configure cobranças</strong><br><span style="color:#6b7280;">Veja quem está em atraso e dispare cobranças pelo WhatsApp</span></p>
          <p style="margin:0;color:#374151;font-size:14px;"><strong>4. Convide seus professores</strong><br><span style="color:#6b7280;">Eles marcam presença direto no sistema</span></p>
        </td></tr>
      </table>
      <!-- CTA -->
      <table role="presentation" width="100%">
        <tr><td align="center" style="padding-bottom:20px;">
          <a href="${APP_URL}/dashboard" style="display:inline-block;background-color:#10b981;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 32px;border-radius:8px;">
            Acessar minha escola
          </a>
        </td></tr>
      </table>
      <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
        Dúvidas? Responda este email — estamos aqui para ajudar.
      </p>
    </td></tr>
    `
  );

  const text = `Olá, ${adminName}!

Sua escola ${schoolName} está configurada no FutSimples.
Você tem 7 dias gratuitos para explorar tudo.

Por onde começar:
1. Cadastre seus alunos
2. Marque presença no treino
3. Configure cobranças
4. Convide seus professores

Acesse: ${APP_URL}/dashboard

Dúvidas? Responda este email.

FutSimples — Gestão para escolinhas de futebol`;

  await sendEmail({ to, subject, html, text });
}

// ── Trial reminder email ──────────────────────────────────────────────────────

export async function sendTrialReminderEmail({
  to,
  adminName,
  schoolName,
  daysLeft,
}: {
  to: string;
  adminName: string;
  schoolName: string;
  daysLeft: number;
}): Promise<void> {
  const dayLabel    = daysLeft === 1 ? "1 dia" : `${daysLeft} dias`;
  const urgencyText = daysLeft <= 1
    ? "Ultimo dia de teste"
    : daysLeft <= 3
    ? `Faltam ${dayLabel} para seu teste encerrar`
    : `Seu teste encerra em ${dayLabel}`;

  const subject = `${urgencyText} — FutSimples`;

  const urgencyColor = daysLeft <= 1 ? "#ef4444" : daysLeft <= 3 ? "#f59e0b" : "#10b981";

  const html = emailWrapper(
    `Não perca seus dados de alunos, pagamentos e presença — assine para continuar.`,
    `
    <!-- Header -->
    <tr><td style="background-color:#111827;padding:32px;text-align:center;">
      <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">FutSimples</p>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">${schoolName}</p>
    </td></tr>
    <!-- Body -->
    <tr><td style="padding:32px;">
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
        Olá, <strong>${adminName}</strong>!
      </p>
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
        Seu período de teste da escola <strong>${schoolName}</strong> termina em
        <strong style="color:${urgencyColor};">${dayLabel}</strong>.
      </p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
        Para não perder o acesso aos seus dados — alunos, pagamentos, presenças e histórico — assine o FutSimples agora.
      </p>
      <!-- Price box -->
      <table role="presentation" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
        <tr><td style="padding:20px;text-align:center;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Plano Mensal</p>
          <p style="margin:0;font-size:28px;font-weight:bold;color:#111827;">R$ 59,90<span style="font-size:14px;color:#9ca3af;font-weight:normal;">/mês</span></p>
          <p style="margin:8px 0 0;color:#10b981;font-size:13px;">Tudo incluido. Cancele quando quiser.</p>
        </td></tr>
      </table>
      <!-- CTA -->
      <table role="presentation" width="100%">
        <tr><td align="center" style="padding-bottom:16px;">
          <a href="${APP_URL}/assinar" style="display:inline-block;background-color:#10b981;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 32px;border-radius:8px;">
            Assinar por R$59,90/mes
          </a>
        </td></tr>
      </table>
      <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
        Tambem disponivel plano anual por <strong style="color:#10b981;">R$599/ano</strong> (2 meses gratis)
      </p>
    </td></tr>
    `
  );

  const text = `Olá, ${adminName}!

Seu período de teste da escola ${schoolName} encerra em ${dayLabel}.

Para não perder seus dados, assine o FutSimples:
- Plano mensal: R$59,90/mês
- Plano anual: R$599/ano (2 meses grátis)

Assinar: ${APP_URL}/assinar

Dúvidas? Responda este email.

FutSimples — Gestão para escolinhas de futebol`;

  await sendEmail({ to, subject, html, text });
}
