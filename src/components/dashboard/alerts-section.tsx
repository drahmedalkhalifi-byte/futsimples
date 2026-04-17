"use client";

import { AlertCircle, CalendarDays, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const overduePayments = [
  { student: "Lucas Mendes", amount: "R$ 180,00", dueDate: "05/04/2026" },
  { student: "Ana Carolina", amount: "R$ 180,00", dueDate: "05/04/2026" },
  { student: "Pedro Oliveira", amount: "R$ 120,00", dueDate: "01/04/2026" },
];

const upcomingGames = [
  {
    title: "Jogo vs Palmeiras Sub9",
    date: "18/04/2026",
    time: "15:00",
    location: "Campo Municipal",
  },
  {
    title: "Jogo vs Santos Sub13",
    date: "22/04/2026",
    time: "10:00",
    location: "Arena Escola",
  },
];

export function AlertsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pagamentos Atrasados */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <CardTitle className="text-base font-semibold">
              Pagamentos Atrasados
            </CardTitle>
            <Badge
              variant="destructive"
              className="ml-auto text-xs font-medium"
            >
              {overduePayments.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {overduePayments.map((payment, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-destructive/5 border border-destructive/10"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {payment.student}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vencimento: {payment.dueDate}
                  </p>
                </div>
                <span className="text-sm font-semibold text-destructive">
                  {payment.amount}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Jogos */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Próximos Jogos
            </CardTitle>
            <Badge variant="secondary" className="ml-auto text-xs font-medium">
              {upcomingGames.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {upcomingGames.map((game, i) => (
              <div
                key={i}
                className="py-2.5 px-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <p className="text-sm font-medium text-foreground">
                  {game.title}
                </p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="w-3 h-3" />
                    {game.date}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {game.time}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {game.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
