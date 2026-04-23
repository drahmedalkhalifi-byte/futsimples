import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

/**
 * POST /api/team/relink
 * Body: { email: string, name: string, requestingUid: string }
 *
 * Used when a professor's Firebase Auth account already exists (email-already-in-use)
 * but their Firestore user document is missing or from a different school.
 * Re-creates the Firestore doc with the admin's schoolId and role: "coach".
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name, requestingUid } = await req.json() as {
      email?: string;
      name?: string;
      requestingUid?: string;
    };

    if (!email || !name || !requestingUid) {
      return NextResponse.json({ error: "email, name e requestingUid são obrigatórios" }, { status: 400 });
    }

    const { adminDb, getAdminAuth } = await import("@/lib/firebase-admin");

    // ── Verify requesting user is admin ───────────────────────────────────
    const requestingSnap = await adminDb.collection("users").doc(requestingUid).get();
    if (!requestingSnap.exists) {
      return NextResponse.json({ error: "Usuário solicitante não encontrado" }, { status: 404 });
    }
    const requester = requestingSnap.data()!;
    if (requester.role !== "admin") {
      return NextResponse.json({ error: "Apenas administradores podem reativar professores" }, { status: 403 });
    }

    // ── Find existing Firebase Auth user by email ─────────────────────────
    let targetUid: string;
    try {
      const authUser = await getAdminAuth().getUserByEmail(email.trim());
      targetUid = authUser.uid;
    } catch {
      return NextResponse.json({ error: "Nenhuma conta encontrada com esse email" }, { status: 404 });
    }

    // ── Block re-linking to a user from a different school ────────────────
    const existingUserSnap = await adminDb.collection("users").doc(targetUid).get();
    if (existingUserSnap.exists) {
      const existingData = existingUserSnap.data()!;
      if (existingData.schoolId && existingData.schoolId !== requester.schoolId) {
        return NextResponse.json(
          { error: "Este email já pertence a outra escola" },
          { status: 409 }
        );
      }
    }

    // ── Create / overwrite Firestore user doc ─────────────────────────────
    await adminDb.collection("users").doc(targetUid).set({
      schoolId:  requester.schoolId,
      email:     email.trim().toLowerCase(),
      name:      name.trim(),
      role:      "coach",
      createdAt: existingUserSnap.exists ? existingUserSnap.data()!.createdAt : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, uid: targetUid });
  } catch (err) {
    console.error("[team/relink] Error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
