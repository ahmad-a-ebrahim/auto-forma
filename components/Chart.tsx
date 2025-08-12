"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type BarKey = {
  dataKey: string;
  label?: string;
  color?: string;
};

type ChartBarLabelProps = {
  title?: string;
  description?: string;
  chartData: Record<string, any>[];
  xKey?: string;
  barKeys: BarKey[];
  tickFormatter?: (value: any) => string;
  showLabels?: boolean;
  maxBarSize?: number;
  stack?: boolean;
};

export default function ChartBarLabel({
  title,
  description,
  chartData,
  xKey = "month",
  barKeys,
  tickFormatter,
  showLabels = true,
  maxBarSize = 40,
  stack = false,
}: ChartBarLabelProps) {
  const chartConfig: Record<string, { label: string; color: string }> = {};
  barKeys.forEach((bk, i) => {
    chartConfig[bk.dataKey] = {
      label: bk.label ?? bk.dataKey,
      color: bk.color ?? `hsl(var(--chart-${i + 1}))`,
    };
  });

  const defaultTickFormatter = (value: any) => {
    if (typeof value === "string" && value.length > 16)
      return `${value.slice(0, 16)}...`;
    return String(value);
  };

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig as unknown as ChartConfig}>
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey={xKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={tickFormatter ?? defaultTickFormatter}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            {barKeys.map((bk) => (
              <Bar
                key={bk.dataKey}
                dataKey={bk.dataKey}
                name={bk.label ?? bk.dataKey}
                fill={bk.color ?? "hsl(var(--chart-1))"}
                radius={8}
                maxBarSize={maxBarSize}
                stackId={stack ? "a" : undefined}
              >
                {showLabels && (
                  <LabelList
                    dataKey={bk.dataKey}
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/*
 * EX: { "Male": 4, "Female": 3 } => [ { label: 'Male', value: 4 }, { label: 'Female', value: 3 } ]
 */
export function mapAnswersToChartData(
  answers: Record<string, number>,
  xKey = "label",
  valueKey = "value"
) {
  return Object.entries(answers).map(([k, v]) => ({
    [xKey]: k,
    [valueKey]: v,
  }));
}
