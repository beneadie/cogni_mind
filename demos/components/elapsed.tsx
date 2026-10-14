"use client";

import { useEffect, useState } from "react";

export function Elapsed({
  from,
  className = "",
}: {
  from: number;
  className?: string;
}) {
  const [now, setNow] = useState(from);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);

  const seconds = Math.max(0, now - from) / 1000;

  return <span className={className}>{seconds.toFixed(1)}s</span>;
}
