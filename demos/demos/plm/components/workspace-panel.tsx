"use client";

import { Check, ExternalLink, FileText, PanelRightClose } from "lucide-react";

export type WorkspaceDoc = {
  id: string;
  title: string;
  meta: string;
  status?: string;
  tone?: "online" | "danger" | "muted";
  /** Product the record belongs to; groups the workspace. */
  group?: string;
  /** Mock PDF to open for this record, if one exists. */
  pdfId?: string;
  page?: number;
  /** Real file URL (for an uploaded CSV or sample export). */
  url?: string;
};

export type WorkspaceReference = {
  label: string;
  docId: string;
  lineIds: string[];
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}

function statusTone(tone?: WorkspaceDoc["tone"]) {
  if (tone === "online") return "text-online";
  if (tone === "danger") return "text-danger";
  return "text-muted";
}

function DocList({
  docs,
  onOpenDoc,
  onOpenPdf,
}: {
  docs: WorkspaceDoc[];
  onOpenDoc: (docId: string) => void;
  onOpenPdf?: (docId: string, page: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {docs.map((doc) => (
        <li key={doc.id}>
          <button
            type="button"
            onClick={() => {
              if (doc.url) {
                window.open(doc.url, "_blank", "noopener,noreferrer");
                return;
              }
              if (doc.pdfId && onOpenPdf) {
                onOpenPdf(doc.pdfId, doc.page ?? 1);
                return;
              }
              onOpenDoc(doc.id);
            }}
            className="flex w-full items-start gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.78rem] font-medium text-ink">
                {doc.title}
              </span>
              <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                {doc.meta}
              </span>
            </span>
            {doc.pdfId || doc.url ? (
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted" />
            ) : null}
            {doc.status ? (
              <span
                className={`mt-0.5 shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.08em] ${statusTone(
                  doc.tone,
                )}`}
              >
                {doc.status}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function WorkspacePanel({
  docs,
  references,
  onOpenDoc,
  onOpenReference,
  onOpenPdf,
  onCollapse,
}: {
  docs: WorkspaceDoc[];
  references: WorkspaceReference[];
  onOpenDoc: (docId: string) => void;
  onOpenReference: (ref: WorkspaceReference) => void;
  onOpenPdf?: (docId: string, page: number) => void;
  onCollapse?: () => void;
}) {
  const ungrouped = docs.filter((doc) => !doc.group);
  const groupOrder: string[] = [];
  const grouped = new Map<string, WorkspaceDoc[]>();
  for (const doc of docs) {
    if (!doc.group) continue;
    if (!grouped.has(doc.group)) {
      grouped.set(doc.group, []);
      groupOrder.push(doc.group);
    }
    grouped.get(doc.group)!.push(doc);
  }

  return (
    <aside className="flex h-full flex-col border-l border-line bg-elevated/40">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink">
          Workspace
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-line-strong px-1.5 font-mono text-[0.6rem] text-muted">
            {docs.length}
          </span>
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Hide workspace"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="scroll-soft flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {groupOrder.map((group) => (
          <div key={group} className="space-y-2.5">
            <SectionLabel>{group} · data on hand</SectionLabel>
            <DocList
              docs={grouped.get(group) ?? []}
              onOpenDoc={onOpenDoc}
              onOpenPdf={onOpenPdf}
            />
          </div>
        ))}

        <div className="space-y-2.5">
          <SectionLabel>Documents in context</SectionLabel>
          {ungrouped.length === 0 ? (
            <p className="text-[0.76rem] leading-relaxed text-muted">
              {groupOrder.length > 0
                ? "Product records are grouped above."
                : "No documents in the workspace yet."}
            </p>
          ) : (
            <DocList
              docs={ungrouped}
              onOpenDoc={onOpenDoc}
              onOpenPdf={onOpenPdf}
            />
          )}
        </div>

        <div className="space-y-2.5">
          <SectionLabel>Referenced</SectionLabel>
          {references.length === 0 ? (
            <p className="text-[0.76rem] leading-relaxed text-muted">
              Sources you open appear here.
            </p>
          ) : (
            <ul className="space-y-1">
              {references.map((ref, index) => (
                <li key={`${ref.docId}-${ref.label}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onOpenReference(ref)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-[0.7rem] text-ink-soft transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                    <span className="truncate">{ref.label}</span>
                    <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
