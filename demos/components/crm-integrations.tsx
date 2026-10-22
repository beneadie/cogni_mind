function ZohoMark() {
  return (
    <span
      title="Zoho CRM"
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2 py-1.5"
    >
      <span aria-hidden="true" className="grid grid-cols-2 gap-[2px]">
        <span className="h-1.5 w-1.5 rounded-[1px] bg-amber" />
        <span className="h-1.5 w-1.5 rounded-[1px] bg-gold" />
        <span className="h-1.5 w-1.5 rounded-[1px] bg-online" />
        <span className="h-1.5 w-1.5 rounded-[1px] bg-accent" />
      </span>
      <span className="text-[0.72rem] font-semibold tracking-tight text-ink">
        Zoho
      </span>
    </span>
  );
}

function MondayMark() {
  return (
    <span
      title="monday.com"
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2 py-1.5"
    >
      <span aria-hidden="true" className="flex items-end gap-[2px]">
        <span className="h-2 w-1 rounded-full bg-accent" />
        <span className="h-3 w-1 rounded-full bg-gold" />
        <span className="h-1.5 w-1 rounded-full bg-online" />
      </span>
      <span className="text-[0.72rem] font-semibold tracking-tight text-ink">
        monday.com
      </span>
    </span>
  );
}

export function CrmIntegrations() {
  return (
    <section
      aria-labelledby="crm-integrations-title"
      className="space-y-2.5 border-t border-line pt-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p
          id="crm-integrations-title"
          className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted"
        >
          Planned CRM Integrations
        </p>
        <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">
          Planned
        </span>
      </div>
      <p className="text-[0.72rem] leading-relaxed text-muted">
        Direct sync planned with the customer&apos;s CRM.
      </p>
      <div className="flex flex-wrap gap-1.5">
        <ZohoMark />
        <MondayMark />
      </div>
      <p className="text-[0.68rem] leading-relaxed text-muted">
        Illustrative only — no live connection in this demo.
      </p>
    </section>
  );
}
