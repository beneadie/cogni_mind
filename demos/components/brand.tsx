export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
      <polygon
        points="20,3 35.5,11.75 35.5,28.25 20,37 4.5,28.25 4.5,11.75"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
      />
      <polygon
        points="20,10 28,14.6 28,25.4 20,30 12,25.4 12,14.6"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.35"
        fill="none"
      />
      <circle cx="20" cy="3" r="2" fill="currentColor" />
      <circle cx="35.5" cy="28.25" r="2" fill="currentColor" />
      <circle cx="4.5" cy="28.25" r="2" fill="currentColor" />
      <circle cx="20" cy="18.5" r="2" fill="currentColor" />
    </svg>
  );
}

export function Brand({
  className = "",
  markClassName = "text-gold",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 text-ink ${className}`}>
      <span
        className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center ${markClassName}`}
      >
        <LogoMark className="relative h-7 w-7" />
      </span>
      <span className="font-serif text-[1.35rem] leading-none tracking-[-0.01em]">
        Cognimind
      </span>
    </span>
  );
}
