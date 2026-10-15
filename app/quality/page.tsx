// PURPOSE: Thin route for the Quality Intelligence demo at /quality.
// ROLE: page (static shell). USED BY: Next.js App Router.
// Server component with no data reads, so cacheComponents can prerender it; all state lives in the client demo root.

import type { Metadata } from "next";
import { QualityDemo } from "@/demos/quality/page";

/** Tab title and description for the Quality demo. */
export const metadata: Metadata = {
  title: "Quality Intelligence · Cognimind Prototype",
  description: "Clickable prototype with illustrative data: sort messy warranty and quality complaints and spot failures repeating across companies.",
};

/** /quality route: renders the demo root. */
export default function QualityPage() {
  return <QualityDemo />;
}
