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
    name: "HVAC Tech Support",
    tagline: "Manual-grounded triage, diagnosis, and human handoff.",
    href: "/",
    status: "live",
  },
  {
    slug: "plm",
    name: "PLM Copilot",
    tagline: "Draft and check data sheets, track regulation risk, find legacy parts.",
    href: "/plm",
    status: "live",
  },
];

export function isDemoActive(demo: Demo, pathname: string): boolean {
  if (demo.href === "/") return pathname === "/";
  return pathname === demo.href || pathname.startsWith(`${demo.href}/`);
}
