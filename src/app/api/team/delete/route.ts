import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/verify-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/team/delete
 * Headers: Authorization: Bearer <firebase_id_token>
 * Body: { targetUid: string }
 *
 * Deletes a team member completely:
 *  1. Verifies caller via Firebase ID Token (not from body).
 *  2. Checks caller is admin of same school as target.
 *  3. Deletes the Firestore user document.
 *  4. Deletes the Firebase Auth account.
 */
export async function POST(req: NextRequest) {
  // ── Auth: verify caller via JWT, not from request body ────────────────────
  const caller = await verifyAdminUser(req);
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (caller.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: only admins can remove team members" }, { status: 403 });
  }

  try {
    const { targetUid } = await req.json() as { targetUid?: string };

    if (!targetUid) {
      return NextResponse.json({ error: "targetUid required" }, { status: 400 });
    }

    if (targetUid === caller.uid) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    const { adminDb, getAdminAuth } = await import("@/lib/firebase-admin");

    const targetSnap = await adminDb.collection("users").doc(targetUid).get();
    if (!targetSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const target = targetSnap.data()!;

    // ── Enforce same-school isolation ─────────────────────────────────────────
    if (target.schoolId !== caller.schoolId) {
      return NextResponse.json({ error: "Forbidden: users belong to different schools" }, { status: 403 });
    }

    // ── Delete Firestore document ─────────────────────────────────────────────
    await adminDb.collection("users").doc(targetUid).delete();

    // ── Delete Firebase Auth account ──────────────────────────────────────────
    try {
      await getAdminAuth().deleteUser(targetUid);
    } catch (authErr) {
      console.warn("[team/delete] Could not delete Auth user:", authErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[team/delete] Error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
