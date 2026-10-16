"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { PromptOption } from "../lib/types";

export function SuggestedReplies({
  options,
  onSelect,
}: {
  options: PromptOption[];
  onSelect: (option: PromptOption) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.16em] text-muted">
        Suggested
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = chosen === option.id;
          const disabled = chosen !== null && !active;
          return (
            <button
              key={option.id}
              type="button"
              disabled={chosen !== null}
              onClick={() => {
                setChosen(option.id);
                onSelect(option);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default ${
                active
                  ? "border-accent/40 bg-accent-soft text-ink"
                  : disabled
                    ? "border-line bg-surface text-muted opacity-60"
                    : "border-line-strong bg-surface text-ink-soft hover:bg-elevated hover:text-ink"
              }`}
            >
              {active ? <Check className="h-3 w-3" /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
