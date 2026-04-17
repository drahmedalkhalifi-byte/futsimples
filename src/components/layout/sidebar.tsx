"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Trophy,
  CalendarCheck,
  CalendarDays,
  FileBarChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { label: "Alunos",        href: "/alunos",        icon: Users },
  { label: "Presença",      href: "/presenca",      icon: CalendarCheck },
  { label: "Pagamentos",    href: "/pagamentos",    icon: CreditCard },
  { label: "Despesas",      href: "/gastos",        icon: Receipt },
  { label: "Agenda",        href: "/agenda",        icon: CalendarDays },
  { label: "Relatório",     href: "/relatorio",     icon: FileBarChart },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30 shrink-0">
          <Trophy className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-sidebar-foreground leading-tight truncate">FutSimples</p>
          <p className="text-[10px] text-sidebar-foreground/40 font-medium uppercase tracking-widest">Gestão</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all duration-150",
                isActive
                  ? "bg-primary shadow-sm shadow-primary/40"
                  : "bg-sidebar-foreground/8 group-hover:bg-sidebar-foreground/12"
              )}>
                <item.icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80")} />
              </div>
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/25 font-medium">v1.0.0</p>
      </div>
    </aside>
  );
}
