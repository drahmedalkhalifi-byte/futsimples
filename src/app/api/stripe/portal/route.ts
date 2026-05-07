import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyAdminUser } from "@/lib/verify-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ── Auth: must be a logged-in admin ──────────────────────────────────────
  const caller = await verifyAdminUser(req);
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe não configurado." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
    const { adminDb } = await import("@/lib/firebase-admin");

    const { schoolId } = await req.json();
    if (!schoolId) {
      return NextResponse.json({ error: "schoolId required" }, { status: 400 });
    }

    // ── Enforce: caller can only access their own school's portal ────────────
    if (caller.schoolId !== schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
      locale: "pt-BR",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "Erro ao abrir portal de assinatura." }, { status: 500 });
  }
}
