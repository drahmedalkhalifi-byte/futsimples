"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseUser, loading, error, isReady, schoolId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // Not logged in → login page
    if (!firebaseUser && !error) {
      router.replace("/login");
      return;
    }
    // Logged in but no Firestore user doc → setup not complete
    if (firebaseUser && !schoolId && !error) {
      router.replace("/setup");
    }
  }, [firebaseUser, loading, error, schoolId, router]);

  // Show spinner while Firebase resolves auth state OR while Firestore doc loads
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
          <h2 className="text-base font-semibold text-foreground mb-1">
            Erro de conexão
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Only render dashboard once auth is fully ready (firebaseUser + schoolId resolved)
  if (!isReady) return null;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
