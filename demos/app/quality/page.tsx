import type { Metadata } from "next";
import { QualityDemo } from "@/quality/page";

export const metadata: Metadata = {
  title: "Quality Control | Cognimind",
};

export default function Page() {
  return <QualityDemo />;
}
