import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/email/welcome
 *
 * Internal-only endpoint — requires the INTERNAL_API_SECRET header.
 * Should only be called server-side (from webhook handlers, setup flow, etc.).
 * Never called directly from client-side code.
 */
export async function POST(req: NextRequest) {
  // ── Internal secret guard ─────────────────────────────────────────────────
  // Reject all requests that don't carry the correct internal secret.
  // Set INTERNAL_API_SECRET in Netlify environment variables.
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    console.error("[welcome email] INTERNAL_API_SECRET not configured");
    return NextResponse.json({ error: "Endpoint not available" }, { status: 503 });
  }
  const authHeader = req.headers.get("x-internal-secret");
  if (!authHeader || authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
