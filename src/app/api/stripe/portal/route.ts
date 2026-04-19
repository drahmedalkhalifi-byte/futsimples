import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });

  const { adminDb } = await import("@/lib/firebase-admin");

  try {
    const { schoolId } = await req.json();
    if (!schoolId) {
      return NextResponse.json({ error: "schoolId required" }, { status: 400 });
    }

    const schoolDoc = await adminDb.collection("schools").doc(schoolId).get();
    if (!schoolDoc.exists) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const stripeCustomerId = schoolDoc.data()?.stripeCustomerId as string | undefined;
    if (!stripeCustomerId) {
      return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://futsimples.netlify.app";

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/configuracoes`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "Erro ao abrir portal de assinatura." }, { status: 500 });
  }
}
