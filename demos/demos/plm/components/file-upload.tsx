"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronRight,
  Clipboard,
  CloudUpload,
  Clock,
  Copy,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Minus,
  Monitor,
  MoreHorizontal,
  Network,
  Pencil,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  Share2,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { UploadedFile } from "../lib/flow";
import { AUDIT_FILE, type AuditFile } from "../lib/audit-data";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKind(name: string): "csv" | "pdf" | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".pdf")) return "pdf";
  return null;
}

/** Turn a native File into the demo's upload shape. */
export function fileToUploadedFile(file: File): UploadedFile | null {
  const kind = fileKind(file.name);
  if (!kind) return null;
  return {
    name: file.name,
    kind,
    size: formatBytes(file.size),
    url: URL.createObjectURL(file),
  };
}

function FileTypeIcon({
  kind,
  className = "h-4 w-4",
}: {
  kind: "csv" | "pdf";
  className?: string;
}) {
  return kind === "csv" ? (
    <FileSpreadsheet className={className} />
  ) : (
    <FileText className={className} />
  );
}

function ExplorerRow({
  file,
  onOpen,
}: {
  file: AuditFile;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="grid w-full grid-cols-[minmax(0,1fr)_5rem] items-center gap-3 bg-win-accent-soft px-3 py-1.5 text-left text-[0.72rem] text-win-ink transition-colors hover:bg-win-accent-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-win-accent/60 sm:grid-cols-[minmax(0,1fr)_10rem_6rem_5rem]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <FileTypeIcon kind={file.kind} className="h-4 w-4 shrink-0 text-online" />
          <span className="truncate">{file.name}</span>
        </span>
        <span className="hidden truncate text-[0.68rem] text-win-muted sm:block">
          {file.modified}
        </span>
        <span className="hidden text-[0.68rem] text-win-muted sm:block">
          {file.kind === "csv" ? "CSV File" : "PDF File"}
        </span>
        <span className="text-right text-[0.68rem] text-win-muted">
          {file.size}
        </span>
      </button>
    </li>
  );
}

