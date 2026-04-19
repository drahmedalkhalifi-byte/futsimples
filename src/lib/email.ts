/**
 * Email utility using Resend.
 * RESEND_API_KEY must be set in environment variables.
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "FutSimples <noreply@futsimples.com.br>";

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send.");
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend error:", res.status, body);
  }
}

export async function sendWelcomeEmail({
  to,
  adminName,
  schoolName,
}: {
  to: string;
  adminName: string;
  schoolName: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://futsimples.netlify.app";

  await sendEmail({
    to,
    subject: `Bem-vindo ao FutSimples, ${adminName}! 🏆`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:36px 32px;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;margin-bottom:16px;">
        <span style="font-size:28px;">🏆</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">FutSimples</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Sistema de gestão para escolinhas de futebol</p>
    </div>
    <!-- Body -->
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:700;">Bem-vindo, ${adminName}! 👋</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
        Sua escola <strong style="color:#111827;">${schoolName}</strong> está pronta no FutSimples.<br>
        Você tem <strong style="color:#10b981;">14 dias grátis</strong> para explorar tudo.
      </p>
      <!-- Steps -->
      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="margin:0 0 14px;color:#111827;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Por onde começar:</p>
        ${[
          ["📋", "Cadastre seus alunos", "Adicione nome, categoria e responsável"],
          ["✅", "Marque presença no treino", "Registre a presença dos alunos"],
          ["💰", "Configure cobranças", "Veja quem está em atraso e dispare cobranças no WhatsApp"],
          ["📱", "Convide seus professores", "Eles marcam presença direto no sistema"],
        ].map(([emoji, title, desc]) => `
        <div style="display:flex;gap:12px;margin-bottom:12px;">
          <span style="font-size:18px;line-height:1.2;">${emoji}</span>
          <div>
            <p style="margin:0;color:#111827;font-size:14px;font-weight:600;">${title}</p>
            <p style="margin:2px 0 0;color:#9ca3af;font-size:13px;">${desc}</p>
          </div>
        </div>`).join("")}
      </div>
      <!-- CTA -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;box-shadow:0 4px 14px rgba(16,185,129,0.35);">
          Acessar minha escola →
        </a>
      </div>
      <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
        Qualquer dúvida, responda este email.<br>Estamos aqui para ajudar.
      </p>
    </div>
    <!-- Footer -->
    <div style="border-top:1px solid #f3f4f6;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#d1d5db;font-size:12px;">
        © ${new Date().getFullYear()} FutSimples · Sistema de gestão para escolinhas de futebol
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://futsimples.netlify.app";
  const urgencyColor = daysLeft <= 1 ? "#ef4444" : daysLeft <= 3 ? "#f59e0b" : "#10b981";
  const dayLabel = daysLeft === 1 ? "1 dia" : `${daysLeft} dias`;

  await sendEmail({
    to,
    subject: `⏳ Seu teste FutSimples termina em ${dayLabel} — não perca o acesso`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#111827,#1f2937);padding:36px 32px;text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:rgba(255,255,255,0.1);border-radius:14px;margin-bottom:16px;">
        <span style="font-size:28px;">⏳</span>
      </div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Seu teste termina em ${dayLabel}</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">FutSimples — ${schoolName}</p>
    </div>
    <!-- Body -->
    <div style="padding:36px 32px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
        Olá, <strong>${adminName}</strong>!<br><br>
        Seu período de teste gratuito da escola <strong>${schoolName}</strong> termina em <strong style="color:${urgencyColor};">${dayLabel}</strong>.<br><br>
        Para não perder o acesso a todos os seus dados — alunos, pagamentos, presença e histórico — assine o FutSimples agora.
      </p>
      <!-- Price box -->
      <div style="background:#f9fafb;border:2px solid #10b98133;border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Plano Mensal</p>
        <p style="margin:0;font-size:32px;font-weight:800;color:#111827;">R$59<span style="font-size:22px;">,90</span><span style="font-size:14px;color:#9ca3af;font-weight:400;">/mês</span></p>
        <p style="margin:8px 0 0;color:#10b981;font-size:13px;font-weight:600;">✓ Tudo incluído · Cancele quando quiser</p>
      </div>
      <!-- CTA -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${appUrl}/assinar" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;box-shadow:0 4px 14px rgba(16,185,129,0.35);">
          Assinar agora por R$59,90/mês →
        </a>
      </div>
      <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
        Também disponível plano anual por <strong style="color:#10b981;">R$599/ano</strong> (2 meses grátis)
      </p>
    </div>
    <!-- Footer -->
    <div style="border-top:1px solid #f3f4f6;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#d1d5db;font-size:12px;">
        © ${new Date().getFullYear()} FutSimples · Se não quer mais receber estes emails, responda "cancelar".
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}
