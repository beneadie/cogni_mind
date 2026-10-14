"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlmHeader } from "./components/plm-header";
import { WalkthroughRail } from "./components/walkthrough-rail";
import { Frame } from "./components/frame";
import { StepIngest } from "./components/step-ingest";
import { StepExtract } from "./components/step-extract";
import { StepResolve } from "./components/step-resolve";
import { StepApprove } from "./components/step-approve";
import { StepPropagate } from "./components/step-propagate";
import { ScreenHealth } from "./components/screen-health";
import { StepManualDraft } from "./components/step-manual-draft";
import { StepManualReview } from "./components/step-manual-review";
import { StepManualPublish } from "./components/step-manual-publish";
import { ScreenRegulation } from "./components/screen-regulation";
import { ScreenLegacyParts } from "./components/screen-legacy-parts";
import { FlagDrawer } from "./components/flag-drawer";
import { flagDetails, manualTargetDocId } from "./lib/demoData";
import type { FlagActionOutcome, PlmFlow, PlmScreen } from "./lib/types";

const SPEC_SCREENS: PlmScreen[] = [
  "ingest",
  "extract",
  "resolve",
  "approve",
  "propagate",
];
const DOCS_SCREENS: PlmScreen[] = [
  "health",
  "manual-draft",
  "manual-review",
  "manual-publish",
];

export default function PlmDemo() {
  const [screen, setScreen] = useState<PlmScreen>("frame");
  const [flow, setFlow] = useState<PlmFlow>("spec");
  const [resolvedFlagIds, setResolvedFlagIds] = useState<string[]>([]);
  const [publishedDocIds, setPublishedDocIds] = useState<string[]>([]);
  const [openFlagId, setOpenFlagId] = useState<string | null>(null);

  const go = useCallback((next: PlmScreen) => {
    setScreen(next);
    if (SPEC_SCREENS.includes(next)) setFlow("spec");
    else if (DOCS_SCREENS.includes(next)) setFlow("docs");
  }, []);

  const restart = useCallback(() => {
    setScreen("frame");
    setFlow("spec");
    setResolvedFlagIds([]);
    setPublishedDocIds([]);
    setOpenFlagId(null);
  }, []);

  const publishManual = useCallback(() => {
    setPublishedDocIds((prev) =>
      prev.includes(manualTargetDocId) ? prev : [...prev, manualTargetDocId],
    );
    setFlow("docs");
    setScreen("health");
  }, []);

  const handleFlagAction = useCallback(
    (flagId: string, outcome: FlagActionOutcome) => {
      if (outcome === "resolve") {
        setResolvedFlagIds((prev) =>
          prev.includes(flagId) ? prev : [...prev, flagId],
        );
      }
      setOpenFlagId(null);
    },
    [],
  );

  const detail = openFlagId ? (flagDetails[openFlagId] ?? null) : null;

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <PlmHeader showRestart={screen !== "frame"} onRestart={restart} />
      {screen !== "frame" ? (
        <WalkthroughRail flow={flow} current={screen} onNavigate={go} />
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="scroll-soft mx-auto flex h-full w-full max-w-6xl flex-col overflow-y-auto px-4 py-4 sm:px-6 lg:overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full min-h-0 flex-col"
            >
              {screen === "frame" ? (
                <Frame
                  onStartSpec={() => go("ingest")}
                  onStartDocs={() => go("health")}
                  onNavigate={go}
                />
              ) : null}
              {screen === "ingest" ? (
                <StepIngest onExtract={() => go("extract")} />
              ) : null}
              {screen === "extract" ? (
                <StepExtract
                  resolvedFlagIds={resolvedFlagIds}
                  onOpenFlag={setOpenFlagId}
                  onContinue={() => go("resolve")}
                />
              ) : null}
              {screen === "resolve" ? (
                <StepResolve
                  resolvedFlagIds={resolvedFlagIds}
                  onOpenFlag={setOpenFlagId}
                  onContinue={() => go("approve")}
                />
              ) : null}
              {screen === "approve" ? (
                <StepApprove onPublish={() => go("propagate")} />
              ) : null}
              {screen === "propagate" ? (
                <StepPropagate
                  onRestart={restart}
                  onReviewHealth={() => go("health")}
                />
              ) : null}
              {screen === "health" ? (
                <ScreenHealth
                  publishedDocIds={publishedDocIds}
                  onUpdate={() => go("manual-draft")}
                />
              ) : null}
              {screen === "manual-draft" ? (
                <StepManualDraft
                  resolvedFlagIds={resolvedFlagIds}
                  onOpenFlag={setOpenFlagId}
                  onContinue={() => go("manual-review")}
                />
              ) : null}
              {screen === "manual-review" ? (
                <StepManualReview
                  resolvedFlagIds={resolvedFlagIds}
                  onOpenFlag={setOpenFlagId}
                  onContinue={() => go("manual-publish")}
                />
              ) : null}
              {screen === "manual-publish" ? (
                <StepManualPublish onBackToHealth={publishManual} />
              ) : null}
              {screen === "regulation" ? <ScreenRegulation /> : null}
              {screen === "legacy" ? <ScreenLegacyParts /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <FlagDrawer
        detail={detail}
        onClose={() => setOpenFlagId(null)}
        onAction={handleFlagAction}
      />
    </div>
  );
}
