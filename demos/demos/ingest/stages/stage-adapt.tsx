"use client";

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { AgentStream } from "../components/agent-stream";
import { StageLayout } from "../components/stage-layout";
import { PlanCard } from "../components/plan-card";
import { Reveal } from "../components/reveal";
import { SchemaInference } from "../components/schema-inference";
import { useAgentPlayer } from "../components/use-agent-player";
import { columnMapping } from "../lib/data";
import type { PlayerStep } from "../lib/types";

export function StageAdapt({ stageIndex }: { stageIndex: number }) {
  const steps = useMemo<PlayerStep[]>(
    () => [
      {
        kind: "thought",
        text: "Each source is shaped differently — so I'll write one adapter per source, instead of forcing a single parser that breaks on most of them.",
      },
      {
        kind: "action",
        label: "Parsing free-text descriptions into specs",
        flash: "parse_specs('CAP START 64MFD 370V')",
        result: "{mfd: 64, volts: 370}",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Translating German categories to canonical",
        flash: "CATEGORY_EN[category]",
        result: "9 mapped",
        ms: 900,
      },
      {
        kind: "action",
        label: "Mapping every column to the canonical schema",
        flash: "adapters[source].to_canonical(row)",
        result: "6 / 6 sources",
        ms: 1050,
      },
      {
        kind: "observe",
        text: "Six completely different shapes now produce the identical canonical row.",
      },
      {
        kind: "note",
        tone: "good",
        text: "One schema, six adapters — no shared header, delimiter, or language required.",
      },
    ],
    [],
  );

  const player = useAgentPlayer(steps, { autoStart: true });

  return (
    <StageLayout
      artifactLabel="What the agent concluded"
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
            <SchemaInference />
          </Reveal>

          <Reveal show={player.revealed >= 4} delay={0.05}>
            <div className="space-y-2">
              {columnMapping.map((mapping) => (
                <div
                  key={mapping.source}
                  className="rounded-2xl border border-line-strong bg-surface p-3.5"
                >
                  <p className="font-mono text-[0.64rem] text-amber">
                    {mapping.source}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {mapping.pairs.map((pair) => (
                      <li
                        key={pair.from}
                        className="flex items-center gap-2 font-mono text-[0.66rem]"
                      >
                        <span className="min-w-0 flex-1 truncate text-ink-soft">
                          {pair.from}
                        </span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-muted" />
                        <span className="min-w-0 flex-1 truncate text-right text-online">
                          {pair.to}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      }
    />
  );
}
