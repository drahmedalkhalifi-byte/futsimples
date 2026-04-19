import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });

  try {
    const { schoolId, plan = "monthly" } = await req.json();
    if (!schoolId) {
      return NextResponse.json({ error: "schoolId required" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://futsimples.netlify.app";
    const isAnnual = plan === "annual";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "boleto"],
      payment_method_options: {
        boleto: {
          expires_after_days: 3,
        },
      },
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
    const message = err instanceof Error ? err.message : "Erro ao criar sessão de pagamento.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
