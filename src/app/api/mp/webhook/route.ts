import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

const MP_API = "https://api.mercadopago.com";

/**
 * Validates the Mercado Pago webhook signature.
 * Docs: https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
 *
 * MP sends:
 *   x-signature: "ts=<timestamp>,v1=<hmac_sha256>"
 *   x-request-id: "<uuid>"
 *
 * The signed string is: "id:<paymentId>;request-id:<requestId>;ts:<ts>;"
 */
function verifyMpSignature(
  paymentId: string,
  requestId: string | null,
  xSignature: string | null,
  secret: string
): boolean {
  if (!xSignature || !requestId) return false;

  // Parse "ts=...,v1=..."
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const signedString = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret)
    .update(signedString)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP sends type "payment" when a payment is updated
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentId = String(body.data.id);

    // ── Token verification (URL query param) ─────────────────────────────────
    const expectedToken = process.env.MP_WEBHOOK_TOKEN;
    if (expectedToken) {
      const urlToken = req.nextUrl.searchParams.get("token");
      if (!urlToken || urlToken !== expectedToken) {
        console.error("MP webhook: token inválido — possível requisição falsificada");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.warn("MP webhook: MP_WEBHOOK_TOKEN não configurado — verificação ignorada");
    }

    // ── HMAC signature verification (if secret available) ───────────────────
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const xSignature = req.headers.get("x-signature");
      const xRequestId = req.headers.get("x-request-id");
      const valid = verifyMpSignature(paymentId, xRequestId, xSignature, webhookSecret);
      if (!valid) {
        console.error("MP webhook: assinatura inválida — possível requisição falsificada");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // ── Fetch payment details from MP ────────────────────────────────────────
    const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.error("MP webhook: falha ao buscar pagamento", paymentId);
      return NextResponse.json({ error: "Falha ao verificar pagamento" }, { status: 500 });
    }

    const payment = await res.json();

    // Only process approved payments
    if (payment.status !== "approved") {
      return NextResponse.json({ received: true });
    }

    // external_reference = "schoolId:plan"
    const ref = payment.external_reference as string | undefined;
    if (!ref || !ref.includes(":")) {
      console.error("MP webhook: external_reference inválido", ref);
      return NextResponse.json({ received: true });
    }

    const [schoolId, plan] = ref.split(":");
    if (!schoolId || !plan) {
      console.error("MP webhook: schoolId ou plan ausente no external_reference", ref);
      return NextResponse.json({ received: true });
    }

    const isAnnual = plan === "annual";

    // Calculate expiry (extra 1-2 days buffer)
    const days = isAnnual ? 366 : 32;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const { adminDb } = await import("@/lib/firebase-admin");

    // Verify school exists before updating
    const schoolRef = adminDb.collection("schools").doc(schoolId);
    const schoolDoc = await schoolRef.get();
    if (!schoolDoc.exists) {
      console.error("MP webhook: escola não encontrada", schoolId);
      return NextResponse.json({ received: true });
    }

    // Idempotency: skip if this paymentId was already processed
    const existing = schoolDoc.data();
    if (existing?.mpPaymentId === paymentId) {
      console.log(`MP webhook: pagamento ${paymentId} já processado — ignorando`);
      return NextResponse.json({ received: true });
    }

    await schoolRef.update({
      subscriptionStatus: "active",
      subscriptionExpiresAt: expiresAt,
      lastPaymentMethod: "pix",
      mpPaymentId: paymentId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`PIX aprovado: escola ${schoolId}, plano ${plan}, expira ${expiresAt.toISOString()}`);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("MP webhook exception:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
