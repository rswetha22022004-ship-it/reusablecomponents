import type { ReactNode } from "react";
import type { StatsCardSize, StatsCardStyle, Trend } from "../../types/dashboard";

export interface StatsCardProps extends StatsCardStyle {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: Trend;
}

const SIZE_CLASSES: Record<StatsCardSize, { box: string; value: string; icon: string }> = {
  sm: { box: "p-3 gap-1", value: "text-xl", icon: "h-8 w-8" },
  md: { box: "p-4 gap-1.5", value: "text-2xl", icon: "h-10 w-10" },
  lg: { box: "p-6 gap-2", value: "text-4xl", icon: "h-12 w-12" },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  size = "md",
  background = "#ffffff",
  borderColor = "#e5e7eb",
  borderRadius = 12,
  titleColor = "#6b7280",
  valueColor = "#111827",
  iconColor = "#4f46e5",
  iconBackground = "#eef2ff",
  positiveColor = "#16a34a",
  negativeColor = "#dc2626",
  className = "",
}: StatsCardProps) {
  const sizeClasses = SIZE_CLASSES[size];

  let trendColor = positiveColor;
  let trendText = "";
  if (trend) {
    const isUp = trend.value >= 0;
    const isGood = isUp === (trend.higherIsBetter ?? true);
    trendColor = isGood ? positiveColor : negativeColor;
    trendText = `${isUp ? "▲" : "▼"} ${Math.abs(trend.value)}%`;
  }

  return (
    <div
      className={`flex min-w-0 items-start justify-between ${sizeClasses.box} ${className}`}
      style={{
        background,
        borderColor,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius,
      }}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-sm font-medium" style={{ color: titleColor }}>
          {title}
        </p>
        <p className={`font-semibold tracking-tight ${sizeClasses.value}`} style={{ color: valueColor }}>
          {value}
        </p>
        {trend && (
          <p className="text-xs font-medium" style={{ color: trendColor }}>
            {trendText}
            {trend.label && <span className="ml-1 font-normal opacity-80">{trend.label}</span>}
          </p>
        )}
      </div>
      {icon && (
        <div
          className={`flex shrink-0 items-center justify-center rounded-lg ${sizeClasses.icon}`}
          style={{ color: iconColor, background: iconBackground }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
