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

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  schoolId: string | null;
  role: UserRole | null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    schoolId: null,
    role: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = { id: userDoc.id, ...userDoc.data() } as User;
              setState({
                firebaseUser,
                user: userData,
                schoolId: userData.schoolId,
                role: userData.role,
                loading: false,
                error: null,
              });
            } else {
              // Auth user exists but no Firestore doc.
              // This happens during setup: createUserWithEmailAndPassword fires
              // onAuthStateChanged before setDoc writes the user document.
              // Poll up to 5 times (1s apart) so we wait for the setDoc to complete.
              setState((prev) => ({ ...prev, loading: true }));
              let attempts = 0;
              const poll = async () => {
                attempts++;
                try {
                  const retryDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                  if (retryDoc.exists()) {
                    const userData = { id: retryDoc.id, ...retryDoc.data() } as User;
                    setState({
                      firebaseUser,
                      user: userData,
                      schoolId: userData.schoolId,
                      role: userData.role,
                      loading: false,
                      error: null,
                    });
                  } else if (attempts < 5) {
                    setTimeout(poll, 1000);
                  } else {
                    setState({
                      firebaseUser,
                      user: null,
                      schoolId: null,
                      role: null,
                      loading: false,
                      error: null,
                    });
                  }
                } catch {
                  if (attempts < 5) {
                    setTimeout(poll, 1000);
                  } else {
                    setState({
                      firebaseUser,
                      user: null,
                      schoolId: null,
                      role: null,
                      loading: false,
                      error: null,
                    });
                  }
                }
              };
              setTimeout(poll, 500);
            }
          } catch (err) {
            console.error("Erro ao carregar dados do usuário:", err);
            setState({
              firebaseUser,
              user: null,
              schoolId: null,
              role: null,
              loading: false,
              error: "Erro ao carregar dados do usuário. Verifique sua conexão.",
            });
          }
        } else {
          setState({
            firebaseUser: null,
            user: null,
            schoolId: null,
            role: null,
            loading: false,
            error: null,
          });
        }
      });

      return unsubscribe;
    } catch (err) {
      console.error("Erro ao inicializar autenticação:", err);
      setState({
        firebaseUser: null,
        user: null,
        schoolId: null,
        role: null,
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
