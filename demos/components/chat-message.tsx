import type { Message } from "@/lib/types";
import { SERVICE_MANUAL } from "@/lib/mock-data";
import { ActivityBlock } from "./activity-block";
import { ManualCard } from "./manual-card";
import { PartCard } from "./part-card";
import { AvailabilityCard } from "./availability-card";
import { RecommendationCard } from "./recommendation-card";
import { CallbackCard } from "./callback-card";
import { Typewriter } from "./typewriter";
import { Download, FileText } from "lucide-react";

type ChatMessageProps = {
  message: Message;
  selectedManualIds?: string[];
  manualsLocked?: boolean;
  manualHint?: boolean;
  onToggleManual?: (id: string) => void;
  onLoadSelected?: () => void;
  onCitation?: (page: number) => void;
  onCheckAvailability?: () => void;
  onCallbackConfirm?: (choice: "yes" | "no", phone: string) => void;
};

export function ChatMessage({
  message,
  selectedManualIds = [],
  manualsLocked = true,
  manualHint = false,
  onToggleManual,
  onLoadSelected,
  onCitation,
  onCheckAvailability,
  onCallbackConfirm,
}: ChatMessageProps) {
  if (message.kind === "thinking") {
    return (
      <div className="flex justify-start">
        <div className="w-full max-w-[46rem]">
          <ActivityBlock
            steps={message.steps ?? []}
            seconds={message.seconds ?? 2}
            streaming={message.streaming}
          />
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[34rem] whitespace-pre-line rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[0.9rem] leading-relaxed text-canvas">
          {message.text}
        </div>
      </div>
    );
  }

  const selectedCount = selectedManualIds.length;

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[46rem] space-y-3">
        {message.text ? (
          <div className="whitespace-pre-line text-[0.92rem] leading-relaxed text-ink">
            <Typewriter text={message.text} />
          </div>
        ) : null}

        {message.kind === "manuals" && message.manuals ? (
          <div className="space-y-3">
            <div className="grid gap-2.5 sm:grid-cols-3">
              {message.manuals.map((manual) => (
                <ManualCard
                  key={manual.id}
                  manual={manual}
                  selected={selectedManualIds.includes(manual.id)}
                  recommended={manual.id === SERVICE_MANUAL.id}
                  disabled={manualsLocked}
                  hint={manualHint && manual.id === SERVICE_MANUAL.id}
                  onToggle={onToggleManual}
                />
              ))}
            </div>

            {!manualsLocked ? (
              <button
                type="button"
                onClick={() => onLoadSelected?.()}
                disabled={selectedCount === 0}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Download className="h-3.5 w-3.5" />
                {selectedCount > 0
                  ? `Load ${selectedCount} into context`
                  : "Select manuals to load"}
              </button>
            ) : null}
          </div>
        ) : null}

        {message.kind === "citations" && message.citations ? (
          <div className="flex flex-wrap gap-2">
            {message.citations.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onCitation?.(page)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <FileText className="h-3.5 w-3.5" />
                View p.{page}
              </button>
            ))}
          </div>
        ) : null}

        {message.kind === "part" && message.part ? (
          <PartCard
            partNumber={message.part.partNumber}
            description={message.part.description}
            onCheckAvailability={onCheckAvailability}
          />
        ) : null}

        {message.kind === "availability" && message.availability ? (
          <AvailabilityCard availability={message.availability} />
        ) : null}

        {message.kind === "recommendation" && message.recommendation ? (
          <RecommendationCard recommendation={message.recommendation} />
        ) : null}

        {message.kind === "callback" && message.callback ? (
          <CallbackCard
            callback={message.callback}
            onConfirm={onCallbackConfirm}
          />
        ) : null}
      </div>
    </div>
  );
}
