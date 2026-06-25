"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { db } from "@/lib/db";
import type { DailyTask } from "@/lib/plan-schema";
import { generateTodayTasks } from "@/lib/seed";

const TodayContext = createContext<{
  tasks: DailyTask[];
  loading: boolean;
  refreshTasks: () => Promise<void>;
}>({ tasks: [], loading: true, refreshTasks: async () => {} });

export function TodayProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTasks = async () => {
    const today = new Date().toISOString().split("T")[0];
    await generateTodayTasks(today);
    const todaysTasks = await db.dailyTasks
      .where("date")
      .equals(today)
      .toArray();
    setTasks(todaysTasks);
  };

  useEffect(() => {
    refreshTasks().then(() => setLoading(false));
  }, []);

  return (
    <TodayContext.Provider value={{ tasks, loading, refreshTasks }}>
      {children}
    </TodayContext.Provider>
  );
}

export const useToday = () => useContext(TodayContext);
