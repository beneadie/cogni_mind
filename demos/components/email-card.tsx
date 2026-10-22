import type { EmailDraft } from "@/lib/types";
import {
  AtSign,
  CheckCircle2,
  Mail,
  Phone,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";

export function EmailCard({
  email,
  onSend,
  onDiscard,
}: {
  email: EmailDraft;
  onSend?: () => void;
  onDiscard?: () => void;
}) {
  const status = email.status;

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted">
          <Mail className="h-3.5 w-3.5" />
          Email Draft
        </span>
        <span
          className={`inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] ${
            status === "sent"
              ? "text-online"
              : status === "discarded"
                ? "text-muted"
                : "text-amber"
          }`}
        >
          {status === "sent" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : status === "discarded" ? (
            <Trash2 className="h-3.5 w-3.5" />
          ) : (
            <Mail className="h-3.5 w-3.5" />
          )}
          {status === "sent"
            ? "Sent"
            : status === "discarded"
              ? "Discarded"
              : "Awaiting Review"}
        </span>
      </div>

      {status === "discarded" ? (
        <div className="px-4 py-3.5">
          <p className="text-[0.86rem] text-ink-soft">
            Draft discarded. Nothing was sent.
          </p>
        </div>
      ) : (
        <div className="space-y-3 px-4 py-3.5">
          <dl className="space-y-1.5 text-[0.82rem]">
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
                To
              </dt>
              <dd className="min-w-0 break-words text-ink-soft">
                ACS Customer Support &lt;{email.to}&gt;
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
                Subject
              </dt>
              <dd className="min-w-0 break-words font-medium text-ink">
                {email.subject}
              </dd>
            </div>
          </dl>

          <div className="scroll-soft max-h-64 overflow-y-auto whitespace-pre-line rounded-xl border border-line bg-canvas px-3.5 py-3 text-[0.82rem] leading-relaxed text-ink-soft">
            {email.body}
          </div>

          <div className="rounded-xl border border-line bg-elevated/50 px-3.5 py-3">
            <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
              Reply-to contact
            </p>
            <div className="mt-2 grid gap-1.5 text-[0.8rem] text-ink-soft sm:grid-cols-2">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-muted" />
                {email.replyToName}
                <span className="text-muted">- {email.replyToRole}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AtSign className="h-3.5 w-3.5 text-muted" />
                {email.replyToEmail}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted" />
                {email.replyToPhone}
              </span>
            </div>
          </div>

          {status === "sent" ? (
            <p className="flex items-center gap-1.5 border-t border-line pt-3 text-[0.8rem] text-online">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sent to {email.to}. A copy stays on the case.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={() => onSend?.()}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Send className="h-3.5 w-3.5" />
                Send email
              </button>
              <button
                type="button"
                onClick={() => onDiscard?.()}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3.5 py-1.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Discard draft
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
