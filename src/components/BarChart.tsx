import { useMemo } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BarChartConfig, DataRow } from "../types/dashboard";

export interface BarChartProps extends BarChartConfig {
  data: readonly DataRow[];
}

export default function BarChart({
  data,
  height,
  width = "100%",
  colors,
  xAxisKey,
  series,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  gridColor = "#e5e7eb",
  axisColor = "#6b7280",
  barRadius = 4,
  barSize,
  stacked = false,
  tooltipStyle,
  emptyMessage = "No data to display.",
}: BarChartProps) {
  // Recharts expects a mutable array, so we copy once per data change.
  const chartData = useMemo(() => [...data], [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height, color: axisColor }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsBarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        {showTooltip && <Tooltip contentStyle={tooltipStyle} cursor={{ fill: gridColor, opacity: 0.3 }} />}
        {showLegend && <Legend wrapperStyle={{ color: axisColor, fontSize: 12 }} />}
        {series.map((s, index) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name ?? s.dataKey}
            fill={s.color ?? colors[index % colors.length]}
            stackId={stacked ? "stack" : undefined}
            barSize={barSize}
            radius={stacked ? 0 : [barRadius, barRadius, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
