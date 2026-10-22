"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Eye,
  FileSearch,
  FileSpreadsheet,
  Lightbulb,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CubeLoader } from "@/components/cube-loader";
import type { SubagentSpec, WorkBeat } from "../lib/flow";

const AGENT_ICON = {
  compliance: ShieldCheck,
  manual: FileSearch,
  sheet: FileSpreadsheet,
} as const;

const AGENT_STYLE = {
  compliance: {
    top: "border-danger/70",
    tint: "bg-danger-soft/15",
    badge: "border-danger/30 bg-danger-soft text-danger",
    finding: "border-danger/40 bg-danger-soft/40 text-ink-soft",
  },
  manual: {
    top: "border-gold/70",
    tint: "bg-amber-soft/15",
    badge: "border-amber/30 bg-amber-soft text-amber",
    finding: "border-amber/40 bg-amber-soft/40 text-ink-soft",
  },
  sheet: {
    top: "border-online/70",
    tint: "bg-online/5",
    badge: "border-online/30 bg-online/10 text-online",
    finding: "border-online/40 bg-online/10 text-ink-soft",
  },
} as const;

const BEAT_MS = 1300;
const DONE_HOLD_MS = 700;

type AgentProgress = {
  completed: number;
  done: boolean;
};

function BeatRow({ beat, running }: { beat: WorkBeat; running: boolean }) {
  if (beat.kind === "action") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {running ? (
              <CubeLoader size={13} />
            ) : (
              <Check className="h-3 w-3 text-online" />
            )}
          </span>
          <span
            className={`min-w-0 flex-1 truncate text-[0.68rem] ${
              running ? "text-ink" : "text-ink-soft"
            }`}
          >
            {beat.label}
          </span>
          {!running ? (
            <span className="shrink-0 rounded-full border border-line bg-canvas px-1.5 py-0.5 font-mono text-[0.46rem] uppercase tracking-[0.05em] text-muted">
              {beat.result}
            </span>
          ) : null}
        </div>
        {beat.command ? (
          <code
            className={`ml-5 inline-flex max-w-full truncate rounded-md border px-1.5 py-0.5 font-mono text-[0.52rem] leading-none ${
              running
                ? "border-line-strong bg-canvas text-ink-soft"
                : "border-line bg-canvas/60 text-muted"
            }`}
          >
            {beat.command}
          </code>
        ) : null}
      </motion.div>
    );
  }

  if (beat.kind === "observe") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex items-start gap-1.5"
      >
        <Eye className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber" />
        <p className="text-[0.64rem] leading-relaxed text-ink-soft">
          {beat.text}
        </p>
      </motion.div>
    );
  }

  if (beat.kind === "thought") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex items-start gap-1.5"
      >
        <Sparkles className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber" />
        <p className="text-[0.64rem] leading-relaxed text-ink-soft">
          {beat.text}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex items-start gap-1.5"
    >
      <Lightbulb className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber" />
      <p className="text-[0.64rem] leading-relaxed text-ink-soft">
        {beat.text}
      </p>
    </motion.div>
  );
}

function AgentColumn({
  agent,
  progress,
}: {
  agent: SubagentSpec;
  progress: AgentProgress;
}) {
  const Icon = AGENT_ICON[agent.icon];
  const style = AGENT_STYLE[agent.icon];
  const running = !progress.done && progress.completed < agent.beats.length;
  const visibleCount = progress.done
    ? agent.beats.length
    : Math.min(agent.beats.length, progress.completed + (running ? 1 : 0));

  return (
    <div
      className={`flex h-full flex-col border-t-2 ${style.top} ${style.tint} p-3`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${style.badge}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {running ? (
            <span
              className={`absolute inset-0 animate-ping rounded-md border ${style.badge}`}
            />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.72rem] font-medium text-ink">
            {agent.name}
          </p>
          <p className="mt-0.5 truncate text-[0.58rem] text-muted">
            {agent.role}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[0.46rem] uppercase tracking-[0.06em] text-muted">
          {progress.done ? (
            <>
              <Check className="h-2.5 w-2.5 text-online" />
              Done
            </>
          ) : running ? (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
              Live
            </>
          ) : (
            "Waiting"
          )}
        </span>
      </div>

      <div className="mt-2 space-y-1.5">
        {agent.beats.slice(0, visibleCount).map((beat, index) => (
          <BeatRow
            key={index}
            beat={beat}
            running={!progress.done && index === progress.completed}
          />
        ))}

        {progress.done ? (
          <motion.p
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className={`mt-2 border-l-2 px-2 py-1.5 text-[0.64rem] leading-relaxed ${style.finding}`}
          >
            {agent.finding}
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}

export function SubagentRun({
  agents,
  onComplete,
}: {
  agents: SubagentSpec[];
  onComplete: (id: string) => void;
}) {
  const [progress, setProgress] = useState<Record<string, AgentProgress>>(
    () =>
      Object.fromEntries(
        agents.map((agent) => [agent.id, { completed: 0, done: false }]),
      ),
  );
  const timersRef = useRef<number[]>([]);
  const completedRef = useRef<Set<string>>(new Set());
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    agents.forEach((agent) => {
      agent.beats.forEach((_beat, beatIndex) => {
        const revealAt = (beatIndex + 1) * BEAT_MS;
        timersRef.current.push(
          window.setTimeout(() => {
            setProgress((prev) => {
              const current = prev[agent.id];
              if (!current || current.done) return prev;
              return {
                ...prev,
                [agent.id]: {
                  ...current,
                  completed: Math.min(agent.beats.length, beatIndex + 1),
                },
              };
            });
          }, revealAt),
        );
      });

      const doneAt = agent.beats.length * BEAT_MS + DONE_HOLD_MS;
      timersRef.current.push(
        window.setTimeout(() => {
          setProgress((prev) => ({
            ...prev,
            [agent.id]: { ...prev[agent.id], done: true },
          }));
          if (!completedRef.current.has(agent.id)) {
            completedRef.current.add(agent.id);
            onCompleteRef.current(agent.id);
          }
        }, doneAt),
      );
    });

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [agents]);

  const totals = useMemo(() => {
    const total = agents.reduce((sum, agent) => sum + agent.beats.length, 0);
    const completed = Object.values(progress).reduce(
      (sum, entry) => sum + entry.completed,
      0,
    );
    const done = Object.values(progress).filter((entry) => entry.done).length;
    return {
      total,
      completed,
      done,
      running: agents.length - done,
      pct: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [agents, progress]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-elevated/40">
      <div className="flex items-center gap-2.5 border-b border-line bg-surface px-3 py-2">
        <CubeLoader size={22} />
        <div className="min-w-0 flex-1">
          <p className="text-[0.76rem] font-medium text-ink">Orchestrator</p>
          <p className="mt-0.5 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-muted">
            Delegating {agents.length} specialist checks
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.08em] text-ink-soft">
            {totals.done}/{agents.length} complete
          </p>
          <p className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-muted">
            {totals.running > 0 ? `${totals.running} running` : "all clear"}
          </p>
        </div>
      </div>

      <div className="h-0.5 bg-line">
        <motion.div
          className="h-full bg-gold"
          animate={{ width: `${totals.pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {agents.map((agent) => (
          <AgentColumn
            key={agent.id}
            agent={agent}
            progress={progress[agent.id] ?? { completed: 0, done: false }}
          />
        ))}
      </div>
    </div>
  );
}
