import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyAdminUser } from "@/lib/verify-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ── Auth: must be a logged-in user ────────────────────────────────────────
  const caller = await verifyAdminUser(req);
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe não configurado. Contacte o suporte." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const { schoolId, plan = "monthly" } = await req.json();
    if (!schoolId) {
      return NextResponse.json({ error: "schoolId required" }, { status: 400 });
    }

    // ── Enforce: caller can only create checkout for their own school ─────────
    if (caller.schoolId !== schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://futsimples.netlify.app";
    const isAnnual = plan === "annual";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "boleto"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: isAnnual ? "FutSimples — Plano Anual" : "FutSimples — Plano Mensal",
              description: "Gestão completa da sua escola de futebol",
            },
            unit_amount: isAnnual ? 59900 : 5990,
            recurring: { interval: isAnnual ? "year" : "month" },
          },
          quantity: 1,
        },
      ],
      client_reference_id: schoolId,
      success_url: `${appUrl}/dashboard?subscribed=true`,
      cancel_url: `${appUrl}/assinar?canceled=true`,
      locale: "pt-BR",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    // Never forward raw error.message to client — it may leak internal details
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento. Tente novamente." }, { status: 500 });
  }
}
