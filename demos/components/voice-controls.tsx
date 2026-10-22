"use client";

import { Mic, Square } from "lucide-react";

const VOICE_BARS = [
  { height: "35%", delay: "0ms" },
  { height: "70%", delay: "110ms" },
  { height: "100%", delay: "220ms" },
  { height: "60%", delay: "330ms" },
  { height: "40%", delay: "440ms" },
];

export function VoiceToggleButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Switch to voice mode"
      title="Switch to voice mode"
      className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-elevated text-ink-soft transition-colors hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <Mic className="h-4 w-4" />
    </button>
  );
}

export function VoiceRecordingPill({ onStop }: { onStop: () => void }) {
  return (
    <div className="mb-0.5 inline-flex h-9 shrink-0 items-center gap-2.5 rounded-full border border-line-strong bg-elevated px-3">
      <span
        className="voice-wave h-4 w-7 text-amber"
        aria-hidden="true"
      >
        {VOICE_BARS.map((bar) => (
          <span
            key={bar.delay}
            className="voice-wave__bar"
            style={{ height: bar.height, animationDelay: bar.delay }}
          />
        ))}
      </span>
      <span className="sr-only">Voice mode active</span>
      <button
        type="button"
        onClick={onStop}
        aria-label="Switch to text input"
        title="Switch to text input"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Square className="h-2.5 w-2.5 fill-current" />
      </button>
    </div>
  );
}
