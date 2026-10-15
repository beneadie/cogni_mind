"use client";

// PURPOSE: Slide-over drawer that shows a rail (Tickets or Evidence) below the lg breakpoint, where rails are hidden.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Client component for the Escape listener and slide motion (MotionConfig in the demo root honors reduced motion).

import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Mobile drawer; renders nothing on lg screens, where the rails sit beside the workspace instead. */
export function MobileDrawer({ open, side, label, onClose, children }: { open: boolean; side: "left" | "right"; label: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const offset = side === "left" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.button
            type="button"
            aria-label={`Close ${label.toLowerCase()}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-forest/40"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ x: offset }}
            animate={{ x: 0 }}
            exit={{ x: offset }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-y-0 w-[85%] max-w-sm bg-canvas ${side === "left" ? "left-0" : "right-0"}`}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
