"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Link2 } from "lucide-react";
import { CubeLoader } from "./cube-loader";
import type { SystemSource } from "@/demos/ingest/lib/types";

export type ConnectionStatus = "idle" | "syncing" | "connected";

function initials(name: string): string {
  return name
    .split(/[\s/·]+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatusChip({
  status,
  extra,
}: {
  status: ConnectionStatus;
  extra?: boolean;
}) {
  if (status === "connected") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-online/30 bg-online/10 px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.08em] text-online">
        {extra ? <Link2 className="h-3 w-3" /> : <Check className="h-3 w-3" />}
        {extra ? "Linked" : "Live"}
      </span>
    );
  }
  if (status === "syncing") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber/40 bg-amber-soft px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.08em] text-amber">
        <CubeLoader size={12} />
        Syncing
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-line px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
      Idle
    </span>
  );
}

export function ConnectionCard({
  system,
  status,
  delay = 0,
}: {
  system: SystemSource;
  status: ConnectionStatus;
  delay?: number;
}) {
  const tint =
    status === "connected"
      ? "border-online/30 bg-online/[0.04]"
      : status === "syncing"
        ? "border-amber/40 bg-amber-soft/40"
        : "border-line-strong bg-surface";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border p-3.5 transition-colors duration-300 ${tint}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas font-mono text-[0.6rem] font-medium text-ink">
          {initials(system.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.82rem] font-medium text-ink">
            {system.name}
          </p>
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-muted">
            {system.category}
          </p>
        </div>
        <StatusChip status={status} extra={system.extra} />
      </div>

      <p className="mt-2 font-mono text-[0.6rem] text-muted">{system.method}</p>
      <p className="mt-1 text-[0.72rem] leading-snug text-ink-soft">
        {system.note}
      </p>

      <AnimatePresence initial={false}>
        {status === "connected" ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 overflow-hidden font-mono text-[0.6rem] text-online"
          >
            {system.extra || !system.file
              ? "linked · context only"
              : `${system.records} rows → ${system.file}`}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
