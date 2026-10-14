import { ArrowRight, Database, Layers, Plug } from "lucide-react";

function Node({
  icon: Icon,
  title,
  sub,
  accent = false,
}: {
  icon: typeof Plug;
  title: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`min-w-0 flex-1 rounded-xl border px-2.5 py-3 text-center ${
        accent
          ? "border-online/30 bg-online/[0.06]"
          : "border-line-strong bg-canvas"
      }`}
    >
      <Icon
        className={`mx-auto h-4 w-4 ${accent ? "text-online" : "text-amber"}`}
      />
      <p className="mt-1.5 truncate text-[0.72rem] font-medium text-ink">
        {title}
      </p>
      <p className="mt-0.5 font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
        {sub}
      </p>
    </div>
  );
}

export function SystemMap() {
  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-4">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
        Integration map
      </p>
      <div className="mt-3 flex items-center gap-1.5">
        <Node icon={Plug} title="8 systems" sub="CRM · ERP · EDI" />
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
        <Node icon={Database} title="Raw landing" sub="Bronze · as-is" />
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
        <Node icon={Layers} title="One master" sub="Gold · clean" accent />
      </div>
    </div>
  );
}
