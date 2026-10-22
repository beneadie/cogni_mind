import type { Metadata } from "next";
import { QualityDemo } from "@/quality/page";

export const metadata: Metadata = {
  title: "Cogni Demos",
};

export default function Page() {
  return <QualityDemo />;
}
