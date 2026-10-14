import type { Availability } from "@/lib/mock-data";
import { CheckCircle2, MapPin, Package, Truck } from "lucide-react";

export function AvailabilityCard({
  availability,
}: {
  availability: Availability;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
        <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted">
          Part Availability
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-online">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {availability.availability}
        </span>
      </div>

      <div className="space-y-3 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-amber">
            <Package className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.9rem] font-medium text-ink">
              {availability.part}
            </p>
            <p className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted">
              {availability.partNumber}
            </p>
          </div>
        </div>

        <div className="grid gap-1.5 border-t border-line pt-3 text-[0.8rem] text-ink-soft sm:grid-cols-2">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted" />
            {availability.warehouses}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-muted" />
            Lead time: {availability.leadTime}
          </span>
        </div>
      </div>
    </div>
  );
}
