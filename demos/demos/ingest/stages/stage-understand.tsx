"use client";

import { useMemo } from "react";
import { Languages, Ruler, Sigma } from "lucide-react";
import { AgentStream } from "../components/agent-stream";
import { StageLayout } from "../components/stage-layout";
import { PlanCard } from "../components/plan-card";
import { Reveal } from "../components/reveal";
import { SampleDrawer } from "../components/sample-drawer";
import { useAgentPlayer } from "../components/use-agent-player";
import { germanVocab } from "../lib/data";
import type { PlayerStep } from "../lib/types";

const traps = [
  { icon: Languages, text: "Category vocabulary is German — Schütz is a Contactor." },
  { icon: Ruler, text: "Decimals are commas, dimensions in mm, prices in EUR." },
  { icon: Sigma, text: "µF, MFD and “micro-farad” are the same unit." },
];

export function StageUnderstand({ stageIndex }: { stageIndex: number }) {
  const steps = useMemo<PlayerStep[]>(
    () => [
      {
        kind: "thought",
        text: "Headings can lie. I'll sample rows at random and confirm what I'm actually looking at.",
      },
      {
        kind: "action",
        label: "Drawing a random sample across sources",
        flash: "df.sample(30, random_state=0)",
        result: "30 rows",
        ms: 1000,
      },
      {
        kind: "observe",
        text: "The German file writes “µF” where the others write “MFD” — same unit, different notation.",
      },
      {
        kind: "observe",
        text: "Numbers use commas as decimal separators, and prices are in EUR, not dollars.",
      },
      {
        kind: "action",
        label: "Cross-checking the category vocabulary",
        flash: "set(de) - to_english(set(en))",
        result: "9 new terms",
        ms: 950,
      },
      {
        kind: "note",
        tone: "warn",
        text: "Three traps confirmed: comma decimals, EUR pricing, German categories. I'll normalise the surface before matching the meaning.",
      },
      {
        kind: "note",
        tone: "good",
        text: "I trusted the data over the headers — and verified my own assumptions before acting.",
      },
    ],
    [],
  );

  const player = useAgentPlayer(steps, { autoStart: true });

  return (
    <StageLayout
      artifactLabel="What the agent verified"
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
          <Reveal show={player.revealed >= 2}>
            <SampleDrawer />
          </Reveal>

          <Reveal show={player.revealed >= 5} delay={0.05}>
            <div className="rounded-2xl border border-line-strong bg-surface p-4">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                Vocabulary · resolved to canonical
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {germanVocab.slice(0, 8).map((entry) => (
                  <li
                    key={entry.term}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="truncate font-mono text-[0.7rem] text-ink-soft">
                      {entry.term}
                    </span>
                    <span className="shrink-0 font-mono text-[0.62rem] text-online">
                      {entry.canonical}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal show={player.revealed >= 6} delay={0.05}>
            <div className="rounded-2xl border border-amber/40 bg-amber-soft p-4">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-amber">
                Format traps
              </p>
              <ul className="mt-2.5 space-y-2">
                {traps.map((trap) => (
                  <li key={trap.text} className="flex items-start gap-2.5">
                    <trap.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                    <span className="text-[0.78rem] leading-snug text-amber">
                      {trap.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      }
    />
  );
}
