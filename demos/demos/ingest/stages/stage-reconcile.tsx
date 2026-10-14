"use client";

import { useMemo, useState } from "react";
import { Check, GitMerge, HelpCircle, Sparkles } from "lucide-react";
import { AgentStream } from "../components/agent-stream";
import { StageLayout } from "../components/stage-layout";
import { PlanCard } from "../components/plan-card";
import { Reveal } from "../components/reveal";
import { useAgentPlayer } from "../components/use-agent-player";
import { capacitorMembers, reviewCase } from "../lib/data";
import type { PlayerStep } from "../lib/types";

function ReviewCard() {
  const [choice, setChoice] = useState<string | null>(null);

  if (choice) {
    const chosen = reviewCase.candidates.find((candidate) => candidate.id === choice);
    return (
      <div className="rounded-2xl border border-online/30 bg-online/10 p-4">
        <div className="flex items-center gap-2 text-online">
          <Check className="h-4 w-4" />
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em]">
            Human decision recorded
          </p>
        </div>
        <p className="mt-2 text-[0.84rem] leading-relaxed text-ink-soft">
          {chosen
            ? `Cascade ${reviewCase.subject.rowId} merged into ${chosen.id}. The agent never guessed — and every future match learns from this.`
            : `Cascade ${reviewCase.subject.rowId} left unmatched and queued for a data steward. It stays out of the master until someone confirms it.`}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber/40 bg-surface p-4 shadow-[0_20px_50px_-34px_rgba(138,90,43,0.6)]">
      <div className="flex items-center gap-2 text-amber">
        <HelpCircle className="h-4 w-4" />
        <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em]">
          Needs your call
        </p>
      </div>

      <p className="mt-2.5 font-mono text-[0.72rem] text-ink-soft">
        {reviewCase.subject.source} · {reviewCase.subject.rowId}
      </p>
      <p className="mt-0.5 rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[0.76rem] text-ink">
        {reviewCase.subject.text}
      </p>
      <p className="mt-2.5 text-[0.82rem] leading-relaxed text-ink-soft">
        {reviewCase.question}
      </p>

      <div className="mt-3 space-y-2">
        {reviewCase.candidates.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            onClick={() => setChoice(candidate.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-canvas px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-amber">
              <GitMerge className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.8rem] font-medium text-ink">
                {candidate.label}
              </span>
              <span className="mt-1 flex items-center gap-2">
                <span className="h-1 w-24 overflow-hidden rounded-full bg-elevated">
                  <span
                    className="block h-full rounded-full bg-amber"
                    style={{ width: `${candidate.confidence * 100}%` }}
                  />
                </span>
                <span className="font-mono text-[0.58rem] text-muted">
                  {Math.round(candidate.confidence * 100)}% confidence
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setChoice("none")}
        className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        Leave unmatched
      </button>
    </div>
  );
}

export function StageReconcile({ stageIndex }: { stageIndex: number }) {
  const steps = useMemo<PlayerStep[]>(
    () => [
      {
        kind: "thought",
        text: "Now the real test: where do these six sources describe the very same physical part?",
      },
      {
        kind: "action",
        label: "Blocking and matching across sources",
        flash: "fuzzy_match(block_on(catalog))",
        result: "1,468 multi-source",
        ms: 1150,
      },
      {
        kind: "observe",
        text: "The 64 MFD capacitor is in all six catalogs — written six different ways, resolved to one part.",
      },
      {
        kind: "note",
        tone: "warn",
        text: "But not every match is obvious: one record is missing the exact attribute that separates two parts. I won't guess — that's a decision for the person who owns the data.",
      },
    ],
    [],
  );

  const player = useAgentPlayer(steps, { autoStart: true });

  return (
    <StageLayout
      artifactLabel="One cluster · six sources"
      stream={
        <AgentStream
          steps={steps}
          revealed={player.revealed}
          running={player.running}
          header={<PlanCard current={stageIndex} />}
          footer={
            <Reveal show={player.status === "done"}>
              <ReviewCard />
            </Reveal>
          }
        />
      }
      artifact={
        <div className="space-y-3">
          <div className="rounded-2xl border border-line-strong bg-surface p-4">
            <div className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-amber" />
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                Entity resolution · overlap
              </p>
            </div>

            <ul className="mt-3 space-y-1.5">
              {capacitorMembers.map((member, index) => (
                <Reveal
                  key={member.rowId}
                  show={player.revealed >= 2}
                  delay={index * 0.05}
                >
                  <li className="flex items-center gap-2.5 rounded-lg border border-line bg-canvas px-2.5 py-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-elevated font-mono text-[0.56rem] text-muted">
                      {member.source.split("_")[0].slice(0, 3).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[0.66rem] text-ink-soft">
                        {member.raw}
                      </span>
                      <span className="block font-mono text-[0.56rem] text-muted">
                        {member.source} · {member.rowId}
                      </span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal show={player.revealed >= 2} delay={0.1}>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-online/30 bg-online/10 px-3 py-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-online/15 text-online">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-online">
                    Resolved
                  </p>
                  <p className="truncate text-[0.82rem] font-medium text-ink">
                    RP-000001 · Start Capacitor · capacitance=64, voltage=370
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[0.62rem] text-online">
                  100%
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      }
    />
  );
}
