import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Initialize lazily so env vars are available at runtime, not build time
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
  });

  const { adminDb } = await import("@/lib/firebase-admin");

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const schoolId = session.client_reference_id;
        if (!schoolId) break;

        await adminDb.collection("schools").doc(schoolId).update({
          subscriptionStatus: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          subscriptionActivatedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Send subscription confirmation email (fire-and-forget)
        try {
          const { sendWelcomeEmail } = await import("@/lib/email");
          const usersSnap = await adminDb
            .collection("users")
            .where("schoolId", "==", schoolId)
            .where("role", "==", "admin")
            .limit(1)
            .get();
          if (!usersSnap.empty) {
            const adminUser = usersSnap.docs[0].data();
            const schoolDoc = await adminDb.collection("schools").doc(schoolId).get();
            const schoolName = (schoolDoc.data()?.name as string) ?? "sua escola";
            await sendWelcomeEmail({
              to: adminUser.email as string,
              adminName: (adminUser.name as string) ?? "Administrador",
              schoolName,
            });
          }
        } catch (emailErr) {
          console.error("Failed to send subscription email:", emailErr);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = (invoice as { subscription?: string }).subscription;

        const snap = await adminDb
          .collection("schools")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!snap.empty) {
          await snap.docs[0].ref.update({
            subscriptionStatus: "active",
            stripeSubscriptionId: subscriptionId ?? snap.docs[0].data().stripeSubscriptionId,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const obj = event.data.object as { customer?: string };
        const customerId = obj.customer as string;

        const snap = await adminDb
          .collection("schools")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!snap.empty) {
          await snap.docs[0].ref.update({
            subscriptionStatus: "expired",
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
