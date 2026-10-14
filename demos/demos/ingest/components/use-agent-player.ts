"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayStatus, PlayerStep } from "@/demos/ingest/lib/types";

const DEFAULT_MS = 520;

/**
 * Drives the "watch the agent think" stream: reveals steps one at a time,
 * holds each code step in a running state for `runMs`, then releases its
 * output. All timers are tracked and cleared on unmount/reset — never leaked.
 */
export function useAgentPlayer(
  steps: PlayerStep[],
  options?: { autoStart?: boolean },
) {
  const [revealed, setRevealed] = useState(0);
  const [running, setRunning] = useState(-1);
  const [status, setStatus] = useState<PlayStatus>("idle");

  const timeoutsRef = useRef<number[]>([]);
  const activeRef = useRef(false);

  const clear = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      if (activeRef.current) fn();
    }, ms);
    timeoutsRef.current.push(id);
  }, []);

  const reset = useCallback(() => {
    activeRef.current = false;
    clear();
    setRevealed(0);
    setRunning(-1);
    setStatus("idle");
  }, [clear]);

  const start = useCallback(() => {
    clear();
    activeRef.current = true;
    setRevealed(0);
    setRunning(-1);
    setStatus("playing");

    const run = (index: number) => {
      if (!activeRef.current) return;
      if (index >= steps.length) {
        setStatus("done");
        return;
      }

      const step = steps[index];
      setRevealed(index + 1);

      if (step.kind === "action") {
        setRunning(index);
        after(step.ms, () => {
          setRunning(-1);
          after(step.ms2 ?? 380, () => run(index + 1));
        });
      } else {
        after(step.ms ?? DEFAULT_MS, () => run(index + 1));
      }
    };

    after(200, () => run(0));
  }, [after, clear, steps]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      clear();
    };
  }, [clear]);

  useEffect(() => {
    if (!options?.autoStart) return;
    const id = window.setTimeout(() => start(), 240);
    return () => window.clearTimeout(id);
  }, [options?.autoStart, start]);

  return { revealed, running, status, start, reset };
}
