"use client";

import { useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/contexts/auth-context";

export function Topbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const displayName = user?.name ?? "Usuário";
  const displayEmail = user?.email ?? "";
  const displayRole = user?.role === "admin" ? "Admin" : "Professor";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <MobileNav />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors outline-none">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {displayRole}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayEmail}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
