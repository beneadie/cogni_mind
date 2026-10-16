"use client";

import { Typewriter } from "@/components/typewriter";
import type { PlmMessage } from "../lib/flow";
import { AgentStream } from "./agent-stream";
import {
  ApprovalCard,
  DataSheetCard,
  DiffCard,
  DocHealthCard,
  ExceptionsCard,
  LegacyCard,
  ManualChangesCard,
  ProposalCard,
  PropagationCard,
  PublishSummaryCard,
  RegulationCard,
  SourceCard,
  UploadCard,
} from "./plm-cards";
import {
  ConnectionsCard,
  IngestNotesCard,
  MasterCard,
} from "./ingest-cards";
import {
  ChangePropagationCard,
  ChangeProposalCard,
  QueueRegulationCard,
} from "./queue-cards";
import { SuggestedReplies } from "./suggested-replies";
import { DocDiff } from "./doc-diff";
import { WarningBlock } from "./warning-block";
import type { QueueCardAction } from "../lib/types";

function FindingBlock({
  text,
  emphasis,
}: {
  text: string;
  emphasis?: string;
}) {
  const index = emphasis ? text.indexOf(emphasis) : -1;
  const before = index >= 0 ? text.slice(0, index) : text;
  const match = index >= 0 ? text.slice(index, index + (emphasis ?? "").length) : "";
  const after = index >= 0 ? text.slice(index + (emphasis ?? "").length) : "";

  return (
    <div className="rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3.5">
      <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-amber">
        Finding
      </p>
      <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-soft">
        {before}
        {match ? (
          <strong className="font-semibold text-ink">{match}</strong>
        ) : null}
        {after}
      </p>
    </div>
  );
}

export type MessageHandlers = {
  resolvedFlagIds: string[];
  resolvedValues: Record<string, string>;
  publishedDocIds: string[];
  onOpenFlag: (flagId: string) => void;
  onOpenSource: (doc: "spec" | "manual", lineIds: string[]) => void;
  onHoverSource: (lineIds: string[]) => void;
  onOpenPdf: (docId: string, page: number) => void;
  onQueueAction: (action: QueueCardAction, payload?: string) => void;
};

export function PlmChatMessage({
  message,
  handlers,
}: {
  message: PlmMessage;
  handlers: MessageHandlers;
}) {
  if (message.kind === "work") {
    return (
      <div className="flex justify-start">
        <div className="w-full max-w-[46rem]">
          <AgentStream
            beats={message.beats ?? []}
            runningBeat={message.runningBeat}
            streaming={message.streaming}
            done={message.done}
            seconds={message.seconds}
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

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[46rem] space-y-3">
        {message.text && message.kind !== "finding" && message.kind !== "warning" ? (
          <div className="whitespace-pre-line text-[0.92rem] leading-relaxed text-ink">
            <Typewriter text={message.text} />
          </div>
        ) : null}

        {message.kind === "finding" && message.text ? (
          <FindingBlock text={message.text} emphasis={message.emphasis} />
        ) : null}

        {message.kind === "warning" && message.text ? (
          <WarningBlock
            title={message.title}
            text={message.text}
            emphasis={message.emphasis}
            items={message.items}
          />
        ) : null}

        {message.kind === "upload" ? (
          <UploadCard onOpen={() => handlers.onOpenPdf("dl-2400-spec", 1)} />
        ) : null}

        {message.kind === "source" && message.sourceId ? (
          <SourceCard sourceId={message.sourceId} onOpen={handlers.onOpenPdf} />
        ) : null}

        {message.kind === "connections" ? <ConnectionsCard /> : null}

        {message.kind === "ingest-notes" ? <IngestNotesCard /> : null}

        {message.kind === "master" ? <MasterCard /> : null}

        {message.kind === "datasheet" ? (
          <DataSheetCard
            resolvedFlagIds={handlers.resolvedFlagIds}
            resolvedValues={handlers.resolvedValues}
            onOpenFlag={handlers.onOpenFlag}
            onOpenSource={(lineIds) => handlers.onOpenSource("spec", lineIds)}
            onHoverSource={handlers.onHoverSource}
          />
        ) : null}

        {message.kind === "exceptions" ? (
          <ExceptionsCard
            resolvedFlagIds={handlers.resolvedFlagIds}
            resolvedValues={handlers.resolvedValues}
            onReview={handlers.onOpenFlag}
          />
        ) : null}

        {message.kind === "proposal" && message.proposalId ? (
          <ProposalCard
            proposalId={message.proposalId}
            resolvedFlagIds={handlers.resolvedFlagIds}
          />
        ) : null}

        {message.kind === "diff" ? (
          <DiffCard
            resolvedFlagIds={handlers.resolvedFlagIds}
            resolvedValues={handlers.resolvedValues}
            onOpenFlag={handlers.onOpenFlag}
            onOpenSource={(lineIds) => handlers.onOpenSource("manual", lineIds)}
            onHoverSource={handlers.onHoverSource}
          />
        ) : null}

        {message.kind === "manual-changes" ? (
          <ManualChangesCard
            resolvedFlagIds={handlers.resolvedFlagIds}
            resolvedValues={handlers.resolvedValues}
            onReview={handlers.onOpenFlag}
          />
        ) : null}

        {message.kind === "approval" ? <ApprovalCard /> : null}

        {message.kind === "propagation" ? <PropagationCard /> : null}

        {message.kind === "publish-summary" ? <PublishSummaryCard /> : null}

        {message.kind === "doc-health" ? (
          <DocHealthCard publishedDocIds={handlers.publishedDocIds} />
        ) : null}

        {message.kind === "regulation" ? (
          <RegulationCard
            onViewProduct={(product) =>
              handlers.onQueueAction("compliance-view", product)
            }
          />
        ) : null}

        {message.kind === "legacy" ? <LegacyCard /> : null}

        {message.kind === "change-proposal" ? (
          <ChangeProposalCard
            onApprove={() => handlers.onQueueAction("field-approve")}
            onEdit={() => handlers.onQueueAction("field-edit")}
            onReject={() => handlers.onQueueAction("field-reject")}
            onOpenDoc={handlers.onOpenPdf}
          />
        ) : null}

        {message.kind === "queue-regulation" ? (
          <QueueRegulationCard
            onViewProduct={(product) =>
              handlers.onQueueAction("compliance-view", product)
            }
          />
        ) : null}

        {message.kind === "prompts" && message.prompts ? (
          <SuggestedReplies
            options={message.prompts}
            onSelect={(option) =>
              handlers.onQueueAction(option.action, option.payload)
            }
          />
        ) : null}

        {message.kind === "doc-diff" && message.diff ? (
          <DocDiff diff={message.diff} applied={message.applied} />
        ) : null}

        {message.kind === "queue-propagation" ? (
          <ChangePropagationCard
            onPropagate={() => handlers.onQueueAction("propagation-apply")}
            onOpenDoc={handlers.onOpenPdf}
          />
        ) : null}
      </div>
    </div>
  );
}
