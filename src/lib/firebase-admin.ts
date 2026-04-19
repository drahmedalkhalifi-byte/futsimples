import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminDb() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var is not set.");
    }
    initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
  }
  return getFirestore();
}

// Lazy getter — only initializes when first called at runtime
export const adminDb = {
  collection: (...args: Parameters<ReturnType<typeof getFirestore>["collection"]>) =>
    getAdminDb().collection(...args),
};
