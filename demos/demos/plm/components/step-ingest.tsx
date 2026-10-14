import { SPEC_FILE_NAME, SPEC_PAGES, SPEC_SIZE } from "../lib/demoData";
import { ArrowRight, CheckCircle2, FileText, UploadCloud } from "lucide-react";

export function StepIngest({ onExtract }: { onExtract: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
          Step 1 · Ingest
        </p>
        <h1 className="mt-2 font-serif text-[1.7rem] leading-tight text-ink">
          Upload the engineering spec
        </h1>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
          ACS feeds in the scanned DL-2400 spec. Everything downstream is
          grounded in this document.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-line-strong bg-elevated/40 px-6 py-12 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted">
          <UploadCloud className="h-6 w-6" />
        </span>
        <p className="mt-3.5 text-[0.92rem] font-medium text-ink">
          Drag and drop your spec here
        </p>
        <p className="mt-1 text-[0.8rem] text-muted">or browse your files</p>
        <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
          PDF · DWG · scanned TIFF — up to 100 MB
        </p>
      </div>

      <div className="flex items-center gap-3.5 rounded-2xl border border-line-strong bg-surface p-4">
        <span className="relative inline-flex h-14 w-11 shrink-0 items-center justify-center rounded-md border border-line-strong bg-canvas">
          <FileText className="h-5 w-5 text-danger" />
          <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 rounded-sm bg-danger-soft px-1 font-mono text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-danger">
            PDF
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.88rem] font-medium text-ink">
            {SPEC_FILE_NAME}
          </p>
          <p className="mt-0.5 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-muted">
            {SPEC_PAGES} pages · {SPEC_SIZE} · scanned at 300 dpi
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-online">
          <CheckCircle2 className="h-4 w-4" />
          Loaded
        </span>
      </div>

      <button
        type="button"
        onClick={onExtract}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        Extract attributes
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
