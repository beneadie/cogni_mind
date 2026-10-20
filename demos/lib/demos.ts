export type DemoStatus = "live" | "soon";

export type Demo = {
  /** Folder under `demos/` and route under `app/`. */
  slug: string;
  /** Display name shown in the switcher. */
  name: string;
  /** One-line description of what the demo shows. */
  tagline: string;
  /** Route path. The root demo lives at "/". */
  href: string;
  status: DemoStatus;
};

/**
 * The single source of truth for the demo switcher.
 * Add a new demo here when you add it under `demos/<slug>/` + `app/<slug>/`.
 */
export const demos: Demo[] = [
  {
    slug: "hvac-support-copilot",
    name: "HVAC Field Support",
    tagline: "One copilot, in the field: manual-grounded diagnosis and human handoff.",
    href: "/",
    status: "live",
  },
  {
    slug: "plm",
    name: "Product Data (PLM)",
    tagline: "A product-care inbox: field reports, legacy parts, compliance, and docs from one queue.",
    href: "/plm",
    status: "live",
  },
  {
    slug: "quality",
    name: "Quality Control",
    tagline: "Sort messy warranty and quality complaints and spot failures repeating across companies.",
    href: "/quality",
    status: "live",
  },
];

export function isDemoActive(demo: Demo, pathname: string): boolean {
  if (demo.href === "/") return pathname === "/";
  return pathname === demo.href || pathname.startsWith(`${demo.href}/`);
}
