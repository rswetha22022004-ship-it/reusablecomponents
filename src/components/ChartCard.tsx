import type { ReactNode } from "react";
import Card from "./Card";
import type { CardStyle } from "../types/dashboard";

export interface ChartCardProps extends CardStyle {
  title: string;
  description?: string;
  /** Optional fixed card height. Usually unnecessary: the chart sets its own height. */
  height?: number | string;
  /** Any chart element, e.g. <BarChart ... />, <Graph ... /> or <PieChart ... />. */
  chart: ReactNode;
}

/**
 * Thin wrapper: a Card whose content is a chart. Because the chart is passed in
 * as a prop, a new chart type never needs a new card component.
 */
export default function ChartCard({ chart, ...cardProps }: ChartCardProps) {
  return <Card {...cardProps}>{chart}</Card>;
}
