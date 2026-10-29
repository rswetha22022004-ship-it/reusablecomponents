import { useMemo } from "react";
import {
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DataRow, PieChartConfig } from "../types/dashboard";

export interface PieChartProps extends PieChartConfig {
  data: readonly DataRow[];
}

export default function PieChart({
  data,
  height,
  width = "100%",
  colors,
  dataKey,
  nameKey,
  innerRadius = 0,
  outerRadius = "80%",
  paddingAngle = 0,
  showLegend = true,
  showTooltip = true,
  legendColor = "#6b7280",
  tooltipStyle,
  emptyMessage = "No data to display.",
}: PieChartProps) {
  // Give every slice its own colour through the `fill` field.
  // This replaces the older <Cell> pattern and keeps colours fully prop-driven.
  const slices = useMemo(
    () => data.map((row, index) => ({ ...row, fill: colors[index % colors.length] })),
    [data, colors],
  );

  if (slices.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height, color: legendColor }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsPieChart>
        <Pie
          data={slices}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          stroke="none"
        />
        {showTooltip && <Tooltip contentStyle={tooltipStyle} />}
        {showLegend && <Legend wrapperStyle={{ color: legendColor, fontSize: 12 }} />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
