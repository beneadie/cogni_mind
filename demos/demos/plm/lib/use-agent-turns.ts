"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlmMessage, TurnBeat, TurnPlan, WorkBeat } from "./flow";

const DEFAULT_MS = 560;
const CARD_GAP_MS = 520;

/**
 * Owns the chat thread and plays a turn as a sequence of beats: visible work
 * beats (thoughts, observations, notes, timed actions) accumulate into a work
 * block, and card beats post messages. All timers are tracked and cleared on
 * unmount/reset.
 */
export function useAgentTurns() {
  const [messages, setMessages] = useState<PlmMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const idRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);

  const nextId = useCallback(() => {
    idRef.current += 1;
    return `plm-${idRef.current}`;
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);

  const push = useCallback(
    (message: Omit<PlmMessage, "id">) =>
      setMessages((prev) => [...prev, { ...message, id: nextId() }]),
    [nextId],
  );

  const streamTurn = useCallback(
    (plan: TurnPlan) => {
      setIsThinking(true);

      let workId = nextId();
      let workCreated = false;
      let workCount = 0;
      let workStartedAt = 0;

      const ensureWork = () => {
        if (workCreated) return;
        workCreated = true;
        workCount = 0;
        workStartedAt = Date.now();
        const id = workId;
        setMessages((prev) => [
          ...prev,
          {
            id,
            role: "agent",
            kind: "work",
            beats: [],
            runningBeat: -1,
            streaming: true,
          },
        ]);
      };

      const appendBeat = (beat: WorkBeat) => {
        ensureWork();
        const index = workCount;
        workCount += 1;
        const id = workId;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === id
              ? { ...message, beats: [...(message.beats ?? []), beat] }
              : message,
          ),
        );
        return index;
      };

      const setRunning = (index: number) => {
        const id = workId;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === id ? { ...message, runningBeat: index } : message,
          ),
        );
      };

      const finishWork = () => {
        if (!workCreated) return;
        const seconds = Math.max(
          1,
          Math.round((Date.now() - workStartedAt) / 1000),
        );
        const id = workId;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === id
              ? {
                  ...message,
                  streaming: false,
                  done: true,
                  runningBeat: -1,
                  seconds,
                }
              : message,
          ),
        );
        workCreated = false;
      };

      let index = 0;

      const runNext = () => {
        if (index >= plan.beats.length) {
          finishWork();
          after(240, () => {
            setIsThinking(false);
            plan.onDone?.();
          });
          return;
        }

        const beat: TurnBeat = plan.beats[index];
        index += 1;

        if (beat.kind === "card") {
          finishWork();
          push(beat.message);
          after(CARD_GAP_MS, () => {
            workId = nextId();
            runNext();
          });
          return;
        }

        if (beat.kind === "subagents") {
          finishWork();
          after(beat.launchDelayMs ?? 0, () => {
            push({
              role: "agent",
              kind: "subagents",
              subagents: beat.agents,
            });
            after(beat.ms, () => {
              workId = nextId();
              runNext();
            });
          });
          return;
        }

        if (beat.kind === "text") {
          finishWork();
          push({ role: "agent", kind: "text", text: beat.text });
          after(CARD_GAP_MS, () => {
            workId = nextId();
            runNext();
          });
          return;
        }

        if (beat.kind === "action") {
          const beatIndex = appendBeat(beat);
          setRunning(beatIndex);
          after(beat.ms, () => {
            setRunning(-1);
            after(beat.ms2 ?? 320, runNext);
          });
          return;
        }

        appendBeat(beat);
        after(beat.ms ?? DEFAULT_MS, runNext);
      };

      after(200, runNext);
    },
    [after, nextId, push],
  );

  const reset = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    setMessages([]);
    setIsThinking(false);
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return { messages, setMessages, isThinking, push, streamTurn, reset, nextId };
}
