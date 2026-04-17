"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Receipt, Trophy, Menu, CalendarCheck, CalendarDays, FileBarChart } from "lucide-react";
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
  { label: "Relatório", href: "/relatorio", icon: FileBarChart },
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
        <SheetHeader className="px-6 h-16 flex flex-row items-center gap-3 border-b">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Trophy className="w-4 h-4 text-primary-foreground" />
          </div>
          <SheetTitle className="text-base font-semibold tracking-tight">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
