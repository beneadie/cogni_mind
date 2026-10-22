"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

const STEP_MS = 16;
const PER_CHAR_MS = 16;
const MAX_MS = 1900;

type Segment = {
  text: string;
  bold: boolean;
};

function parseSegments(text: string): Segment[] {
  return text
    .split("**")
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}

export function Typewriter({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const segments = useMemo(() => parseSegments(text), [text]);
  const plainText = useMemo(
    () => segments.map((segment) => segment.text).join(""),
    [segments],
  );
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (plainText.length === 0) return;

    const totalMs = Math.min(
      MAX_MS,
      Math.max(220, plainText.length * PER_CHAR_MS),
    );
    const step = Math.max(1, Math.ceil(plainText.length / (totalMs / STEP_MS)));
    let current = 0;

    const id = window.setInterval(() => {
      current = Math.min(plainText.length, current + step);
      setVisible(current);
      if (current >= plainText.length) {
        window.clearInterval(id);
      }
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [plainText]);

  const typing = visible < plainText.length;
  const rendered: ReactNode[] = [];
  let remaining = visible;

  for (const [index, segment] of segments.entries()) {
    if (remaining <= 0) break;
    const content = segment.text.slice(0, remaining);
    remaining -= segment.text.length;
    rendered.push(
      segment.bold ? (
        <strong key={index} className="font-semibold text-ink">
          {content}
        </strong>
      ) : (
        <span key={index}>{content}</span>
      ),
    );
  }

  return (
    <span className={className} aria-label={plainText}>
      <span aria-hidden="true">
        {rendered}
        {typing ? <span className="cube-caret" /> : null}
      </span>
    </span>
  );
}
