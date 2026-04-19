import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MP_API = "https://api.mercadopago.com";

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.json({ error: "paymentId obrigatório" }, { status: 400 });
  }

  try {
    const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json({ status: data.status ?? "unknown" });
  } catch {
    return NextResponse.json({ status: "unknown" });
  }
}
