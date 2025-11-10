import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ title, value, icon: Icon, trend, trendPositive, iconClassName }) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">{value}</h3>
            {trend && (
              <p
                className={`text-sm mt-2 ${
                  trendPositive ? "text-success" : "text-destructive"
                }`}
              >
                {trend}
              </p>
            )}
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Icon className={cn("h-7 w-7 text-primary", iconClassName)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
