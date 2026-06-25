"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";

export function useProgress() {
  const [subjectProgress, setSubjectProgress] = useState<
    { id: string; name: string; color: string; percent: number }[]
  >([]);
  const [phaseProgress, setPhaseProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const subjects = await db.subjects.toArray();
      const phases = await db.phases.orderBy("order").toArray();
      const allTasks = await db.dailyTasks.toArray();

      const progress = subjects.map((s) => {
        const subjectTasks = allTasks.filter((t) => t.subjectId === s.id);
        const completed = subjectTasks.filter((t) => t.completed).length;
        const total = Math.max(subjectTasks.length, 1);
        return {
          id: s.id,
          name: s.name,
          color: s.color,
          percent: Math.round((completed / total) * 100),
        };
      });
      setSubjectProgress(progress);

      const today = new Date().toISOString().split("T")[0];
      const currentPhase = phases.find(
        (p) => today >= p.startDate && today <= p.endDate
      );
      if (currentPhase) {
        const totalDays =
          (new Date(currentPhase.endDate).getTime() -
            new Date(currentPhase.startDate).getTime()) /
          (1000 * 60 * 60 * 24);
        const elapsed =
          (new Date(today).getTime() -
            new Date(currentPhase.startDate).getTime()) /
          (1000 * 60 * 60 * 24);
        setPhaseProgress(Math.min(100, Math.round((elapsed / totalDays) * 100)));
      }
    })();
  }, []);

  return { subjectProgress, phaseProgress };
}
