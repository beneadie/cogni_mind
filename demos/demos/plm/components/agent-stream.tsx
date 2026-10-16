"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Eye,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { CubeLoader } from "@/components/cube-loader";
import { Typewriter } from "@/components/typewriter";
import type { Tone, WorkBeat } from "../lib/flow";

const NOTE_STYLE: Record<
  Tone,
  { wrap: string; icon: string; Icon: typeof Lightbulb }
> = {
  info: {
    wrap: "border-line-strong bg-surface text-ink-soft",
    icon: "text-amber",
    Icon: Lightbulb,
  },
  warn: {
    wrap: "border-amber/40 bg-amber-soft text-amber",
    icon: "text-amber",
    Icon: AlertTriangle,
  },
  good: {
    wrap: "border-online/30 bg-online/10 text-online",
    icon: "text-online",
    Icon: Check,
  },
};

function BeatRow({
  beat,
  running,
}: {
  beat: WorkBeat;
  running: boolean;
}) {
  if (beat.kind === "thought") {
    return (
      <div className="flex gap-2.5">
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-amber">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <p className="pt-0.5 text-[0.88rem] leading-relaxed text-ink-soft">
          <Typewriter text={beat.text} />
        </p>
      </div>
    );
  }

  if (beat.kind === "observe") {
    return (
      <div className="ml-8 flex items-start gap-2.5 border-l-2 border-amber/60 pl-3.5">
        <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
        <p className="text-[0.84rem] leading-relaxed text-ink">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-amber">
            Noticed
          </span>
          <span className="ml-2">{beat.text}</span>
        </p>
      </div>
    );
  }

  if (beat.kind === "note") {
    const style = NOTE_STYLE[beat.tone ?? "info"];
    const Icon = style.Icon;
    return (
      <div
        className={`ml-8 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[0.82rem] leading-relaxed ${style.wrap}`}
      >
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} />
        <span>{beat.text}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {running ? (
            <CubeLoader size={16} />
          ) : (
            <Check className="h-3.5 w-3.5 text-online" />
          )}
        </span>
        <span className="text-[0.86rem] leading-snug text-ink">
          {beat.label}
        </span>
        {!running ? (
          <span className="ml-auto inline-flex shrink-0 items-center rounded-full border border-online/30 bg-online/10 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-online">
            {beat.result}
          </span>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {running && beat.command ? (
          <motion.div
            key="command"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden pl-[1.88rem]"
          >
            <code className="inline-flex items-center rounded-md border border-forest bg-forest px-2 py-1 font-mono text-[0.66rem] leading-none text-canvas/80">
              {beat.command}
            </code>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function AgentStream({
  beats,
  runningBeat,
  streaming,
  done,
  seconds,
}: {
  beats: WorkBeat[];
  runningBeat?: number;
  streaming?: boolean;
  done?: boolean;
  seconds?: number;
}) {
  const [open, setOpen] = useState(false);

  const body = (
    <div className="space-y-3">
      {beats.map((beat, index) => (
        <BeatRow
          key={`${index}-${beat.kind}`}
          beat={beat}
          running={!done && runningBeat === index}
        />
      ))}
    </div>
  );

  if (done && !streaming) {
    return (
      <div className="overflow-hidden rounded-2xl rounded-bl-md border border-dashed border-line-strong bg-elevated/50">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Sparkles className="h-4 w-4 text-amber" />
          <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-muted">
            Worked for {seconds ?? 1}
            {seconds === 1 ? " second" : " seconds"}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
            {open ? "Collapse" : `${beats.length} steps`}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="beats"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="border-t border-line px-4 py-3.5">{body}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl rounded-bl-md border border-line-strong bg-elevated/40 px-4 py-3.5">
      {body}
    </div>
  );
}
