"use client";

import { CheckCircle2, Database, FileSpreadsheet, Languages } from "lucide-react";
import {
  CANONICAL_PARTS,
  TOTAL_RECORDS,
  formatTraps,
  germanVocab,
  masterRows,
  sources,
  systems,
} from "../lib/ingest-data";

function CardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex items-center gap-2.5 border-b border-line bg-elevated/60 px-4 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft text-amber">
          <Database className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.82rem] font-medium text-ink">{title}</p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="px-4 py-3.5">{children}</div>
    </div>
  );
}

export function ConnectionsCard() {
  const total = systems.reduce((sum, system) => sum + system.records, 0);
  return (
    <CardShell
      title="Integrations · connected live"
      subtitle={`${systems.length} systems · ${total.toLocaleString()} records pulled`}
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {systems.map((system) => (
          <li
            key={system.id}
            className="rounded-xl border border-line bg-canvas px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-online" />
              <span className="truncate text-[0.82rem] font-medium text-ink">
                {system.name}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
                {system.records.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
              {system.category} · {system.method}
            </p>
            <p className="mt-1 text-[0.74rem] leading-snug text-ink-soft">
              {system.note}
            </p>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

export function IngestNotesCard() {
  return (
    <div className="space-y-3">
      <CardShell
        title="Survey · incoming files"
        subtitle={`${sources.length} catalogs · ${TOTAL_RECORDS.toLocaleString()} raw rows`}
      >
        <ul className="space-y-2">
          {sources.map((source) => (
            <li
              key={source.file}
              className="rounded-xl border border-line bg-canvas px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <FileSpreadsheet className="h-3.5 w-3.5 shrink-0 text-amber" />
                <span className="font-mono text-[0.72rem] font-semibold text-ink">
                  {source.file}
                </span>
                <span className="font-mono text-[0.6rem] text-muted">
                  {source.rows} × {source.cols}
                </span>
                <span className="ml-auto flex flex-wrap gap-1">
                  {[
                    source.delimiter,
                    source.language,
                    source.currency,
                    `${source.decimals} decimals`,
                    source.headers,
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.06em] text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </div>
              <p className="mt-1 text-[0.72rem] text-ink-soft">
                {source.quirks.join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </CardShell>

      <div className="grid gap-3 sm:grid-cols-2">
        <CardShell title="Vocabulary" subtitle="German → canonical">
          <ul className="space-y-1.5">
            <li className="flex items-center gap-1.5 pb-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted">
              <Languages className="h-3 w-3" /> resolved
            </li>
            {germanVocab.slice(0, 6).map((entry) => (
              <li
                key={entry.term}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate font-mono text-[0.7rem] text-ink-soft">
                  {entry.term}
                </span>
                <span className="shrink-0 font-mono text-[0.62rem] text-online">
                  {entry.canonical}
                </span>
              </li>
            ))}
          </ul>
        </CardShell>

        <CardShell title="Format traps" subtitle="verified, not assumed">
          <ul className="space-y-2">
            {formatTraps.map((trap) => (
              <li key={trap} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                <span className="text-[0.76rem] leading-snug text-ink-soft">
                  {trap}
                </span>
              </li>
            ))}
          </ul>
        </CardShell>
      </div>
    </div>
  );
}

export function MasterCard() {
  return (
    <CardShell
      title="Canonical master"
      subtitle={`${CANONICAL_PARTS.toLocaleString()} parts · every row carries provenance`}
    >
      <ul className="divide-y divide-line">
        {masterRows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center gap-3 py-2.5">
            <span className="font-mono text-[0.72rem] font-semibold tracking-[0.02em] text-ink">
              {row.id}
            </span>
            <span className="text-[0.8rem] text-ink">{row.category}</span>
            <span className="font-mono text-[0.7rem] text-muted">
              {row.specs}
            </span>
            <span className="ml-auto flex items-center gap-3 font-mono text-[0.66rem] text-ink-soft">
              <span>{row.suppliers} suppliers</span>
              <span className="text-ink">
                ${row.low.toFixed(2)}–${row.high.toFixed(2)}
              </span>
            </span>
            <span className="w-full font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
              {row.provenance}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 font-mono text-[0.68rem] text-amber">
        The same 64 MFD / 370V capacitor costs $12.97 at Delta and $17.14 at
        Summit — only a harmonized master makes like-for-like buying possible.
      </p>
    </CardShell>
  );
}
