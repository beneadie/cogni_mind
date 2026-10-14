"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { demos, isDemoActive } from "@/lib/demos";

/**
 * Hidden demo switcher: a skinny icon button that drops a menu of demos.
 * Mounted in the shared header so every demo can jump to any other.
 */
export function DemoNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="demo-nav-menu"
        aria-label="Switch demo"
        title="Switch demo"
        className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-line bg-canvas text-muted transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="demo-nav-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full z-50 mt-2 w-72 origin-top-left overflow-hidden rounded-2xl border border-line-strong bg-surface p-1.5 shadow-[0_24px_60px_-24px_rgba(26,24,21,0.55)] ring-1 ring-black/5"
          >
            <p className="px-3 pb-1.5 pt-2 font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted">
              Demos
            </p>
            <ul className="space-y-0.5">
              {demos.map((demo) => {
                const active = isDemoActive(demo, pathname);
                const disabled = demo.status === "soon";
                const content = (
                  <>
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                      {active ? (
                        <Check className="h-3.5 w-3.5 text-online" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[0.82rem] font-medium text-ink">
                          {demo.name}
                        </span>
                        {disabled ? (
                          <span className="rounded-full border border-line px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-muted">
                            Soon
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[0.72rem] leading-snug text-muted">
                        {demo.tagline}
                      </span>
                    </span>
                  </>
                );

                if (disabled) {
                  return (
                    <li key={demo.slug}>
                      <div
                        aria-disabled="true"
                        className="flex cursor-not-allowed items-start gap-2.5 rounded-lg px-3 py-2.5 opacity-70"
                      >
                        {content}
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={demo.slug}>
                    <Link
                      href={demo.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                        active ? "bg-accent-soft" : "hover:bg-elevated"
                      }`}
                    >
                      {content}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
