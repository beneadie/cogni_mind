"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import {
  ArrowRight,
  PanelLeftOpen,
  PanelRightOpen,
  Paperclip,
  Send,
} from "lucide-react";
import {
  AUDIT_GREETING,
  EXPECTED_INPUT,
  GREETING_TEXT,
  PLACEHOLDERS,
  sessions,
  type PlmSession,
  type PlmStage,
  type UploadedFile,
} from "./lib/flow";
import { useAgentTurns } from "./lib/use-agent-turns";
import {
  RESOLUTIONS,
  RESOLUTION_ORDER,
  extractTurn,
  healthTurn,
  ingestConnectTurn,
  ingestReconcileTurn,
  ingestUnderstandTurn,
  legacyTurn,
  manualDraftTurn,
  manualPublishTurn,
  publishTurn,
  regulationTurn,
  resolutionTurn,
  specIngestTurn,
  verifyTurn,
} from "./lib/turns";
import {
  auditIntroTurn,
  auditPublishTurn,
  auditScanTurn,
  auditSubagentsTurn,
} from "./lib/audit-turns";
import {
  DEFAULT_AUDIT_REVIEW_VALUES,
  type AuditReviewValues,
} from "./lib/audit-data";
import {
  dataSheetRows,
  flagDetails,
  manualCurrentContent,
  manualDraftRows,
  manualTargetDocId,
  specDoc,
} from "./lib/demoData";
import type {
  ComplianceAction,
  FlagActionOutcome,
  QueueCardAction,
  QueueItem,
} from "./lib/types";
import {
  COMPLIANCE_ALERT_ITEM,
  DOCUMENTATION_ALERT_ITEM,
  INITIAL_QUEUE,
  PROPAGATION_ITEM,
} from "./lib/queue-data";
import { productDossiers, riskRecord } from "./lib/risk-catalog";
import {
  queueComplianceActTurn,
  queueComplianceTurn,
  queueDocumentationTurn,
  queueFieldApproveTurn,
  queuePropagationApplyTurn,
  queuePropagationTurn,
  viewProductTurn,
} from "./lib/queue-turns";
import { PlmChatMessage, type MessageHandlers } from "./components/plm-message";
import { OpenItemsPanel } from "./components/open-items-panel";
import { QueueSummaryCard } from "./components/queue-cards";
import { SessionRail } from "./components/session-rail";
import { DocumentViewer, type ViewerState } from "./components/document-viewer";
import { PdfModal, type PdfView } from "./components/pdf-modal";
import { FlagDrawer } from "./components/flag-drawer";
import { FilePickerModal } from "./components/file-upload";
import {
  WorkspacePanel,
  type WorkspaceDoc,
  type WorkspaceReference,
} from "./components/workspace-panel";

const FIELD_KEYWORDS: Record<string, string> = {
  warranty: "warranty",
  weight: "weight",
  fire: "fire",
  throw: "throw",
  cycle: "cycles",
};

function queueStage(items: QueueItem[]): PlmStage {
  return items.length > 0 && items.every((item) => item.status !== "open")
    ? "done"
    : "queue-resolve";
}

function sectionHeading(
  sections: { lines: { id: string }[]; heading: string }[],
  lineId: string,
): string {
  for (const section of sections) {
    if (section.lines.some((line) => line.id === lineId)) return section.heading;
  }
  return "Reference";
}

