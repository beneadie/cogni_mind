"use client";

import { Typewriter } from "@/components/typewriter";
import { FileSpreadsheet, FileText } from "lucide-react";
import type {
  PermissionDecision,
  PermissionRequest,
  PlmMessage,
} from "../lib/flow";
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
} from "./queue-cards";
import { SuggestedReplies } from "./suggested-replies";
import { DocDiff } from "./doc-diff";
import { WarningBlock } from "./warning-block";
import { FileUploadRequest } from "./file-upload";
import { SubagentRun } from "./subagent-run";
import { PermissionCard } from "./permission-card";
import {
  ComplianceCaseCard,
  ComplianceExposureCard,
  ComplianceOptionsCard,
  ComplianceOutcomeCard,
} from "./compliance-card";
import { ExtractedSheetCard } from "./extracted-sheet";
import { AlertCreatedCard } from "./alert-created";
import {
  AuditPublishedCard,
  AuditReviewCard,
  AuditSummaryCard,
} from "./audit-summary";
import { AUDIT_FILE, type AuditReviewValues } from "../lib/audit-data";
import type { ComplianceOutcome, QueueCardAction } from "../lib/types";
import type { UploadedFile } from "../lib/flow";

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
  propagationSentIds: string[];
  rememberedOwners: string[];
  complianceActiveProductId: string | null;
  complianceOutcomes: Record<string, ComplianceOutcome>;
  uploadedFile: UploadedFile | null;
  auditPublished: boolean;
  auditReviewValues: AuditReviewValues;
  onUpload: (file: UploadedFile) => void;
  onOpenUploaded: () => void;
  onSubagentComplete: (id: string) => void;
  onReviewDataSheet: () => void;
  onAuditReviewValueChange: (id: string, value: string) => void;
  onPublishDataSheet: (values: AuditReviewValues) => void;
  onOpenFlag: (flagId: string) => void;
  onOpenSource: (doc: "spec" | "manual", lineIds: string[]) => void;
  onHoverSource: (lineIds: string[]) => void;
  onOpenPdf: (docId: string, page: number) => void;
  onQueueAction: (action: QueueCardAction, payload?: string) => void;
  onPropagate: (ids: string[]) => boolean;
  onPermissionDecision: (
    id: PermissionRequest["id"],
    decision: PermissionDecision,
  ) => void;
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
    if (message.kind === "file") {
      const FileIcon =
        message.fileKind === "pdf" ? FileText : FileSpreadsheet;
      return (
        <div className="flex justify-end">
          <div className="inline-flex max-w-[34rem] items-center gap-2.5 rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-canvas">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas/10">
              <FileIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.82rem] font-medium">
                {message.fileName ?? message.text}
              </span>
              <span className="mt-0.5 block font-mono text-[0.56rem] uppercase tracking-[0.08em] text-canvas/60">
                Uploaded · {message.fileKind?.toUpperCase() ?? "FILE"}
              </span>
            </span>
          </div>
        </div>
      );
    }
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

        {message.kind === "upload-request" ? (
          <FileUploadRequest
            fileName={handlers.uploadedFile?.name}
            fileKind={handlers.uploadedFile?.kind}
            fileSize={handlers.uploadedFile?.size}
            onSelect={handlers.onUpload}
            onOpen={
              handlers.uploadedFile ? handlers.onOpenUploaded : undefined
            }
          />
        ) : null}

        {message.kind === "extracted-sheet" ? (
          <ExtractedSheetCard onOpenFile={handlers.onOpenUploaded} />
        ) : null}

        {message.kind === "subagents" && message.subagents ? (
          <SubagentRun
            agents={message.subagents}
            launchDelayMs={message.subagentDelayMs}
            permissionRemembered={message.subagentPermissionRemembered}
            onComplete={handlers.onSubagentComplete}
          />
        ) : null}

        {message.kind === "permission" && message.permission ? (
          <PermissionCard
            request={message.permission}
            onDecision={(decision) =>
              handlers.onPermissionDecision(
                message.permission!.id,
                decision,
              )
            }
          />
        ) : null}

        {message.kind === "alert-created" && message.queueItem ? (
          <AlertCreatedCard item={message.queueItem} />
        ) : null}

        {message.kind === "audit-summary" ? (
          <AuditSummaryCard
            fileName={handlers.uploadedFile?.name ?? AUDIT_FILE.name}
            published={handlers.auditPublished}
            onReview={handlers.onReviewDataSheet}
          />
        ) : null}

        {message.kind === "audit-review" ? (
          <AuditReviewCard
            published={handlers.auditPublished}
            values={handlers.auditReviewValues}
            onValueChange={handlers.onAuditReviewValueChange}
            onPublish={handlers.onPublishDataSheet}
          />
        ) : null}

        {message.kind === "audit-published" ? (
          <AuditPublishedCard values={handlers.auditReviewValues} />
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
            onApprove={(proposal) =>
              handlers.onQueueAction("field-approve", proposal)
            }
            onReject={() => handlers.onQueueAction("field-reject")}
            onOpenDoc={handlers.onOpenPdf}
          />
        ) : null}

        {message.kind === "compliance-case" ? (
          <ComplianceCaseCard
            activeProductId={handlers.complianceActiveProductId}
            outcomes={handlers.complianceOutcomes}
            onSelectProduct={(product) =>
              handlers.onQueueAction("compliance-case-select", product)
            }
            onAction={(product, action) =>
              handlers.onQueueAction(
                "compliance-case-act",
                `${product}|${action}`,
              )
            }
          />
        ) : null}

        {message.kind === "compliance-exposure" && message.productId ? (
          <ComplianceExposureCard productId={message.productId} />
        ) : null}

        {message.kind === "compliance-options" &&
        message.productId &&
        message.complianceOptions ? (
          <ComplianceOptionsCard
            productId={message.productId}
            options={message.complianceOptions}
            onSelect={(action) =>
              handlers.onQueueAction("compliance-act", action)
            }
          />
        ) : null}

        {message.kind === "compliance-outcome" &&
        message.complianceOutcome ? (
          <ComplianceOutcomeCard outcome={message.complianceOutcome} />
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
          <DocDiff
            diff={message.diff}
            applied={message.applied}
            sent={message.sent}
          />
        ) : null}

        {message.kind === "queue-propagation" ? (
          <ChangePropagationCard
            onPropagate={handlers.onPropagate}
            onCancel={() => handlers.onQueueAction("propagation-cancel")}
            onOpenDoc={handlers.onOpenPdf}
            sentIds={handlers.propagationSentIds}
            rememberedOwners={handlers.rememberedOwners}
          />
        ) : null}
      </div>
    </div>
  );
}
