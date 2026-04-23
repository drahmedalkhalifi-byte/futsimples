import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/team/delete
 * Body: { targetUid: string, requestingUid: string }
 *
 * Deletes a team member completely:
 *  1. Verifies the requesting user is an admin of the same school as the target.
 *  2. Deletes the Firestore user document.
 *  3. Deletes the Firebase Auth account so the credentials can no longer be used.
 */
export async function POST(req: NextRequest) {
  try {
    const { targetUid, requestingUid } = await req.json() as {
      targetUid?: string;
      requestingUid?: string;
    };

    if (!targetUid || !requestingUid) {
      return NextResponse.json({ error: "targetUid and requestingUid required" }, { status: 400 });
    }

    const { adminDb, getAdminAuth } = await import("@/lib/firebase-admin");

    // ── Authorisation: requesting user must be admin of same school ────────
    const [requestingSnap, targetSnap] = await Promise.all([
      adminDb.collection("users").doc(requestingUid).get(),
      adminDb.collection("users").doc(targetUid).get(),
    ]);

    if (!requestingSnap.exists || !targetSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requester = requestingSnap.data()!;
    const target    = targetSnap.data()!;

    if (requester.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: only admins can remove team members" }, { status: 403 });
    }
    if (requester.schoolId !== target.schoolId) {
      return NextResponse.json({ error: "Forbidden: users belong to different schools" }, { status: 403 });
    }
    if (targetUid === requestingUid) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    // ── Delete Firestore document ─────────────────────────────────────────
    await adminDb.collection("users").doc(targetUid).delete();

    // ── Delete Firebase Auth account ──────────────────────────────────────
    try {
      await getAdminAuth().deleteUser(targetUid);
    } catch (authErr) {
      // Log but don't fail — Firestore doc is already gone so access is blocked
      console.warn("[team/delete] Could not delete Auth user:", authErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[team/delete] Error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
