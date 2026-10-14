"use client";

import { useEffect, useState } from "react";

const STEP_MS = 16;
const PER_CHAR_MS = 16;
const MAX_MS = 1900;

export function Typewriter({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (text.length === 0) return;

    const totalMs = Math.min(MAX_MS, Math.max(220, text.length * PER_CHAR_MS));
    const step = Math.max(1, Math.ceil(text.length / (totalMs / STEP_MS)));
    let current = 0;

    const id = window.setInterval(() => {
      current = Math.min(text.length, current + step);
      setVisible(current);
      if (current >= text.length) {
        window.clearInterval(id);
      }
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [text]);

  const typing = visible < text.length;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.slice(0, visible)}
        {typing ? <span className="cube-caret" /> : null}
      </span>
    </span>
  );
}
