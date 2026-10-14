"use client";

import { motion } from "framer-motion";
import { Boxes, Radar, Search, ShieldCheck, ShoppingCart } from "lucide-react";
import { downstreamTools } from "@/demos/ingest/lib/data";

const ICONS: Record<string, typeof Search> = {
  search: Search,
  procure: ShoppingCart,
  risk: Radar,
  watch: ShieldCheck,
};

export function ToolStack() {
  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-4">
      <div className="flex items-center gap-2">
        <Boxes className="h-4 w-4 text-amber" />
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
          Built on the master
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {downstreamTools.map((tool, index) => {
          const Icon = ICONS[tool.id] ?? Boxes;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: index * 0.08 }}
              className="rounded-xl border border-line bg-canvas p-3"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-soft text-amber">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-[0.8rem] font-medium text-ink">
                  {tool.name}
                </p>
              </div>
              <p className="mt-1.5 text-[0.72rem] leading-snug text-muted">
                {tool.blurb}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
