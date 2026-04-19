import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const MP_API = "https://api.mercadopago.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP envia type "payment" quando um pagamento é atualizado
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentId = String(body.data.id);

    // Busca detalhes do pagamento no MP
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

    // Só processa se aprovado
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
    const isAnnual = plan === "annual";

    // Calcula data de expiração
    const days = isAnnual ? 366 : 32; // margem de 1-2 dias extra
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const { adminDb } = await import("@/lib/firebase-admin");

    await adminDb.collection("schools").doc(schoolId).update({
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
