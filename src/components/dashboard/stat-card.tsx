import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = "bg-primary/10 text-primary",
}: StatCardProps) {
  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-[--success]" : "text-destructive"
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value} vs mês anterior
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              accentColor
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
