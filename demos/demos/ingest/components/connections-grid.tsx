"use client";

import { Plug } from "lucide-react";
import {
  ConnectionCard,
  type ConnectionStatus,
} from "./connection-card";
import { systems } from "@/demos/ingest/lib/data";

/** Maps a system to the player step index that connects it.
 *  Step 0 is the opening thought; the six catalogs run 1–6, extras run 7. */
function stepFor(index: number): number {
  return systems[index].extra ? 7 : index + 1;
}

export function ConnectionsGrid({
  revealed,
  running,
}: {
  revealed: number;
  running: number;
}) {
  const statusFor = (index: number): ConnectionStatus => {
    const step = stepFor(index);
    if (running === step) return "syncing";
    if (revealed > step) return "connected";
    return "idle";
  };

  const connected = systems.filter(
    (_, index) => revealed > stepFor(index),
  ).length;

  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-4">
      <div className="flex items-center gap-2">
        <Plug className="h-4 w-4 text-amber" />
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
          Connected systems
        </p>
        <span className="ml-auto font-mono text-[0.6rem] text-muted">
          {connected}/{systems.length} live
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {systems.map((system, index) => (
          <ConnectionCard
            key={system.id}
            system={system}
            status={statusFor(index)}
            delay={index * 0.03}
          />
        ))}
      </div>
    </div>
  );
}
