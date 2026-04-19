/**
 * Netlify scheduled function — runs daily at 09:00 UTC.
 * Calls the Next.js API route to send trial reminder emails.
 *
 * Required env vars:
 *   CRON_SECRET       — shared secret between this function and the API route
 *   NEXT_PUBLIC_APP_URL — e.g. https://futsimples.netlify.app
 */

import type { Config } from "@netlify/functions";

export const config: Config = {
  schedule: "0 9 * * *",
};

export default async function handler() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://futsimples.netlify.app";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[trial-reminder-cron] CRON_SECRET not set — aborting.");
    return;
  }

  try {
    const res = await fetch(`${appUrl}/api/email/trial-reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": cronSecret,
      },
    });

    const data = await res.json();
    console.log("[trial-reminder-cron] result:", JSON.stringify(data));
  } catch (err) {
    console.error("[trial-reminder-cron] fetch error:", err);
  }
}
