import { useCallback, useEffect, useState } from "react";
import type { DashboardSettings } from "../types/dashboard";
import { sanitizeSettings } from "../utils/settings";

function load(storageKey: string, defaults: DashboardSettings): DashboardSettings {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? sanitizeSettings(JSON.parse(saved), defaults) : defaults;
  } catch {
    return defaults; // storage blocked or corrupt JSON: use the config values
  }
}

/**
 * Live, saved settings for ONE dashboard.
 * Each dashboard passes its own `storageKey`, so Admin and User keep
 * separate state and separate saved values.
 */
export function useDashboardSettings(storageKey: string, defaults: DashboardSettings) {
  const [settings, setSettings] = useState<DashboardSettings>(() => load(storageKey, defaults));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch {
      /* ignore: settings still work for this session */
    }
  }, [storageKey, settings]);

  const update = useCallback(
    <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) =>
      setSettings((current) => ({ ...current, [key]: value })),
    [],
  );

  const reset = useCallback(() => setSettings(defaults), [defaults]);

  return { settings, update, reset };
}
