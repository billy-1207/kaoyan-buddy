"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { db } from "@/lib/db";

export type TimerState = "idle" | "focusing" | "resting" | "paused";

export function usePomodoro() {
  const [state, setState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [focusDuration, setFocusDuration] = useState(25);
  const [restDuration, setRestDuration] = useState(5);
  const [selectedSubject, setSelectedSubject] = useState("math");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (type: "focusing" | "resting") => {
      clearTimer();
      setState(type);
      const duration = type === "focusing" ? focusDuration : restDuration;
      setSecondsLeft(duration * 60);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [focusDuration, restDuration, clearTimer]
  );

  const pause = useCallback(() => {
    clearTimer();
    setState("paused");
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (state === "paused") {
      setState("focusing");
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [state, clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    setState("idle");
    setSecondsLeft(focusDuration * 60);
  }, [focusDuration, clearTimer]);

  // Log session when timer completes
  useEffect(() => {
    if (secondsLeft === 0 && (state === "focusing" || state === "resting")) {
      const today = new Date().toISOString().split("T")[0];
      const actualDuration = state === "focusing" ? focusDuration : restDuration;
      db.pomodoroSessions.put({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: today,
        subjectId: selectedSubject,
        duration: actualDuration,
        targetDuration: actualDuration,
        completed: true,
        interrupted: false,
      });

      if (state === "focusing") {
        setState("resting");
        setSecondsLeft(restDuration * 60);
        intervalRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearTimer();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setState("idle");
        setSecondsLeft(focusDuration * 60);
      }
    }
  }, [secondsLeft, state, focusDuration, restDuration, selectedSubject, clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    state,
    secondsLeft,
    focusDuration,
    restDuration,
    selectedSubject,
    setFocusDuration,
    setRestDuration,
    setSelectedSubject,
    start,
    pause,
    resume,
    stop,
  };
}
