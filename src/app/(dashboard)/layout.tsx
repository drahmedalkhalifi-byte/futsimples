"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseUser, loading, error, isReady, schoolId, subscriptionStatus, trialDaysLeft } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser && !error) {
      router.replace("/login");
      return;
    }
    if (firebaseUser && !firebaseUser.emailVerified) {
      router.replace("/verificar-email");
      return;
    }
    if (firebaseUser && !schoolId && !error) {
      router.replace("/setup");
    }
  }, [firebaseUser, loading, error, schoolId, router]);

  if (loading || (firebaseUser && !isReady && !error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-base font-semibold text-foreground mb-1">Erro de conexão</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!isReady) return null;

  // Trial expired → redirect to subscription page
  if (subscriptionStatus === "expired") {
    router.replace("/assinar");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar />

        {/* Trial banner */}
        {subscriptionStatus === "trial" && trialDaysLeft !== null && (
          <div className="bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              {trialDaysLeft === 1
                ? "Seu período de teste termina amanhã!"
                : `Seu período de teste termina em ${trialDaysLeft} dias.`}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-white/60 text-white hover:bg-white/10 hover:text-white shrink-0 h-7 text-xs"
              onClick={() => router.push("/assinar")}
            >
              Assinar agora
            </Button>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
