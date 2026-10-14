import type { Recommendation } from "@/lib/mock-data";
import { Lightbulb, Package, Wrench } from "lucide-react";

export function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber/40 bg-surface">
      <div className="flex items-center gap-2 border-b border-line bg-amber-soft px-4 py-2.5">
        <Lightbulb className="h-4 w-4 text-amber" />
        <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-amber">
          Recommendation
        </span>
      </div>

      <dl className="space-y-3 px-4 py-3.5">
        <div>
          <dt className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
            What the manual indicates
          </dt>
          <dd className="mt-0.5 text-[0.84rem] leading-relaxed text-ink">
            {recommendation.finding}
          </dd>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
              Likely fix
            </dt>
            <dd className="mt-0.5 inline-flex items-center gap-1.5 text-[0.84rem] text-ink">
              <Wrench className="h-3.5 w-3.5 text-muted" />
              {recommendation.likelyFix}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
              Part to verify
            </dt>
            <dd className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[0.84rem] text-ink">
              <Package className="h-3.5 w-3.5 text-muted" />
              {recommendation.partNumber}
            </dd>
          </div>
        </div>

        <p className="border-t border-line pt-3 text-[0.76rem] italic leading-relaxed text-muted">
          {recommendation.note}
        </p>
      </dl>
    </div>
  );
}
