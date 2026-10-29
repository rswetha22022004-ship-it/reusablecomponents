import type { ReactNode } from "react";
import Card from "./Card";
import type { CardStyle } from "../../types/dashboard";

export interface ChartCardProps extends CardStyle {
  title: string;
  description?: string;
  height?: number | string;
  chart: ReactNode;
}


export default function ChartCard({ chart, ...cardProps }: ChartCardProps) {
  return <Card {...cardProps}>{chart}</Card>;
}
