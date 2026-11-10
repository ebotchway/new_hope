"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  amount: {
    label: "Net Received",
    color: "var(--brand-primary, #0f766e)",
  },
} satisfies ChartConfig;

interface ReportsChartProps {
  data: { date: string; amount: number; formatted?: string }[];
  currencySymbol?: string;
  title?: string;
}

export function ReportsChart({ data, currencySymbol = "$", title = "Revenue Trend" }: ReportsChartProps) {
  const hasData = data.some((d) => d.amount > 0);

  return (
    <div className="relative rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-base text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Persisted financial receipts over time</p>
        </div>
      </div>

      {!hasData && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-center pt-8">
          <TrendingUp className="size-6 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No recorded transactions in this timeframe</p>
          <p className="text-xs text-muted-foreground/60">New fulfilled gifts will automatically populate here.</p>
        </div>
      )}

      <ChartContainer config={chartConfig} className={`h-64 w-full ${!hasData ? "opacity-30" : ""}`}>
        <AreaChart data={data} margin={{ left: 10, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="reportsRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-primary, #0f766e)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--brand-primary, #0f766e)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            tickFormatter={(value: string) =>
              new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            }
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: number) => `${currencySymbol}${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
                formatter={(value) => [`${currencySymbol}${Number(value).toFixed(2)}`, " received"]}
              />
            }
          />
          <Area
            dataKey="amount"
            type="monotone"
            fill="url(#reportsRevenueFill)"
            stroke="var(--brand-primary, #0f766e)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

