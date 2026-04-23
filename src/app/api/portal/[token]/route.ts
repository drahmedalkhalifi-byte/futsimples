import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Recursively converts Firestore Timestamps → ISO strings so JSON.stringify works. */
function toJSON(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (typeof val !== "object") return val;
  if (typeof (val as { toDate?: unknown }).toDate === "function") {
    return ((val as { toDate: () => Date }).toDate()).toISOString();
  }
  if (Array.isArray(val)) return val.map(toJSON);
  return Object.fromEntries(
    Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, toJSON(v)])
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Token obrigatório" }, { status: 400 });
  }

  try {
    const { adminDb } = await import("@/lib/firebase-admin");

    // ── 1. Find student by portalToken ──────────────────────────────────────
    const studentsSnap = await adminDb
      .collection("students")
      .where("portalToken", "==", token)
      .limit(1)
      .get();

    if (studentsSnap.empty) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const studentDoc = studentsSnap.docs[0];
    const studentData = studentDoc.data();
    const student = toJSON({ id: studentDoc.id, ...studentData });
    const schoolId = studentData.schoolId as string;
    const studentId = studentDoc.id;
    const category  = studentData.category as string;

    // ── 2. School name ───────────────────────────────────────────────────────
    let schoolName = "Escolinha";
    try {
      const schoolDoc = await adminDb.collection("schools").doc(schoolId).get();
      if (schoolDoc.exists) schoolName = (schoolDoc.data()?.name as string) ?? schoolName;
    } catch { /* non-critical */ }

    // ── 3. Payments for this student ─────────────────────────────────────────
    let payments: unknown[] = [];
    try {
      const paymentsSnap = await adminDb
        .collection("payments")
        .where("studentId", "==", studentId)
        .get();
      payments = paymentsSnap.docs.map((d) => toJSON({ id: d.id, ...d.data() }));
    } catch { /* non-critical */ }

    // ── 4. Attendances — same school & category, last 3 months ───────────────
    let attendances: unknown[] = [];
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const attSnap = await adminDb
        .collection("attendances")
        .where("schoolId", "==", schoolId)
        .where("category", "==", category)
        .get();

      attendances = attSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a) => {
          const raw = (a as { date?: { toDate?: () => Date } | string }).date;
          const d = raw && typeof raw === "object" && typeof raw.toDate === "function"
            ? raw.toDate()
            : raw ? new Date(raw as string) : null;
          return d && d >= threeMonthsAgo;
        })
        .map((a) => toJSON(a));
    } catch { /* non-critical */ }

    // ── 5. Upcoming schedules ────────────────────────────────────────────────
    let upcomingSchedules: unknown[] = [];
    try {
      const now = new Date();
      const schedulesSnap = await adminDb
        .collection("schedules")
        .where("schoolId", "==", schoolId)
        .where("category", "==", category)
        .get();

      upcomingSchedules = schedulesSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => {
          const raw = (s as { date?: { toDate?: () => Date } | string }).date;
          const d = raw && typeof raw === "object" && typeof raw.toDate === "function"
            ? raw.toDate()
            : raw ? new Date(raw as string) : null;
          return d && d >= now;
        })
        .sort((a, b) => {
          const rA = (a as { date?: { toDate?: () => Date } | string }).date;
          const rB = (b as { date?: { toDate?: () => Date } | string }).date;
          const dA = rA && typeof rA === "object" && typeof rA.toDate === "function"
            ? rA.toDate().getTime()
            : rA ? new Date(rA as string).getTime() : 0;
          const dB = rB && typeof rB === "object" && typeof rB.toDate === "function"
            ? rB.toDate().getTime()
            : rB ? new Date(rB as string).getTime() : 0;
          return dA - dB;
        })
        .slice(0, 4)
        .map((s) => toJSON(s));
    } catch { /* non-critical */ }

    return NextResponse.json({
      student,
      schoolName,
      payments,
      attendances,
      upcomingSchedules,
    });
  } catch (err) {
    console.error("[portal-api] Erro crítico:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
