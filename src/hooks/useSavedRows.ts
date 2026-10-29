import { useCallback, useEffect, useState } from "react";

function load<T>(storageKey: string, initialRows: readonly T[], isRow: (value: unknown) => value is T): readonly T[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return initialRows;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every(isRow) ? parsed : initialRows;
  } catch {
    return initialRows;
  }
}


export function useSavedRows<T>(
  storageKey: string,
  initialRows: readonly T[],
  isRow: (value: unknown) => value is T,
) {
  const [rows, setRows] = useState<readonly T[]>(() => load(storageKey, initialRows, isRow));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch {
    }
  }, [storageKey, rows]);

  const addRow = useCallback((row: T) => setRows((current) => [row, ...current]), []);

  
  const removeRow = useCallback((row: T) => setRows((current) => current.filter((r) => r !== row)), []);

  const resetRows = useCallback(() => setRows(initialRows), [initialRows]);

  return { rows, addRow, removeRow, resetRows };
}
