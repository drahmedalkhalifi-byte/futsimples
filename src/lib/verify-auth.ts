/**
 * Server-side Firebase ID Token verification.
 *
 * Usage in API routes:
 *   const uid = await verifyIdToken(req);
 *   if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *
 * The client must send: Authorization: Bearer <firebase_id_token>
 * ID tokens are obtained via: import { getIdToken } from "firebase/auth"; getIdToken(auth.currentUser)
 */

import { NextRequest } from "next/server";

export async function verifyIdToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.slice(7);
  if (!idToken) return null;

  try {
    const { getAdminAuth } = await import("@/lib/firebase-admin");
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

/**
 * Verifies the token and returns the Firestore user doc for the caller.
 * Returns null if token is invalid or user doc doesn't exist.
 */
export async function verifyAdminUser(req: NextRequest): Promise<{
  uid: string;
  schoolId: string;
  role: string;
} | null> {
  const uid = await verifyIdToken(req);
  if (!uid) return null;

  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    const snap = await adminDb.collection("users").doc(uid).get();
    if (!snap.exists) return null;

    const data = snap.data()!;
    if (!data.schoolId || !data.role) return null;

    return { uid, schoolId: data.schoolId as string, role: data.role as string };
  } catch {
    return null;
  }
}
