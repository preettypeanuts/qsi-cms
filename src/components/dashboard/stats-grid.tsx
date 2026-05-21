import type { DashboardStat } from "@/components/dashboard/dashboard-data";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatsGridProps = {
  stats: DashboardStat[];
  isLoading: boolean;
};

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.title} isLoading={isLoading} stat={stat} />
      ))}
    </section>
  );
}

function StatCard({
  stat,
  isLoading,
}: {
  stat: DashboardStat;
  isLoading: boolean;
}) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-slate-500 text-sm">{stat.title}</p>
            {isLoading ? (
              <Skeleton className="mt-3 h-8 w-16" />
            ) : (
              <p className="mt-2 font-semibold text-3xl">{stat.value}</p>
            )}
          </div>
          <div
            className={cn(
              "grid size-11 place-items-center rounded-2xl",
              stat.iconClassName,
            )}
          >
            <stat.icon className="size-5" />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="mt-4 h-4 w-36" />
        ) : (
          <p className="mt-4 text-slate-500 text-sm">{stat.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
