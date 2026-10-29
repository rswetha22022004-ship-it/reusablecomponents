import type { ReactNode } from "react";
import Card from "./Card";
import DataTable from "./DataTable";
import type { CardStyle, ColumnDef, TableStyle } from "../types/dashboard";

export interface TableCardProps<T extends object> {
  title: string;
  description?: string;
  columns: readonly ColumnDef<T>[];
  rows: readonly T[];
  getRowKey: (row: T, index: number) => string | number;
  /** If given, every row gets a Remove button. */
  onRemoveRow?: (row: T, index: number) => void;
  /** Look of the card around the table. */
  card?: CardStyle;
  /** Look of the table itself (height, header colours, row colours...). */
  table: TableStyle;
  /** Optional content shown between the title and the table, e.g. an add-row form. */
  toolbar?: ReactNode;
}

/** Card + DataTable. Card styling and table styling stay separate on purpose. */
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
