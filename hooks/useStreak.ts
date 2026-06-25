"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";

export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const refresh = async () => {
    const allCheckIns = await db.checkIns.toArray();
    const total = allCheckIns.reduce((s, c) => s + c.totalMinutes, 0);
    setTotalMinutes(total);

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const checkIn = await db.checkIns.get(dateStr);
      if (checkIn && checkIn.didMinimum) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    setCurrentStreak(streak);

    const dates = allCheckIns
      .filter((c) => c.didMinimum)
      .map((c) => c.date)
      .sort();
    let longest = 0;
    let current = 0;
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        current = 1;
      } else {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays =
          (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          current++;
        } else {
          current = 1;
        }
      }
      longest = Math.max(longest, current);
    }
    setLongestStreak(longest);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { currentStreak, longestStreak, totalMinutes, refresh };
}
