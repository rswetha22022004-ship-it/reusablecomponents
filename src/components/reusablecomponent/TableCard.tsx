import type { ReactNode } from "react";
import Card from "./Card";
import DataTable from "./DataTable";
import type { CardStyle, ColumnDef, TableStyle } from "../../types/dashboard";

export interface TableCardProps<T extends object> {
  title: string;
  description?: string;
  columns: readonly ColumnDef<T>[];
  rows: readonly T[];
  getRowKey: (row: T, index: number) => string | number;
  onRemoveRow?: (row: T, index: number) => void;
  card?: CardStyle;
  table: TableStyle;
  toolbar?: ReactNode;
}

export default function TableCard<T extends object>({
  title,
  description,
  columns,
  rows,
  getRowKey,
  onRemoveRow,
  card,
  table,
  toolbar,
}: TableCardProps<T>) {
  return (
    <Card title={title} description={description} {...card}>
      {toolbar}
      <DataTable columns={columns} rows={rows} getRowKey={getRowKey} onRemoveRow={onRemoveRow} {...table} />
    </Card>
  );
}
