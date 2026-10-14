"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Eye,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { CubeLoader } from "./cube-loader";
import { Typewriter } from "./typewriter";
import { useCommands } from "./command-context";
import type { PlayerStep, Tone } from "@/demos/ingest/lib/types";

function Thought({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-3"
    >
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-amber">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <p className="pt-0.5 text-[0.9rem] leading-relaxed text-ink-soft">
        <Typewriter text={text} />
      </p>
    </motion.div>
  );
}

function Observation({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="ml-9 flex items-start gap-2.5 border-l-2 border-amber/60 pl-3.5"
    >
      <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
      <p className="text-[0.84rem] leading-relaxed text-ink">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-amber">
          Noticed
        </span>
        <span className="ml-2">{text}</span>
      </p>
    </motion.div>
  );
}

const NOTES: Record<Tone, { wrap: string; icon: string; Icon: typeof Lightbulb }> = {
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

function Note({ text, tone }: { text: string; tone: Tone }) {
  const style = NOTES[tone];
  const Icon = style.Icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`ml-9 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[0.82rem] leading-relaxed ${style.wrap}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} />
      <span>{text}</span>
    </motion.div>
  );
}

function ActionFlash({
  step,
  running,
}: {
  step: Extract<PlayerStep, { kind: "action" }>;
  running: boolean;
}) {
  const { showCommands } = useCommands();
  const showFlash = Boolean(step.flash) && (running || showCommands);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-1.5"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {running ? (
            <CubeLoader size={16} />
          ) : (
            <Check className="h-3.5 w-3.5 text-online" />
          )}
        </span>
        <span className="text-[0.86rem] leading-snug text-ink">
          {step.label}
        </span>
        <AnimatePresence>
          {!running ? (
            <motion.span
              key="result"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="ml-auto inline-flex shrink-0 items-center rounded-full border border-online/30 bg-online/10 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-online"
            >
              {step.result}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {showFlash ? (
          <motion.div
            key="flash"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: running ? 1 : 0.5, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden pl-[1.88rem]"
          >
            <code className="inline-flex items-center rounded-md border border-forest bg-forest px-2 py-1 font-mono text-[0.66rem] leading-none text-canvas/80">
              {step.flash}
            </code>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function AgentStream({
  steps,
  revealed,
  running,
  header,
  footer,
}: {
  steps: PlayerStep[];
  revealed: number;
  running: number;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {header}
      {steps.slice(0, revealed).map((step, index) => {
        if (step.kind === "thought") {
          return <Thought key={index} text={step.text} />;
        }
        if (step.kind === "observe") {
          return <Observation key={index} text={step.text} />;
        }
        if (step.kind === "note") {
          return <Note key={index} text={step.text} tone={step.tone ?? "info"} />;
        }
        return <ActionFlash key={index} step={step} running={running === index} />;
      })}
      {footer}
    </div>
  );
}
