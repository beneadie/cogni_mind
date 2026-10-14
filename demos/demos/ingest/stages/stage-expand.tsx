"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  DollarSign,
  Quote,
  Sparkles,
  Table2,
  Zap,
} from "lucide-react";
import { AgentStream } from "../components/agent-stream";
import { StageLayout } from "../components/stage-layout";
import { PlanCard } from "../components/plan-card";
import { Reveal } from "../components/reveal";
import { ToolStack } from "../components/tool-stack";
import { useAgentPlayer } from "../components/use-agent-player";
import { masterRows, payoffQueries, valueStats } from "../lib/data";
import type { PlayerStep, ValueStat } from "../lib/types";

const VALUE_ICONS: Record<ValueStat["key"], typeof Sparkles> = {
  capability: Sparkles,
  cost: DollarSign,
  speed: Zap,
  quality: BadgeCheck,
};

function PayoffConsole() {
  const [active, setActive] = useState<string>(payoffQueries[0].id);
  const query = payoffQueries.find((item) => item.id === active) ?? payoffQueries[0];

  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-4">
      <div className="flex items-center gap-2">
        <Quote className="h-4 w-4 text-amber" />
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
          Ask the master
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {payoffQueries.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={`rounded-full border px-3 py-1 text-left font-mono text-[0.62rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              active === item.id
                ? "border-transparent bg-accent text-canvas"
                : "border-line text-ink-soft hover:bg-elevated"
            }`}
          >
            {item.question}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-line bg-canvas px-3.5 py-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
          Answer
        </p>
        <p className="mt-1 text-[0.92rem] font-medium text-ink">{query.answer}</p>
        <p className="mt-1 text-[0.78rem] leading-relaxed text-ink-soft">
          {query.detail}
        </p>
      </div>
    </div>
  );
}

export function StageExpand({ stageIndex }: { stageIndex: number }) {
  const steps = useMemo<PlayerStep[]>(
    () => [
      {
        kind: "thought",
        text: "The master is built — every messy row now points at one trusted part.",
      },
      {
        kind: "action",
        label: "Publishing the unified master",
        flash: "master.to_parquet('parts.parquet')",
        result: "1,500 parts",
        ms: 1000,
      },
      {
        kind: "note",
        tone: "good",
        text: "Every part carries its provenance — the exact source rows it came from. Nothing is a black box.",
      },
      {
        kind: "thought",
        text: "So what can the company do now that it simply couldn't before?",
      },
    ],
    [],
  );

  const player = useAgentPlayer(steps, { autoStart: true });

  return (
    <StageLayout
      artifactLabel="One source · and what it powers"
      stream={
        <AgentStream
          steps={steps}
          revealed={player.revealed}
          running={player.running}
          header={<PlanCard current={stageIndex} />}
          footer={
            <Reveal show={player.status === "done"}>
              <PayoffConsole />
            </Reveal>
          }
        />
      }
      artifact={
        <div className="space-y-3">
          <Reveal show={player.revealed >= 2}>
            <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <Table2 className="h-4 w-4 text-amber" />
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                  Unified master · sample
                </p>
              </div>
              <ul className="divide-y divide-line">
                {masterRows.map((row) => (
                  <li key={row.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.6rem] text-muted">
                        {row.id}
                      </span>
                      <span className="text-[0.82rem] font-medium text-ink">
                        {row.category}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[0.62rem] text-ink-soft">
                        ${row.low.toFixed(2)}
                        <span className="text-muted">
                          {row.suppliers > 1 ? `–$${row.high.toFixed(2)}` : ""}
                        </span>
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[0.64rem] text-muted">
                      {row.brand} · {row.specs}
                    </p>
                    <p className="mt-0.5 font-mono text-[0.58rem] text-online">
                      {row.provenance}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal show={player.status === "done"} delay={0.05}>
            <ToolStack />
          </Reveal>

          <Reveal show={player.status === "done"} delay={0.12}>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {valueStats.map((stat) => {
                const Icon = VALUE_ICONS[stat.key];
                return (
                  <div
                    key={stat.key}
                    className="rounded-2xl border border-line-strong bg-surface p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-soft text-amber">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                        {stat.label}
                      </p>
                    </div>
                    <p className="mt-2.5 font-serif text-[1.05rem] leading-snug text-ink">
                      {stat.metric}
                    </p>
                    <p className="mt-1.5 text-[0.74rem] leading-relaxed text-muted">
                      {stat.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      }
    />
  );
}
