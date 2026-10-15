"use client";

// PURPOSE: The intake box for a new complaint: company, kind, optional model, free text, "Try sample" and Classify.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Client component because it keeps the unsent form in local state; classification itself happens in the reducer.

import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import type { CompanyId, TicketKind } from "../lib/contracts";
import { COMPANIES } from "../lib/data/catalog";
import { type IncomingComplaint, SAMPLE_COMPLAINT } from "../lib/data/synthetic";
import { BUTTON, FIELD, SectionLabel } from "./ui";

const KINDS: readonly { id: TicketKind; label: string }[] = [
  { id: "warranty", label: "Warranty" },
  { id: "quality", label: "Quality" },
];

const EMPTY: IncomingComplaint = { companyId: COMPANIES[0].id, kind: "warranty", text: "", modelRaw: "" };

/** New-complaint form; onClassify receives exactly what the person typed or the sample filled in. */
export function Composer({ onClassify }: { onClassify: (complaint: IncomingComplaint) => void }) {
  const [form, setForm] = useState<IncomingComplaint>(EMPTY);
  const update = (patch: Partial<IncomingComplaint>) => setForm((previous) => ({ ...previous, ...patch }));

  return (
    <section className="rounded-2xl border border-line-strong bg-surface" aria-labelledby="composer-title">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h2 id="composer-title" className="font-serif text-lg text-ink">
            New complaint
          </h2>
          <p className="text-[0.76rem] text-muted">Paste or type it the way it arrived. Nothing joins the records until a person confirms the tags.</p>
        </div>
        <button type="button" onClick={() => setForm({ ...SAMPLE_COMPLAINT, modelRaw: SAMPLE_COMPLAINT.modelRaw ?? "" })} className={BUTTON.secondary}>
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          Try sample
        </button>
      </div>

      <form
        className="space-y-3 px-4 py-4"
        onSubmit={(event) => {
          event.preventDefault();
          onClassify({ ...form, modelRaw: form.modelRaw?.trim() || undefined });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1">
            <SectionLabel>Company</SectionLabel>
            <select value={form.companyId} onChange={(event) => update({ companyId: event.target.value as CompanyId })} className={FIELD}>
              {COMPANIES.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <SectionLabel>Kind</SectionLabel>
            <select value={form.kind} onChange={(event) => update({ kind: event.target.value as TicketKind })} className={FIELD}>
              {KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <SectionLabel>Model (optional)</SectionLabel>
            <input value={form.modelRaw ?? ""} onChange={(event) => update({ modelRaw: event.target.value })} placeholder="e.g. CC-410S" className={FIELD} />
          </label>
        </div>
        <label className="block space-y-1">
          <SectionLabel>Complaint text</SectionLabel>
          <textarea
            value={form.text}
            onChange={(event) => update({ text: event.target.value })}
            rows={4}
            placeholder="e.g. tech says freon leaking at the compressor, NF-3000S, 2nd callback"
            className={`${FIELD} resize-y leading-relaxed`}
          />
        </label>
        <div className="flex justify-end">
          <button type="submit" disabled={!form.text.trim()} className={BUTTON.primary}>
            <Wand2 className="h-3.5 w-3.5" />
            Classify
          </button>
        </div>
      </form>
    </section>
  );
}
