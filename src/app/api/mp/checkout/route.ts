import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/verify-auth";

export const dynamic = "force-dynamic";

const MP_API = "https://api.mercadopago.com";

export async function POST(req: NextRequest) {
  // ── Auth: must be a logged-in user ────────────────────────────────────────
  const caller = await verifyAdminUser(req);
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { schoolId, plan, userEmail } = await req.json();

    if (!schoolId || !plan) {
      return NextResponse.json({ error: "schoolId e plan são obrigatórios" }, { status: 400 });
    }

    // ── Enforce: caller can only create PIX for their own school ─────────────
    if (caller.schoolId !== schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isAnnual = plan === "annual";
    const amount = isAnnual ? 599.0 : 59.9;
    const description = isAnnual ? "FutSimples — Plano Anual" : "FutSimples — Plano Mensal";

    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://futsimples.netlify.app";

    const body = {
      transaction_amount: amount,
      description,
      payment_method_id: "pix",
      payer: { email: userEmail ?? "pagador@futsimples.com.br" },
      external_reference: `${schoolId}:${plan}`,
      notification_url: `${appUrl}/api/mp/webhook?token=${process.env.MP_WEBHOOK_TOKEN ?? ""}`,
      date_of_expiration: expiry,
    };

    const res = await fetch(`${MP_API}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        "X-Idempotency-Key": `${schoolId}-${plan}-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("MP checkout error:", data);
      return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
    }

    const txData = data.point_of_interaction?.transaction_data;

    return NextResponse.json({
      paymentId: String(data.id),
      qrCode: txData?.qr_code ?? null,
      qrCodeBase64: txData?.qr_code_base64 ?? null,
      amount,
    });
  } catch (err) {
    console.error("MP checkout exception:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
