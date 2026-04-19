/**
 * Trial reminder endpoint.
 * Checks all schools on trial and sends email reminders when trial expires in:
 *   - 3 days (first reminder)
 *   - 1 day (final reminder)
 *
 * Should be called daily by a cron job or Netlify scheduled function.
 * Secured by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendTrialReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const TRIAL_DAYS = 14;
const REMINDER_DAYS = [3, 1]; // days before expiry to send reminders

export async function POST(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { adminDb } = await import("@/lib/firebase-admin");

  try {
    // Get all schools still on trial
    const trialSnap = await adminDb
      .collection("schools")
      .where("subscriptionStatus", "==", "trial")
      .get();

    const now = Date.now();
    const sent: string[] = [];
    const skipped: string[] = [];

    for (const schoolDoc of trialSnap.docs) {
      const data = schoolDoc.data();
      const trialStartedAt = data.trialStartedAt?.toDate?.() as Date | undefined;
      if (!trialStartedAt) continue;

      const elapsedDays = Math.floor((now - trialStartedAt.getTime()) / 86_400_000);
      const daysLeft = TRIAL_DAYS - elapsedDays;

      if (!REMINDER_DAYS.includes(daysLeft)) {
        skipped.push(schoolDoc.id);
        continue;
      }

      // Already sent reminder for this day? Check lastReminderDaysLeft field
      const lastReminder = data.lastReminderDaysLeft as number | undefined;
      if (lastReminder === daysLeft) {
        skipped.push(schoolDoc.id);
        continue;
      }

      // Get admin user email for this school
      const usersSnap = await adminDb
        .collection("users")
        .where("schoolId", "==", schoolDoc.id)
        .where("role", "==", "admin")
        .limit(1)
        .get();

      if (usersSnap.empty) {
        skipped.push(schoolDoc.id);
        continue;
      }

      const adminUser = usersSnap.docs[0].data();
      const adminEmail = adminUser.email as string;
      const adminName = (adminUser.name as string) ?? "Administrador";
      const schoolName = (data.name as string) ?? "sua escola";

      await sendTrialReminderEmail({
        to: adminEmail,
        adminName,
        schoolName,
        daysLeft,
      });

      // Record that we sent this reminder so we don't send duplicates
      await schoolDoc.ref.update({ lastReminderDaysLeft: daysLeft });

      sent.push(`${schoolDoc.id} (${daysLeft}d left → ${adminEmail})`);
    }

    return NextResponse.json({
      ok: true,
      sent: sent.length,
      skipped: skipped.length,
      details: sent,
    });
  } catch (err) {
    console.error("[trial-reminder] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Allow GET for easy manual testing with Netlify dashboard
export async function GET(req: NextRequest) {
  return POST(req);
}
