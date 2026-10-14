import type { CSSProperties } from "react";

function Cube({ inner = false }: { inner?: boolean }) {
  return (
    <span
      className={`cube-loader__cube${inner ? " cube-loader__cube--inner" : ""}`}
    >
      {[0, 1, 2, 3, 4, 5].map((face) => (
        <span key={face} className="cube-loader__face" />
      ))}
    </span>
  );
}

export function CubeLoader({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`cube-loader ${className}`}
      style={{ "--size": `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      <span className="cube-loader__pivot">
        <Cube />
        <Cube inner />
      </span>
    </span>
  );
}
