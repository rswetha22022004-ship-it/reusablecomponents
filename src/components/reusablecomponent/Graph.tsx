import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// recharts la erunthu above from nodemodules//

import type { DataRow, LineChartConfig } from "../../types/dashboard";

export interface GraphProps extends LineChartConfig {
  data: readonly DataRow[];
}


export default function Graph({
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
  strokeWidth = 2,
  showDots = true,
  curve = "monotone",
  tooltipStyle,
  emptyMessage = "No data to display.",
}: GraphProps) {
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
      <RechartsLineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        {showTooltip && <Tooltip contentStyle={tooltipStyle} />}
        {showLegend && <Legend wrapperStyle={{ color: axisColor, fontSize: 12 }} />}
        {series.map((s, index) => {
          const color = s.color ?? colors[index % colors.length];
          return (
            <Line
              key={s.dataKey}
              type={curve}
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              stroke={color}
              strokeWidth={strokeWidth}
              dot={showDots ? { r: 3, fill: color, strokeWidth: 0 } : false}
              activeDot={{ r: 5 }}
            />
          );
        })}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