export default function PlmDemo() {
  const { messages, isThinking, push, streamTurn, reset: resetTurns } =
    useAgentTurns();

  const [stage, setStage] = useState<PlmStage>("launcher");
  const [input, setInput] = useState("");
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [resolvedFlagIds, setResolvedFlagIds] = useState<string[]>([]);
  const [publishedDocIds, setPublishedDocIds] = useState<string[]>([]);
  const [openFlagId, setOpenFlagId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [references, setReferences] = useState<WorkspaceReference[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceDoc[]>([]);
  const [pendingFlagId, setPendingFlagId] = useState<string | null>(null);
  const [pendingExpected, setPendingExpected] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState<"items" | "workspace">("items");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [riskProductId, setRiskProductId] = useState<string | null>(null);
  const [resolvedValues, setResolvedValues] = useState<Record<string, string>>(
    {},
  );
  const [pdfView, setPdfView] = useState<PdfView | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [newAlertIds, setNewAlertIds] = useState<string[]>([]);
  const [auditPublished, setAuditPublished] = useState(false);
  const [auditReviewValues, setAuditReviewValues] =
    useState<AuditReviewValues>(() => ({ ...DEFAULT_AUDIT_REVIEW_VALUES }));
  const [composerPickerOpen, setComposerPickerOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const seededRef = useRef(false);
  const autofillRef = useRef<number | null>(null);
  const autofillTargetRef = useRef("");
  const skipFocusAutofillRef = useRef(false);
  const uploadedUrlRef = useRef<string | null>(null);
  const completedAgentsRef = useRef<Set<string>>(new Set());
  const alertsCreatedRef = useRef<Set<string>>(new Set());
  const auditReviewShownRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    push({ role: "agent", kind: "text", text: AUDIT_GREETING });
  }, [push]);

  useEffect(() => {
    return () => {
      if (uploadedUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    return () => {
      if (autofillRef.current !== null) {
        window.clearInterval(autofillRef.current);
      }
    };
  }, []);

  const stopAutofill = useCallback(() => {
    if (autofillRef.current !== null) {
      window.clearInterval(autofillRef.current);
      autofillRef.current = null;
    }
    autofillTargetRef.current = "";
    setIsAutoFilling(false);
  }, []);

  const startAutofill = useCallback(
    (target: string) => {
      stopAutofill();
      setIsAutoFilling(true);
      autofillTargetRef.current = target;
      const totalMs = Math.min(1100, Math.max(260, target.length * 13));
      const step = Math.max(1, Math.ceil(target.length / (totalMs / 16)));
      let shown = 0;
      const id = window.setInterval(() => {
        shown = Math.min(target.length, shown + step);
        setInput(target.slice(0, shown));
        if (shown >= target.length) {
          window.clearInterval(id);
          autofillRef.current = null;
          setIsAutoFilling(false);
        }
      }, 16);
      autofillRef.current = id;
    },
    [stopAutofill],
  );

  const addWorkspace = useCallback((docs: WorkspaceDoc[]) => {
    setWorkspace((prev) => {
      const ids = new Set(prev.map((doc) => doc.id));
      return [...prev, ...docs.filter((doc) => !ids.has(doc.id))];
    });
  }, []);

  /* ---------------------------------------------------------------- */
  /* Agent turns                                                       */
  /* ---------------------------------------------------------------- */

  const specFlagIds = useMemo(
    () =>
      dataSheetRows
        .filter((row) => row.flagId)
        .map((row) => row.flagId as string),
    [],
  );
  const manualFlagIds = useMemo(
    () =>
      manualDraftRows
        .filter((row) => row.flagId)
        .map((row) => row.flagId as string),
    [],
  );

  const runVerify = useCallback(() => {
    streamTurn(verifyTurn(() => setStage("approve")));
  }, [streamTurn]);

  const runManualPublish = useCallback(() => {
    setPublishedDocIds((prev) =>
      prev.includes(manualTargetDocId) ? prev : [...prev, manualTargetDocId],
    );
    streamTurn(
      manualPublishTurn(() => {
        setStage("done");
        addWorkspace([
          {
            id: "manual",
            title: "DL-2400 Installation Manual",
            meta: "Revision C",
            status: "Current",
            tone: "online",
          },
        ]);
      }),
    );
  }, [addWorkspace, streamTurn]);

  const runSpecIngest = useCallback(() => {
    streamTurn(
      specIngestTurn(() => {
        setStage("upload");
        addWorkspace([
          {
            id: "spec",
            title: "DL-2400_revC.pdf",
            meta: "Engineering spec · rev C",
            status: "In context",
            tone: "muted",
          },
          {
            id: "published",
            title: "DL-2400_datasheet_2019.pdf",
            meta: "Published sheet · rev B",
            status: "Reference",
            tone: "muted",
          },
          {
            id: "bom",
            title: "DL-2400 · ERP bill of materials",
            meta: "SAP S/4HANA · live",
            status: "Reference",
            tone: "muted",
          },
        ]);
      }),
    );
  }, [addWorkspace, streamTurn]);

  const runExtract = useCallback(() => {
    streamTurn(
      extractTurn(() => {
        setStage("resolve");
        setPendingFlagId("warranty");
      }),
    );
  }, [streamTurn]);

  const runPublish = useCallback(() => {
    streamTurn(publishTurn(() => setStage("propagate")));
  }, [streamTurn]);

  const runManualDraft = useCallback(() => {
    streamTurn(manualDraftTurn(() => setStage("manual-review")));
  }, [streamTurn]);

  const runHealth = useCallback(() => {
    streamTurn(
      healthTurn(() => {
        setStage("health");
        addWorkspace([
          {
            id: "registry",
            title: "DL Series document registry",
            meta: "5 documents · 3 need updating",
            status: "Scanned",
            tone: "muted",
          },
        ]);
      }),
    );
  }, [addWorkspace, streamTurn]);

  const runRegulation = useCallback(() => {
    streamTurn(
      regulationTurn(() => {
        setStage("regulation");
        addWorkspace([
          {
            id: "rohs",
            title: "RoHS 2027",
            meta: "Restriction text · Pb · Cd · Cr6",
            status: "Loaded",
            tone: "muted",
          },
          {
            id: "chrome",
            title: "EU Chrome Restriction 2026",
            meta: "Restriction text · Cr",
            status: "Loaded",
            tone: "muted",
          },
        ]);
      }),
    );
  }, [addWorkspace, streamTurn]);

  const runLegacy = useCallback(() => {
    streamTurn(
      legacyTurn(() => {
        setStage("legacy");
        addWorkspace([
          {
            id: "archive",
            title: "Archived drawings index",
            meta: "1949–2010 · scanned",
            status: "Searched",
            tone: "muted",
          },
        ]);
      }),
    );
  }, [addWorkspace, streamTurn]);

  const runIngestConnect = useCallback(() => {
    streamTurn(
      ingestConnectTurn(() => {
        setStage("ingest-connect");
        addWorkspace([
          {
            id: "catalogs",
            title: "6 supplier catalogs",
            meta: "3,873 raw rows · landed",
            status: "Connected",
            tone: "muted",
          },
        ]);
      }),
    );
  }, [addWorkspace, streamTurn]);

  const runIngestUnderstand = useCallback(() => {
    streamTurn(ingestUnderstandTurn(() => setStage("ingest-understand")));
  }, [streamTurn]);

  const runIngestReconcile = useCallback(() => {
    streamTurn(
      ingestReconcileTurn(() => {
        setStage("done");
        addWorkspace([
          {
            id: "master",
            title: "Canonical parts master",
            meta: "1,500 parts · queryable",
            status: "Published",
            tone: "online",
          },
        ]);
      }),
    );
  }, [addWorkspace, streamTurn]);

  /* ---------------------------------------------------------------- */
  /* Data-sheet audit                                                  */
  /* ---------------------------------------------------------------- */

  const runAuditIntro = useCallback(() => {
    if (uploadedUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedUrlRef.current);
    }
    uploadedUrlRef.current = null;
    completedAgentsRef.current.clear();
    alertsCreatedRef.current.clear();
    auditReviewShownRef.current = false;
    setUploadedFile(null);
    setAuditPublished(false);
    setAuditReviewValues({ ...DEFAULT_AUDIT_REVIEW_VALUES });
    streamTurn(
      auditIntroTurn(() => {
        setStage("audit-upload");
        push({ role: "agent", kind: "upload-request" });
      }),
    );
  }, [push, streamTurn]);

  const addAlert = useCallback(
    (item: QueueItem) => {
      if (alertsCreatedRef.current.has(item.id)) return;
      alertsCreatedRef.current.add(item.id);
      setQueue((prev) =>
        prev.some((entry) => entry.id === item.id) ? prev : [...prev, item],
      );
      setNewAlertIds((prev) =>
        prev.includes(item.id) ? prev : [...prev, item.id],
      );
      setRightTab("items");
      setRightOpen(true);
      push({ role: "agent", kind: "alert-created", queueItem: item });
    },
    [push],
  );

  const handleSubagentComplete = useCallback(
    (agentId: string) => {
      if (completedAgentsRef.current.has(agentId)) return;
      completedAgentsRef.current.add(agentId);
      if (agentId === "compliance") {
        addAlert(COMPLIANCE_ALERT_ITEM);
      }
      if (
        (agentId === "manual" || agentId === "datasheet") &&
        completedAgentsRef.current.has("manual") &&
        completedAgentsRef.current.has("datasheet")
      ) {
        addAlert(DOCUMENTATION_ALERT_ITEM);
      }
    },
    [addAlert],
  );

  const handleUpload = useCallback(
    (file: UploadedFile) => {
      if (isThinking) return;
      stopAutofill();
      setInput("");
      setPendingExpected(null);
      if (uploadedUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedUrlRef.current);
      }
      uploadedUrlRef.current = file.url ?? null;
      setUploadedFile(file);
      addWorkspace([
        {
          id: "uploaded-data-sheet",
          title: file.name,
          meta: "Uploaded engineering spec · rev C",
          status: "In context",
          tone: "muted",
          url: file.url,
        },
      ]);
      push({
        role: "user",
        kind: "file",
        fileName: file.name,
        fileKind: file.kind,
        fileUrl: file.url,
      });
      setStage("audit-reading");
      streamTurn(
        auditScanTurn(file.name, file.kind, () => {
          setStage("audit-delegating");
          streamTurn(
            auditSubagentsTurn(() => {
              setStage((current) =>
                current === "audit-review" ? current : "alerts",
              );
            }),
          );
        }),
      );
    },
    [addWorkspace, isThinking, push, stopAutofill, streamTurn],
  );

  const openUploadedFile = useCallback(() => {
    if (!uploadedFile?.url) return;
    window.open(uploadedFile.url, "_blank", "noopener,noreferrer");
  }, [uploadedFile]);

  const showAuditReview = useCallback(() => {
    if (auditReviewShownRef.current) return;
    auditReviewShownRef.current = true;
    setStage("audit-review");
    push({ role: "agent", kind: "audit-review" });
  }, [push]);

  /* ---------------------------------------------------------------- */
  /* Conversational resolution                                         */
  /* ---------------------------------------------------------------- */

  const startResolution = useCallback(
    (flagId: string) => {
      setPendingFlagId(flagId);
      streamTurn(
        resolutionTurn(flagId, () => {
          setStage("resolve-confirm");
          setPendingExpected(RESOLUTIONS[flagId].confirmText);
        }),
      );
    },
    [streamTurn],
  );

  const finishResolution = useCallback(
    (flagId: string, value?: string) => {
      const next = resolvedFlagIds.includes(flagId)
        ? resolvedFlagIds
        : [...resolvedFlagIds, flagId];
      setResolvedFlagIds(next);
      setResolvedValues((prev) => ({
        ...prev,
        [flagId]: value ?? RESOLUTIONS[flagId].displayValue,
      }));
      setOpenFlagId(null);
      setPendingExpected(null);

      if (specFlagIds.every((id) => next.includes(id))) {
        setPendingFlagId(null);
        runVerify();
        return;
      }

      const nextFlag = RESOLUTION_ORDER.find((id) => !next.includes(id));
      if (nextFlag) {
        const resolvedField = RESOLUTIONS[flagId].field;
        const nextResolution = RESOLUTIONS[nextFlag];
        setPendingFlagId(nextFlag);
        setStage("resolve");
        setPendingExpected(EXPECTED_INPUT.resolve ?? null);
        push({
          role: "agent",
          kind: "text",
          text: `${resolvedField} is resolved. Next, ${nextResolution.field}: ${nextResolution.reason}. Shall we take that one?`,
        });
      }
    },
    [push, resolvedFlagIds, runVerify, specFlagIds],
  );

  /* ---------------------------------------------------------------- */
  /* Viewer + references                                               */
  /* ---------------------------------------------------------------- */

  const openSource = useCallback(
    (doc: "spec" | "manual", lineIds: string[]) => {
      const isSpec = doc === "spec";
      const source = isSpec ? specDoc : manualCurrentContent;
      const label = isSpec
        ? "Engineering Spec · DL-2400 rev C"
        : "DL-2400 Installation Manual · rev A";
      setViewer({ doc: source, label, highlightedLineIds: lineIds });

      if (lineIds.length > 0) {
        const heading = sectionHeading(source.sections, lineIds[0]);
        const refLabel = `${isSpec ? "revC" : "rev A"} ${heading}`;
        setReferences((prev) =>
          prev.some((ref) => ref.label === refLabel)
            ? prev
            : [...prev, { label: refLabel, docId: doc, lineIds }],
        );
      }
    },
    [],
  );

  const hoverSource = useCallback((lineIds: string[]) => {
    setViewer((prev) =>
      prev ? { ...prev, highlightedLineIds: lineIds } : prev,
    );
  }, []);

  const openPdf = useCallback((docId: string, page: number) => {
    setPdfView({ docId, page });
  }, []);

  const openWorkspaceDoc = useCallback(
    (docId: string) => {
      const workspacePdf: Record<string, { id: string; page: number }> = {
        spec: { id: "dl-2400-spec", page: 1 },
        published: { id: "dl-2400-datasheet", page: 1 },
        manual: { id: "dl-2400-manual", page: 4 },
      };
      const target = workspacePdf[docId];
      if (target) {
        setPdfView({ docId: target.id, page: target.page });
        return;
      }
      if (docId === "manual") openSource("manual", []);
      else if (docId === "spec") openSource("spec", []);
    },
    [openSource],
  );

  /* ---------------------------------------------------------------- */
  /* Routing                                                           */
  /* ---------------------------------------------------------------- */

  const routeQuery = useCallback(
    (text: string) => {
      const lower = text.toLowerCase();
      if (/(dl-2400|dl 2400)/.test(lower)) {
        runSpecIngest();
        return;
      }
      if (
        /(new data sheet|new spec|engineering spec|maa-200|draft.*data sheet|check.*data sheet|audit)/.test(
          lower,
        )
      ) {
        runAuditIntro();
        return;
      }
      if (/(regulation|risk|rohs|compliance|chrome)/.test(lower)) {
        runRegulation();
        return;
      }
      if (/(legacy|old part|archived|1980|backset|find a)/.test(lower)) {
        runLegacy();
        return;
      }
      if (/(out of date|documentation|health)/.test(lower)) {
        runHealth();
        return;
      }
      if (/(ingest|connect|supplier|catalog|integrat|master|six systems)/.test(lower)) {
        runIngestConnect();
        return;
      }
      if (/(spec|data sheet|datasheet|extract|dl-2400|manual)/.test(lower)) {
        runSpecIngest();
        return;
      }
      push({
        role: "agent",
        kind: "text",
        text: "I can draft a data sheet from a new spec, audit an existing sheet, keep documentation current, or scan compliance. Which would you like?",
      });
    },
    [
      push,
      runAuditIntro,
      runHealth,
      runIngestConnect,
      runLegacy,
      runRegulation,
      runSpecIngest,
    ],
  );

  const processTurn = useCallback(
    (text: string, current: PlmStage) => {
      push({ role: "user", kind: "text", text });
      const lower = text.toLowerCase();

      switch (current) {
        case "launcher":
          routeQuery(text);
          break;

        case "audit-upload":
          push({
            role: "agent",
            kind: "text",
            text: "Use the upload card to attach the MAA-200 engineering spec — PDF or CSV. I'll start drafting the data sheet as soon as it lands.",
          });
          break;

        case "audit-reading":
        case "audit-delegating":
          push({
            role: "agent",
            kind: "text",
            text: "I'm still drafting the data sheet and running the specialist checks. Give me a moment.",
          });
          break;

        case "audit-review":
          push({
            role: "agent",
            kind: "text",
            text: "Use the review card to confirm or change the flagged values, then publish rev D.",
          });
          break;

        case "alerts":
          if (/data sheet|draft|review/.test(lower)) {
            showAuditReview();
          } else if (/document|manual|wiring|mismatch/.test(lower)) {
            push({
              role: "agent",
              kind: "text",
              text: "The documentation mismatch is the first alert in the panel — open it there and I'll walk you through the §7.2 change.",
            });
          } else if (/compliance|refrigerant|r-410a|risk/.test(lower)) {
            push({
              role: "agent",
              kind: "text",
              text: "The compliance alert is waiting in the panel. Open it and I'll pull up the affected products and mitigation options.",
            });
          } else {
            push({
              role: "agent",
              kind: "text",
              text: "Both findings are in the Alerts panel. Open one there, or ask me about the draft.",
            });
          }
          break;

        case "upload":
          runExtract();
          break;

        case "resolve": {
          const mentioned = RESOLUTION_ORDER.find((id) =>
            lower.includes(FIELD_KEYWORDS[id]),
          );
          if (mentioned && !resolvedFlagIds.includes(mentioned)) {
            startResolution(mentioned);
            break;
          }
          const wantsNext =
            /one by one|next|go through|start|begin/.test(lower) &&
            !/\bno\b/.test(lower);
          const affirmative =
            /^(yes|yep|yeah|sure|ok|okay|go ahead|let'?s|lets|please)\b/.test(
              lower.trim(),
            );
          if (
            (wantsNext || affirmative) &&
            pendingFlagId &&
            !resolvedFlagIds.includes(pendingFlagId)
          ) {
            startResolution(pendingFlagId);
            break;
          }
          if (wantsNext) {
            const target = RESOLUTION_ORDER.find(
              (id) => !resolvedFlagIds.includes(id),
            );
            if (target) {
              startResolution(target);
              break;
            }
          }
          const open = RESOLUTION_ORDER.filter(
            (id) => !resolvedFlagIds.includes(id),
          );
          push({
            role: "agent",
            kind: "text",
            text: open.length
              ? `Still open: ${open
                  .map((id) => RESOLUTIONS[id].field)
                  .join(", ")}. Ask about any one, or say "next".`
              : "Everything is resolved already.",
          });
          break;
        }

        case "resolve-confirm": {
          const target = pendingFlagId;
          if (target && !resolvedFlagIds.includes(target)) {
            const trimmed = text.trim();
            const affirmative =
              /^(yes|yep|yeah|sure|ok|okay|go ahead|let'?s|lets|please|apply|use|keep|confirm|correct|approve)\b/i.test(
                trimmed,
              );
            const custom =
              !affirmative && trimmed.length > 0 && trimmed.length <= 40
                ? trimmed
                : undefined;
            finishResolution(target, custom);
          } else {
            setStage("resolve");
          }
          break;
        }

        case "approve":
          runPublish();
          break;

        case "propagate":
          if (/manual|update/.test(lower)) runManualDraft();
          else if (/regulation|risk/.test(lower)) runRegulation();
          else if (/done|nothing|no\b/.test(lower)) {
            push({
              role: "agent",
              kind: "text",
              text: "Great — I'll keep the workspace up to date. Ask me anything else.",
            });
            setStage("done");
          } else {
            push({
              role: "agent",
              kind: "text",
              text: "I can bring the installation manual current, or check regulation exposure. Which?",
            });
          }
          break;

        case "health":
          if (/update|manual|fix/.test(lower)) runManualDraft();
          else if (/regulation|risk/.test(lower)) runRegulation();
          else
            push({
              role: "agent",
              kind: "text",
              text: "I can update the installation manual, or scan regulation exposure across the portfolio.",
            });
          break;

        case "regulation":
          if (/why|reason|high/.test(lower)) {
            push({
              role: "agent",
              kind: "text",
              text: "DL-2400 uses C36000 forged brass, which carries lead above the RoHS 2027 threshold. With 5,200 units shipped in the last 12 months, it's the top exposure in the DL Series.",
            });
          } else if (/data sheet|spec|back/.test(lower)) {
            push({
              role: "agent",
              kind: "text",
              text: "Sure — the DL-2400 data sheet is now rev D after the changes you approved.",
            });
            setStage("done");
          } else {
            push({
              role: "agent",
              kind: "text",
              text: "Ask me why a product is high-risk, or switch to another use case.",
            });
          }
          break;

        case "legacy":
          if (/regulation|risk/.test(lower)) runRegulation();
          else if (/spec|open/.test(lower)) {
            openSource("spec", []);
            push({
              role: "agent",
              kind: "text",
              text: "Here's the rev C engineering spec for DL-2400.",
            });
          } else {
            push({
              role: "agent",
              kind: "text",
              text: "I can open the part's spec, or check its regulation exposure.",
            });
          }
          break;

        case "ingest-connect":
          runIngestUnderstand();
          break;

        case "ingest-understand":
          runIngestReconcile();
          break;

        case "queue-review":
        case "queue-apply":
          push({
            role: "agent",
            kind: "text",
            text: "Choose an action on the card to continue.",
          });
          break;

        case "queue-resolve":
          push({
            role: "agent",
            kind: "text",
            text: "Open another alert from the panel, or ask me a question.",
          });
          break;

        default:
          break;
      }
    },
    [
      finishResolution,
      openSource,
      pendingFlagId,
      push,
      resolvedFlagIds,
      routeQuery,
      runExtract,
      runIngestReconcile,
      runIngestUnderstand,
      runManualDraft,
      runPublish,
      runRegulation,
      showAuditReview,
      startResolution,
    ],
  );

  const composerLocked =
    stage === "audit-upload" ||
    stage === "audit-review" ||
    stage === "queue-review" ||
    stage === "queue-apply" ||
    stage === "manual-review" ||
    stage === "done";

  const submit = useCallback(
    (override?: string) => {
      if (isThinking || composerLocked) return;
      const text = (
        override ?? (isAutoFilling ? autofillTargetRef.current : input)
      ).trim();
      stopAutofill();
      if (!text) return;
      setInput("");
      setPendingExpected(null);
      processTurn(text, stage);
    },
    [
      composerLocked,
      input,
      isAutoFilling,
      isThinking,
      processTurn,
      stage,
      stopAutofill,
    ],
  );

  const handleInputFocus = useCallback(() => {
    if (skipFocusAutofillRef.current) {
      skipFocusAutofillRef.current = false;
      return;
    }
    if (isThinking || composerLocked || isAutoFilling || input) return;
    if (activeItemId !== null || stage.startsWith("queue")) return;
    const target = pendingExpected ?? EXPECTED_INPUT[stage];
    if (target) startAutofill(target);
  }, [
    activeItemId,
    composerLocked,
    input,
    isAutoFilling,
    isThinking,
    pendingExpected,
    stage,
    startAutofill,
  ]);

  const handleInputChange = useCallback(
    (value: string) => {
      if (isAutoFilling) stopAutofill();
      setInput(value);
    },
    [isAutoFilling, stopAutofill],
  );

  /* ---------------------------------------------------------------- */
  /* Sessions + reset                                                  */
  /* ---------------------------------------------------------------- */

  const resetChatState = useCallback(() => {
    resetTurns();
    stopAutofill();
    if (uploadedUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedUrlRef.current);
    }
    uploadedUrlRef.current = null;
    completedAgentsRef.current.clear();
    alertsCreatedRef.current.clear();
    auditReviewShownRef.current = false;
    setUploadedFile(null);
    setAuditPublished(false);
    setAuditReviewValues({ ...DEFAULT_AUDIT_REVIEW_VALUES });
    setNewAlertIds([]);
    setResolvedFlagIds([]);
    setPublishedDocIds([]);
    setOpenFlagId(null);
    setViewer(null);
    setReferences([]);
    setWorkspace([]);
    setPendingFlagId(null);
    setPendingExpected(null);
    setRiskProductId(null);
    setResolvedValues({});
    setPdfView(null);
    setComposerPickerOpen(false);
    setInput("");
  }, [resetTurns, stopAutofill]);

  const resetAll = useCallback(() => {
    resetChatState();
    setStage("launcher");
    setQueue([]);
    setActiveItemId(null);
  }, [resetChatState]);

  const newConversation = useCallback(() => {
    resetAll();
    setActiveSession(null);
    setRightTab("items");
    setRightOpen(true);
    push({ role: "agent", kind: "text", text: AUDIT_GREETING });
  }, [push, resetAll]);

  const selectSession = useCallback(
    (session: PlmSession) => {
      resetChatState();
      setActiveSession(session.id);
      setActiveItemId(null);
      setRightTab("items");
      setStage("launcher");
      setPendingExpected(session.query);
      push({ role: "agent", kind: "text", text: GREETING_TEXT });
      skipFocusAutofillRef.current = true;
      startAutofill(session.query);
      composerRef.current?.focus();
    },
    [push, resetChatState, startAutofill],
  );

  /* ---------------------------------------------------------------- */
  /* Product Care inbox                                                */
  /* ---------------------------------------------------------------- */

  const selectQueueItem = useCallback(
    (item: QueueItem) => {
      if (stage === "audit-delegating") {
        addAlert(COMPLIANCE_ALERT_ITEM);
        addAlert(DOCUMENTATION_ALERT_ITEM);
      }
      resetChatState();
      setActiveSession(null);
      setActiveItemId(item.id);
      setNewAlertIds((prev) => prev.filter((id) => id !== item.id));
      setRightTab("items");
      setRightOpen(true);
      setStage("queue-review");
      switch (item.id) {
        case "documentation-mismatch":
          streamTurn(queueDocumentationTurn(() => setStage("queue-review")));
          break;
        case "compliance-alert":
          streamTurn(queueComplianceTurn(() => setStage("queue-review")));
          break;
        case "propagation":
          streamTurn(queuePropagationTurn(() => setStage("queue-review")));
          break;
        default:
          break;
      }
    },
    [addAlert, resetChatState, stage, streamTurn],
  );

  const updateAuditReviewValue = useCallback((id: string, value: string) => {
    setAuditReviewValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const publishDataSheet = useCallback(
    (values: AuditReviewValues) => {
      if (isThinking || auditPublished) return;
      setAuditReviewValues(values);
      setAuditPublished(true);
      setWorkspace((prev) =>
        prev.map((doc) =>
          doc.id === "uploaded-data-sheet"
            ? {
                ...doc,
                meta: "Published · rev D",
                status: "Published",
                tone: "online" as const,
              }
            : doc,
        ),
      );
      streamTurn(auditPublishTurn(values, () => setStage("alerts")));
    },
    [auditPublished, isThinking, streamTurn],
  );

  const handleQueueAction = useCallback(
    (action: QueueCardAction, payload?: string) => {
      switch (action) {
        case "field-approve":
          streamTurn(
            queueFieldApproveTurn(() => {
              setQueue((prev) => {
                const resolved = prev.map((item) =>
                  item.id === "documentation-mismatch"
                    ? { ...item, status: "tracking" as const }
                    : item,
                );
                return resolved.some(
                  (item) => item.id === PROPAGATION_ITEM.id,
                )
                  ? resolved
                  : [...resolved, PROPAGATION_ITEM];
              });
              setStage("queue-review");
              setActiveItemId(PROPAGATION_ITEM.id);
              streamTurn(queuePropagationTurn(() => setStage("queue-review")));
            }),
          );
          break;
        case "field-reject": {
          const next = queue.map((item) =>
            item.id === "documentation-mismatch"
              ? { ...item, status: "declined" as const }
              : item,
          );
          setQueue(next);
          push({
            role: "agent",
            kind: "text",
            text: "Understood — I've left the manual as-is, recorded the rejection, and closed the change request.",
          });
          setStage(queueStage(next));
          break;
        }
        case "compliance-view": {
          if (!payload) break;
          const productId = payload;
          setRiskProductId(productId);
          streamTurn(
            viewProductTurn(productId, () => {
              addWorkspace(productDossiers[productId] ?? []);
              setRightTab("workspace");
              setStage("queue-review");
            }),
          );
          break;
        }
        case "compliance-act": {
          const decision = payload as ComplianceAction | undefined;
          if (!decision || !riskProductId) break;
          const nextStatus: QueueItem["status"] =
            decision === "close" ? "resolved" : "tracking";
          const updatesQueue = riskRecord(riskProductId)?.group === "acs";
          streamTurn(
            queueComplianceActTurn(riskProductId, decision, () => {
              if (updatesQueue) {
                const next = queue.map((item) =>
                  item.id === "compliance-alert"
                    ? { ...item, status: nextStatus }
                    : item,
                );
                setQueue(next);
                setStage(queueStage(next));
              } else {
                setStage("queue-resolve");
              }
            }),
          );
          break;
        }
        case "propagation-apply":
          streamTurn(
            queuePropagationApplyTurn(() => {
              const next = queue.map((item) =>
                item.id === "propagation"
                  ? { ...item, status: "tracking" as const }
                  : item,
              );
              setQueue(next);
              setStage(queueStage(next));
            }),
          );
          break;
        default:
          break;
      }
    },
    [addWorkspace, push, queue, riskProductId, streamTurn],
  );

  const openItems = queue.filter((item) => item.status === "open");
  const queueCleared = queue.length > 0 && openItems.length === 0;
  const showQueueSummary = queueCleared && activeSession === null;

  const statusCount = (status: QueueItem["status"]) =>
    queue.filter((item) => item.status === status).length;
  const summaryRows: string[] = [];
  const resolvedCount = statusCount("resolved");
  const trackingCount = statusCount("tracking");
  const declinedCount = statusCount("declined");
  if (resolvedCount > 0)
    summaryRows.push(`${resolvedCount} item${resolvedCount === 1 ? "" : "s"} resolved`);
  if (trackingCount > 0)
    summaryRows.push(
      `${trackingCount} item${trackingCount === 1 ? "" : "s"} tracking to closure`,
    );
  if (declinedCount > 0)
    summaryRows.push(
      `${declinedCount} item${declinedCount === 1 ? "" : "s"} declined`,
    );
  summaryRows.push("Data-sheet audit findings closed");

  /* ---------------------------------------------------------------- */
  /* Drawer                                                           */
  /* ---------------------------------------------------------------- */

  const handleFlagAction = useCallback(
    (flagId: string, outcome: FlagActionOutcome, value?: string) => {
      setOpenFlagId(null);
      if (outcome === "defer") {
        push({
          role: "agent",
          kind: "text",
          text: "Deferred — I'll leave the alert open so it doesn't get lost.",
        });
        return;
      }
      if (outcome !== "resolve") return;

      if (value !== undefined) {
        setResolvedValues((prev) => ({ ...prev, [flagId]: value }));
      }

      if (stage === "manual-review") {
        const next = resolvedFlagIds.includes(flagId)
          ? resolvedFlagIds
          : [...resolvedFlagIds, flagId];
        setResolvedFlagIds(next);
        if (manualFlagIds.every((id) => next.includes(id))) runManualPublish();
        return;
      }

      const next = resolvedFlagIds.includes(flagId)
        ? resolvedFlagIds
        : [...resolvedFlagIds, flagId];
      setResolvedFlagIds(next);
      if (specFlagIds.every((id) => next.includes(id))) runVerify();
    },
    [
      manualFlagIds,
      push,
      resolvedFlagIds,
      runManualPublish,
      runVerify,
      specFlagIds,
      stage,
    ],
  );

  const detail = openFlagId ? (flagDetails[openFlagId] ?? null) : null;

  const canAttach =
    !isThinking &&
    activeSession === null &&
    (stage === "launcher" || stage === "audit-upload");

  const handlers: MessageHandlers = {
    resolvedFlagIds,
    resolvedValues,
    publishedDocIds,
    uploadedFile,
    auditPublished,
    auditReviewValues,
    onUpload: handleUpload,
    onOpenUploaded: openUploadedFile,
    onSubagentComplete: handleSubagentComplete,
    onReviewDataSheet: showAuditReview,
    onAuditReviewValueChange: updateAuditReviewValue,
    onPublishDataSheet: publishDataSheet,
    onOpenFlag: setOpenFlagId,
    onOpenSource: openSource,
    onHoverSource: hoverSource,
    onOpenPdf: openPdf,
    onQueueAction: handleQueueAction,
  };

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <AppHeader
        onReset={newConversation}
        title="HVAC Product Data Copilot"
        subtitle="Product Data & Compliance"
        hint={null}
      />
      <div className="relative flex min-h-0 flex-1">
        {leftOpen ? (
          <div className="hidden w-52 shrink-0 lg:block">
            <SessionRail
              sessions={sessions}
              activeId={activeSession}
              onSelect={selectSession}
              onNew={newConversation}
              onCollapse={() => setLeftOpen(false)}
            />
          </div>
        ) : null}

        <main className="flex min-w-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            className="scroll-soft flex-1 overflow-y-auto px-4 py-6 sm:px-6"
          >
            <div className="mx-auto w-full max-w-3xl space-y-4">
              {messages.map((message) => (
                <PlmChatMessage
                  key={message.id}
                  message={message}
                  handlers={handlers}
                />
              ))}

              {!activeItemId &&
              !activeSession &&
              openItems.length > 0 &&
              messages.length === 1 ? (
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => selectQueueItem(openItems[0])}
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    Open {openItems[0].type.toLowerCase()}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}

              {showQueueSummary ? (
                <QueueSummaryCard rows={summaryRows} onNew={newConversation} />
              ) : null}
            </div>
          </div>

          <div className="border-t border-line bg-surface px-4 py-3 sm:px-6">
            <div className="mx-auto w-full max-w-3xl">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
                className="flex items-end gap-2 rounded-2xl border border-line-strong bg-canvas p-1.5 pl-4 focus-within:border-accent/40"
              >
                <textarea
                  ref={composerRef}
                  value={input}
                  rows={2}
                  onChange={(event) => handleInputChange(event.target.value)}
                  onFocus={handleInputFocus}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  disabled={isThinking || composerLocked}
                  placeholder={PLACEHOLDERS[stage]}
                  className="scroll-soft min-w-0 flex-1 resize-none bg-transparent py-2 text-[0.88rem] leading-relaxed text-ink placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!canAttach) return;
                    stopAutofill();
                    setInput("");
                    setPendingExpected(null);
                    setComposerPickerOpen(true);
                  }}
                  disabled={!canAttach}
                  aria-label="Attach an engineering spec"
                  title="Attach an engineering spec"
                  className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-canvas text-muted transition-colors hover:border-line-strong hover:bg-elevated hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  disabled={
                    isThinking ||
                    composerLocked ||
                    isAutoFilling ||
                    !input.trim()
                  }
                  className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </main>

        {rightOpen ? (
          <div className="hidden w-[30%] min-w-[18rem] max-w-md shrink-0 flex-col lg:flex">
            <div className="flex items-center gap-1 border-b border-line bg-surface/80 px-2 py-2">
              {(
                [
                  { id: "items" as const, label: "Alerts" },
                  { id: "workspace" as const, label: "Workspace" },
                ]
              ).map((tab) => {
                const active = rightTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRightTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      active
                        ? "bg-accent-soft text-ink"
                        : "text-muted hover:bg-elevated hover:text-ink-soft"
                    }`}
                  >
                    {tab.label}
                    {tab.id === "items" ? (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-line-strong px-1 font-mono text-[0.56rem] text-muted">
                        {openItems.length}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1">
              {rightTab === "items" ? (
                <OpenItemsPanel
                  items={queue}
                  activeId={activeItemId}
                  newIds={newAlertIds}
                  onSelect={selectQueueItem}
                  onCollapse={() => setRightOpen(false)}
                />
              ) : (
                <WorkspacePanel
                  docs={workspace}
                  references={references}
                  onOpenDoc={openWorkspaceDoc}
                  onOpenPdf={openPdf}
                  onOpenReference={(ref) =>
                    openSource(
                      ref.docId === "manual" ? "manual" : "spec",
                      ref.lineIds,
                    )
                  }
                  onCollapse={() => setRightOpen(false)}
                />
              )}
            </div>
          </div>
        ) : null}

        {!leftOpen ? (
          <button
            type="button"
            onClick={() => setLeftOpen(true)}
            aria-label="Show use cases"
            className="absolute left-2 top-2 z-20 hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:inline-flex"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        ) : null}

        {!rightOpen ? (
          <button
            type="button"
            onClick={() => setRightOpen(true)}
            aria-label="Show workspace"
            className="absolute right-2 top-2 z-20 hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:inline-flex"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <FilePickerModal
        open={composerPickerOpen}
        onClose={() => setComposerPickerOpen(false)}
        onSelect={(file) => {
          setComposerPickerOpen(false);
          handleUpload(file);
        }}
      />

      <DocumentViewer viewer={viewer} onClose={() => setViewer(null)} />
      <PdfModal
        view={pdfView}
        onClose={() => setPdfView(null)}
        onPage={(page) =>
          setPdfView((prev) => (prev ? { ...prev, page } : prev))
        }
      />
      <FlagDrawer
        detail={detail}
        onClose={() => setOpenFlagId(null)}
        onAction={handleFlagAction}
      />
    </div>
  );
}
