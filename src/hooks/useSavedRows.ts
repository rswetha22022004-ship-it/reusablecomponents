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

/**
 * Table rows that people can add to from the website, saved in localStorage.
 * Each dashboard passes its own `storageKey`, so tables never mix.
 *
 * Later, swap the localStorage calls for API calls (POST the new row)
 * and nothing else in the app has to change.
 */
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
      /* ignore: rows still work for this session */
    }
  }, [storageKey, rows]);

  /** New rows go to the TOP so they are visible straight away. */
  const addRow = useCallback((row: T) => setRows((current) => [row, ...current]), []);

  /** Removes exactly this row object. */
  const removeRow = useCallback((row: T) => setRows((current) => current.filter((r) => r !== row)), []);

  /** Back to the original sample / API rows. */
  const resetRows = useCallback(() => setRows(initialRows), [initialRows]);

  return { rows, addRow, removeRow, resetRows };
}
