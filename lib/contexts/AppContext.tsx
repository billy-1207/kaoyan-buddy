"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { db } from "@/lib/db";
import type { AppConfig } from "@/lib/plan-schema";

const AppConfigContext = createContext<{
  config: AppConfig | null;
  loading: boolean;
  updateConfig: (c: Partial<AppConfig>) => Promise<void>;
}>({ config: null, loading: true, updateConfig: async () => {} });

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.config.get("main").then((c) => {
      setConfig(c || null);
      setLoading(false);
    });
  }, []);

  const updateConfig = async (partial: Partial<AppConfig>) => {
    await db.config.update("main", partial);
    const updated = await db.config.get("main");
    setConfig(updated || null);
  };

  return (
    <AppConfigContext.Provider value={{ config, loading, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export const useAppConfig = () => useContext(AppConfigContext);
