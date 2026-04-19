"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Receipt, Trophy, Menu, CalendarCheck, CalendarDays, FileBarChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alunos", href: "/alunos", icon: Users },
  { label: "Presença", href: "/presenca", icon: CalendarCheck },
  { label: "Pagamentos", href: "/pagamentos", icon: CreditCard },
  { label: "Despesas", href: "/gastos", icon: Receipt },
  { label: "Agenda", href: "/agenda", icon: CalendarDays },
  { label: "Relatório",     href: "/relatorio",     icon: FileBarChart },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors"
      >
        <Menu className="w-5 h-5" />
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-6 h-16 flex flex-row items-center gap-3 border-b border-white/5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-xl blur-md opacity-50" />
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </div>
          <SheetTitle className="text-base font-black tracking-tight">
            FutSimples
          </SheetTitle>
        </SheetHeader>
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-white border border-primary/20"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
                  isActive ? "bg-primary shadow-md shadow-primary/50" : "bg-white/5"
                )}>
                  <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-foreground/50")} />
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