function FileExplorer({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (file: UploadedFile) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const uploadingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const finishRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (finishRef.current !== null) window.clearTimeout(finishRef.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const beginUpload = useCallback(() => {
    if (uploading || uploadingRef.current) return;
    uploadingRef.current = true;
    setUploading(true);
    setProgress(0);
    progressRef.current = 0;
    timerRef.current = window.setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + 9);
      setProgress(progressRef.current);
      if (progressRef.current >= 100 && timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
        finishRef.current = window.setTimeout(() => {
          onUpload({
            name: AUDIT_FILE.name,
            kind: AUDIT_FILE.kind,
            size: AUDIT_FILE.size,
            url: AUDIT_FILE.url,
          });
          onClose();
        }, 260);
      }
    }, 55);
  }, [onClose, onUpload, uploading]);

  const commands = [
    { icon: Plus, label: "New" },
    { icon: Scissors, label: "Cut" },
    { icon: Copy, label: "Copy" },
    { icon: Clipboard, label: "Paste" },
    { icon: Pencil, label: "Rename" },
    { icon: Share2, label: "Share" },
    { icon: Trash2, label: "Delete" },
    { icon: ArrowUpDown, label: "Sort" },
    { icon: LayoutGrid, label: "View" },
  ];

  return (
    <motion.div
      key="explorer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        key="explorer-window"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Choose a file to upload"
        style={{ fontFamily: '"Segoe UI", "Segoe UI Variable", system-ui, sans-serif' }}
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-win-line-strong bg-win-surface text-win-ink shadow-[0_24px_70px_-24px_rgba(0,0,0,0.45)]"
      >
        <div className="flex h-9 shrink-0 items-center gap-2 px-3">
          <Folder className="h-4 w-4 text-win-accent" />
          <span className="text-[0.72rem] font-medium text-win-ink">
            File Explorer
          </span>
          <div className="ml-auto flex items-center">
            <span className="inline-flex h-9 w-10 items-center justify-center text-win-muted">
              <Minus className="h-3.5 w-3.5" />
            </span>
            <span className="inline-flex h-9 w-10 items-center justify-center text-win-muted">
              <Square className="h-3 w-3" />
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close file picker"
              className="inline-flex h-9 w-10 items-center justify-center text-win-muted transition-colors hover:bg-danger hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-win-accent/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-end gap-1 border-b border-win-line bg-win-bg px-2 pt-1">
          <div className="flex items-center gap-1.5 rounded-t-md border border-b-0 border-win-line bg-win-surface px-3 py-1.5 text-[0.7rem] text-win-ink">
            <Folder className="h-3.5 w-3.5 text-win-accent" />
            Downloads
            <X className="ml-1 h-3 w-3 text-win-muted" />
          </div>
          <span className="inline-flex h-7 w-7 items-center justify-center text-win-muted">
            <Plus className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 border-b border-win-line bg-win-surface px-2 py-1">
          {commands.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[0.64rem] text-win-ink-soft"
            >
              <Icon className="h-3.5 w-3.5 text-win-accent" />
              <span className="hidden sm:inline">{label}</span>
            </span>
          ))}
          <span className="ml-auto inline-flex h-6 w-6 items-center justify-center text-win-muted">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 border-b border-win-line bg-win-surface px-2 py-1.5">
          <span className="inline-flex h-7 w-7 items-center justify-center text-win-muted">
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          <span className="inline-flex h-7 w-7 items-center justify-center text-win-muted/50">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="inline-flex h-7 w-7 items-center justify-center text-win-muted">
            <ArrowUp className="h-3.5 w-3.5" />
          </span>
          <span className="inline-flex h-7 w-7 items-center justify-center text-win-muted">
            <RefreshCw className="h-3.5 w-3.5" />
          </span>
          <div className="ml-1 flex min-w-0 flex-1 items-center gap-1 rounded-sm border border-win-line-strong bg-win-surface px-2 py-1 text-[0.68rem] text-win-ink-soft">
            <Folder className="h-3.5 w-3.5 shrink-0 text-win-accent" />
            <span className="truncate">This PC</span>
            <ChevronRight className="h-3 w-3 shrink-0 text-win-muted" />
            <span className="truncate font-medium text-win-ink">Downloads</span>
          </div>
          <div className="hidden w-56 items-center gap-1.5 rounded-sm border border-win-line-strong bg-win-surface px-2 py-1 text-[0.64rem] text-win-muted sm:flex">
            <Search className="h-3 w-3" />
            Search Downloads
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="hidden w-48 shrink-0 flex-col gap-4 border-r border-win-line bg-win-elevated px-2 py-2 text-[0.68rem] text-win-ink-soft sm:flex">
            <div>
              <p className="px-2 py-1 text-[0.6rem] font-semibold text-win-muted">
                Quick access
              </p>
              <ul className="space-y-0.5">
                <li>
                  <span className="flex items-center gap-2 rounded-sm px-2 py-1">
                    <Monitor className="h-3.5 w-3.5 text-win-accent" />
                    Desktop
                  </span>
                </li>
                <li>
                  <span className="flex items-center gap-2 rounded-sm bg-win-accent-soft px-2 py-1 font-medium text-win-ink">
                    <Folder className="h-3.5 w-3.5 text-win-accent" />
                    Downloads
                  </span>
                </li>
                <li>
                  <span className="flex items-center gap-2 rounded-sm px-2 py-1">
                    <FileText className="h-3.5 w-3.5 text-win-accent" />
                    Documents
                  </span>
                </li>
                <li>
                  <span className="flex items-center gap-2 rounded-sm px-2 py-1">
                    <ImageIcon className="h-3.5 w-3.5 text-win-accent" />
                    Pictures
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <p className="px-2 py-1 text-[0.6rem] font-semibold text-win-muted">
                This PC
              </p>
              <ul className="space-y-0.5">
                <li>
                  <span className="flex items-center gap-2 rounded-sm px-2 py-1">
                    <HardDrive className="h-3.5 w-3.5 text-win-accent" />
                    Local Disk (C:)
                  </span>
                </li>
                <li>
                  <span className="flex items-center gap-2 rounded-sm px-2 py-1">
                    <Network className="h-3.5 w-3.5 text-win-accent" />
                    Network
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col bg-win-surface">
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_5rem] gap-3 border-b border-win-line px-3 py-1.5 text-[0.62rem] font-medium text-win-muted sm:grid-cols-[minmax(0,1fr)_10rem_6rem_5rem]">
              <span>Name</span>
              <span className="hidden sm:block">Date modified</span>
              <span className="hidden sm:block">Type</span>
              <span className="hidden text-right sm:block">Size</span>
            </div>

            <div className="scroll-win min-h-0 flex-1 overflow-y-auto">
              <ul>
                <ExplorerRow file={AUDIT_FILE} onOpen={beginUpload} />
              </ul>
              <p className="px-3 py-2 text-[0.62rem] text-win-muted">
                1 item · {AUDIT_FILE.description}
              </p>
            </div>

            {uploading ? (
              <div className="h-1 shrink-0 bg-win-line">
                <motion.div
                  className="h-full bg-win-accent"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.12 }}
                />
              </div>
            ) : null}

            <div className="flex shrink-0 items-center gap-3 border-t border-win-line bg-win-elevated px-3 py-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-win-surface ring-1 ring-win-line">
                  <FileSpreadsheet className="h-4 w-4 text-online" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.7rem] font-medium text-win-ink">
                    {AUDIT_FILE.name}
                  </p>
                  <p className="truncate text-[0.6rem] text-win-muted">
                    {AUDIT_FILE.description} · {AUDIT_FILE.size}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm border border-win-line-strong bg-win-surface px-4 py-1.5 text-[0.68rem] text-win-ink transition-colors hover:bg-win-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-win-accent/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={beginUpload}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-sm bg-win-accent px-4 py-1.5 text-[0.68rem] font-medium text-white transition-colors hover:bg-win-accent-hover disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-win-accent/60"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                {uploading ? `Uploading ${progress}%` : "Open"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-6 shrink-0 items-center gap-3 border-t border-win-line bg-win-elevated px-3 text-[0.58rem] text-win-muted">
          <span>1 item selected</span>
          <span className="ml-auto inline-flex items-center gap-2">
            <LayoutGrid className="h-3 w-3" />
            <List className="h-3 w-3" />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Reusable controlled file picker used by the composer and the upload card. */
