"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User, UserRole } from "@/types";

export type SubscriptionStatus = "trial" | "active" | "expired";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  schoolId: string | null;
  schoolName: string | null;
  role: UserRole | null;
  subscriptionStatus: SubscriptionStatus | null;
  trialDaysLeft: number | null;
  /** Date when PIX subscription expires. null for Stripe (auto-renews) or trial. */
  subscriptionExpiresAt: Date | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  /** True only when loading is done, firebaseUser is set, and schoolId is resolved. */
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function resolveSubscription(sd: Record<string, unknown>): {
  subscriptionStatus: SubscriptionStatus;
  trialDaysLeft: number | null;
  subscriptionExpiresAt: Date | null;
} {
  const rawStatus = sd.subscriptionStatus as SubscriptionStatus | undefined;
  const trialStarted = (sd.trialStartedAt as { toDate?: () => Date } | undefined)?.toDate?.();
  const expiresAtRaw = (sd.subscriptionExpiresAt as { toDate?: () => Date } | undefined)?.toDate?.();

  if (rawStatus === "active") {
    if (expiresAtRaw && expiresAtRaw < new Date()) {
      return { subscriptionStatus: "expired", trialDaysLeft: null, subscriptionExpiresAt: expiresAtRaw };
    }
    return { subscriptionStatus: "active", trialDaysLeft: null, subscriptionExpiresAt: expiresAtRaw ?? null };
  }

  if (trialStarted) {
    const daysLeft = 7 - Math.floor((Date.now() - trialStarted.getTime()) / 86_400_000);
    if (daysLeft > 0) {
      return { subscriptionStatus: "trial", trialDaysLeft: daysLeft, subscriptionExpiresAt: null };
    }
    return { subscriptionStatus: "expired", trialDaysLeft: 0, subscriptionExpiresAt: null };
  }

  // Legacy school without trialStartedAt — treat as active
  return { subscriptionStatus: "active", trialDaysLeft: null, subscriptionExpiresAt: null };
}

const EMPTY_STATE: AuthState = {
  firebaseUser: null,
  user: null,
  schoolId: null,
  schoolName: null,
  role: null,
  subscriptionStatus: null,
  trialDaysLeft: null,
  subscriptionExpiresAt: null,
  loading: false,
  error: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ...EMPTY_STATE,
    loading: true,
  });

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setState({ ...EMPTY_STATE });
          return;
        }

        async function loadUser(uid: string) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (!userDoc.exists()) return null;
          const userData = { id: userDoc.id, ...userDoc.data() } as User;

          let schoolName: string | null = null;
          let subResult = { subscriptionStatus: "trial" as SubscriptionStatus, trialDaysLeft: null as number | null, subscriptionExpiresAt: null as Date | null };

          try {
            const schoolDoc = await getDoc(doc(db, "schools", userData.schoolId));
            if (schoolDoc.exists()) {
              const sd = schoolDoc.data() as Record<string, unknown>;
              schoolName = (sd.name as string) ?? null;
              subResult = resolveSubscription(sd);
            }
          } catch { /* ignore */ }

          return { userData, schoolName, subResult };
        }

        try {
          const result = await loadUser(firebaseUser.uid);

          if (result) {
            const { userData, schoolName, subResult } = result;
            setState({
              firebaseUser,
              user: userData,
              schoolId: userData.schoolId,
              schoolName,
              role: userData.role,
              ...subResult,
              loading: false,
              error: null,
            });
          } else {
            // Auth user exists but no Firestore doc yet.
            // Poll up to 5 times (1s apart) while setDoc completes.
            setState((prev) => ({ ...prev, loading: true }));
            let attempts = 0;
            const poll = async () => {
              attempts++;
              try {
                const result2 = await loadUser(firebaseUser.uid);
                if (result2) {
                  const { userData, schoolName, subResult } = result2;
                  setState({
                    firebaseUser,
                    user: userData,
                    schoolId: userData.schoolId,
                    schoolName,
                    role: userData.role,
                    ...subResult,
                    loading: false,
                    error: null,
                  });
                } else if (attempts < 5) {
                  setTimeout(poll, 1000);
                } else {
                  setState({ ...EMPTY_STATE, firebaseUser, loading: false });
                }
              } catch {
                if (attempts < 5) setTimeout(poll, 1000);
                else setState({ ...EMPTY_STATE, firebaseUser, loading: false });
              }
            };
            setTimeout(poll, 500);
          }
        } catch (err) {
          console.error("Erro ao carregar dados do usuário:", err);
          setState({
            ...EMPTY_STATE,
            firebaseUser,
            loading: false,
            error: "Erro ao carregar dados do usuário. Verifique sua conexão.",
          });
        }
      });

      return unsubscribe;
    } catch (err) {
      console.error("Erro ao inicializar autenticação:", err);
      setState({
        ...EMPTY_STATE,
        loading: false,
        error: "Erro ao conectar com o servidor. Verifique sua conexão.",
      });
    }
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  }

  const isReady =
    !state.loading && state.firebaseUser !== null && state.schoolId !== null;

  return (
    <AuthContext.Provider value={{ ...state, isReady, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
