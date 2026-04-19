import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { to, adminName, schoolName } = await req.json();

    if (!to || !adminName || !schoolName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendWelcomeEmail({ to, adminName, schoolName });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[welcome email] error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