export function FilePickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (file: UploadedFile) => void;
}) {
  return (
    <AnimatePresence>
      {open ? <FileExplorer onClose={onClose} onUpload={onSelect} /> : null}
    </AnimatePresence>
  );
}

export function FileUploadRequest({
  fileName,
  fileKind: attachedKind,
  fileSize,
  onSelect,
  onOpen,
}: {
  fileName?: string;
  fileKind?: "csv" | "pdf";
  fileSize?: string;
  onSelect: (file: UploadedFile) => void;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptFile = useCallback(
    (file: File) => {
      if (file.size > 25 * 1024 * 1024) {
        setError("That file is larger than the 25 MB demo limit.");
        return;
      }
      const uploaded = fileToUploadedFile(file);
      if (!uploaded) {
        setError("Choose a CSV or PDF file.");
        return;
      }
      setError(null);
      setOpen(false);
      onSelect(uploaded);
    },
    [onSelect],
  );

  if (fileName) {
    const kind = attachedKind ?? fileKind(fileName) ?? "csv";
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-online/30 bg-online/5 p-3.5">
        <span className="inline-flex h-11 w-9 shrink-0 items-center justify-center rounded-md border border-online/30 bg-surface text-online">
          <FileTypeIcon kind={kind} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.84rem] font-medium text-ink">
            {fileName}
          </p>
          <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
            Uploaded · {kind.toUpperCase()}
            {fileSize ? ` · ${fileSize}` : ""} · ready to draft
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-online/30 bg-online/10 px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-online">
          <Check className="h-3 w-3" />
          Uploaded
        </span>
        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Open
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const file = event.dataTransfer.files?.[0];
          if (file) acceptFile(file);
        }}
        onClick={() => setOpen(true)}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-5 transition-colors sm:p-6 ${
          dragActive
            ? "border-accent bg-accent-soft"
            : "border-line-strong bg-canvas/70 hover:border-accent/40 hover:bg-elevated/30"
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="relative inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-line-strong bg-surface">
            <CloudUpload className="h-7 w-7 text-ink-soft" />
            <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-canvas bg-online/15 text-online">
              <FileText className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.92rem] font-medium text-ink">
              Drop the new MAA-200 engineering spec here
            </p>
            <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
              PDF or CSV up to 25 MB. Use the sample rev C spec, which the agent
              will draft into a data sheet.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
                <FileSpreadsheet className="h-3 w-3 text-online" />
                CSV
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
                <FileText className="h-3 w-3 text-amber" />
                PDF
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber/30 bg-amber-soft px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.08em] text-amber">
                Sample included
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 font-mono text-[0.64rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Upload className="h-3.5 w-3.5" />
              Choose file
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
          <Clock className="h-3 w-3" />
          Last upload
          <span className="text-ink-soft">{AUDIT_FILE.name}</span>
          <span className="text-line-strong">·</span>
          <span>{AUDIT_FILE.modified}</span>
        </div>

        {error ? (
          <p className="mt-2 rounded-md border border-danger/30 bg-danger-soft px-2.5 py-1.5 font-mono text-[0.62rem] text-danger">
            {error}
          </p>
        ) : null}
      </div>

      <FilePickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
      />
    </>
  );
}
