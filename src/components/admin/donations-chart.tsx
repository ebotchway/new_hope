"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  amount: {
    label: "Donations",
    color: "var(--brand-navy)",
  },
} satisfies ChartConfig;

export function DonationsChart({ data }: { data: { date: string; amount: number }[] }) {
  const hasData = data.some((d) => d.amount > 0);

  return (
    <div className="relative">
      {!hasData && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-center">
          <TrendingUp className="size-6 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No donations in this period yet</p>
          <p className="text-xs text-muted-foreground/70">The chart will fill in as gifts come in.</p>
        </div>
      )}
      <ChartContainer config={chartConfig} className={`h-64 w-full ${!hasData ? "opacity-40" : ""}`}>
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
        <defs>
          <linearGradient id="donationsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--brand-navy)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--brand-navy)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) =>
            new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
              formatter={(value) => [`$${(Number(value) / 100).toFixed(2)}`, " raised"]}
            />
          }
        />
        <Area
          dataKey="amount"
          type="monotone"
          fill="url(#donationsFill)"
          stroke="var(--brand-navy)"
          strokeWidth={2}
        />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
