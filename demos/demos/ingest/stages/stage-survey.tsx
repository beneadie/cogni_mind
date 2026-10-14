"use client";

import { useMemo } from "react";
import { Database, Files, Layers } from "lucide-react";
import { AgentStream } from "../components/agent-stream";
import { StageLayout } from "../components/stage-layout";
import { DiffMatrix } from "../components/diff-matrix";
import { PlanCard } from "../components/plan-card";
import { Reveal } from "../components/reveal";
import { useAgentPlayer } from "../components/use-agent-player";
import { CANONICAL_PARTS, TOTAL_RECORDS, TOTAL_SOURCES } from "../lib/data";
import type { PlayerStep } from "../lib/types";

const stats = [
  { icon: Files, label: "sources", value: String(TOTAL_SOURCES) },
  { icon: Database, label: "records", value: TOTAL_RECORDS.toLocaleString() },
  { icon: Layers, label: "true parts", value: `~${CANONICAL_PARTS.toLocaleString()}` },
];

export function StageSurvey({ stageIndex }: { stageIndex: number }) {
  const steps = useMemo<PlayerStep[]>(
    () => [
      {
        kind: "thought",
        text: "Six files from six suppliers. Before I trust a single row, I need to see exactly how they differ.",
      },
      {
        kind: "action",
        label: "Listing the incoming sources",
        flash: "glob('incoming/*.csv')",
        result: "6 files",
        ms: 900,
      },
      {
        kind: "observe",
        text: "Five files are comma-delimited English CSVs — and one is something else entirely.",
      },
      {
        kind: "action",
        label: "Sniffing each file's dialect",
        flash: "csv.Sniffer().sniff(sample)",
        result: "1 outlier · semicolon",
        ms: 1100,
      },
      {
        kind: "note",
        tone: "info",
        text: "Here's the picture: six sources, 3,873 records — and almost nothing in common.",
      },
      {
        kind: "note",
        tone: "good",
        text: "Survey complete. Six sources detected and understood — not one row touched by hand.",
      },
    ],
    [],
  );

  const player = useAgentPlayer(steps, { autoStart: true });

  return (
    <StageLayout
      artifactLabel="What the agent sees"
      stream={
        <AgentStream
          steps={steps}
          revealed={player.revealed}
          running={player.running}
          header={<PlanCard current={stageIndex} />}
        />
      }
      artifact={
        <div className="space-y-3">
          <Reveal show={player.revealed >= 1}>
            <div className="grid grid-cols-3 gap-2.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-line-strong bg-surface px-3 py-3"
                >
                  <stat.icon className="h-4 w-4 text-amber" />
                  <p className="mt-2 font-serif text-[1.5rem] leading-none text-ink">
                    {stat.value}
                  </p>
                  <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal show={player.revealed >= 2} delay={0.05}>
            <DiffMatrix />
          </Reveal>
        </div>
      }
    />
  );
}
