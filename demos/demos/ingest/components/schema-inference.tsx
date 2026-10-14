"use client";

import { motion } from "framer-motion";
import { Table2 } from "lucide-react";
import { canonicalSchema } from "@/demos/ingest/lib/data";

export function SchemaInference() {
  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-4">
      <div className="flex items-center gap-2">
        <Table2 className="h-4 w-4 text-amber" />
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
          Schema · inferred, with confidence
        </p>
      </div>

      <ul className="mt-3 space-y-2.5">
        {canonicalSchema.map((field, index) => (
          <motion.li
            key={field.field}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.72rem] text-ink">
                {field.field}
              </span>
              <span className="font-mono text-[0.6rem] text-muted">
                {field.type}
              </span>
              <span className="ml-auto font-mono text-[0.58rem] text-muted">
                {Math.round(field.confidence * 100)}%
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-elevated">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${field.confidence * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  className="block h-full rounded-full bg-amber"
                />
              </span>
              <span className="max-w-[9rem] truncate font-mono text-[0.56rem] text-muted/80">
                {field.note}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
