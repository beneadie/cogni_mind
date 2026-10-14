"use client";

import { motion } from "framer-motion";
import { Dices } from "lucide-react";
import { sampleRows } from "@/demos/ingest/lib/data";

const CELLS = 64;
const LIT = 30;

function litIndices(): number[] {
  const chosen: number[] = [];
  let seed = 7;
  while (chosen.length < LIT) {
    seed = (seed * 1103515245 + 12345) % 2147483647;
    const index = seed % CELLS;
    if (!chosen.includes(index)) chosen.push(index);
  }
  return chosen;
}

const LIT_SET = new Set(litIndices());

export function SampleDrawer() {
  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-4">
      <div className="flex items-center gap-2">
        <Dices className="h-4 w-4 text-amber" />
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
          Random sample · summit_climate.csv
        </p>
      </div>

      <div className="mt-3 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1">
        {Array.from({ length: CELLS }, (_, index) => {
          const lit = LIT_SET.has(index);
          return (
            <span
              key={index}
              className="relative h-2.5 w-full rounded-[2px] border border-line bg-elevated"
            >
              {lit ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.012,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-0 rounded-[2px] bg-amber"
                />
              ) : null}
            </span>
          );
        })}
      </div>

      <p className="mt-2 font-mono text-[0.6rem] text-muted">
        30 of 570 rows drawn · 0 parse failures
      </p>

      <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
        {sampleRows.map((row, index) => (
          <motion.li
            key={row.text}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.15 }}
          >
            <p className="font-mono text-[0.56rem] text-muted/80">
              {row.source}
            </p>
            <p className="truncate font-mono text-[0.68rem] text-ink-soft">
              {row.text}
            </p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
