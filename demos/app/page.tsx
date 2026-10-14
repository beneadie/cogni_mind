"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { CaseHistory } from "@/components/case-history";
import { ChatMessage } from "@/components/chat-message";
import { ContextSidebar } from "@/components/context-sidebar";
import { PdfModal } from "@/components/pdf-modal";
import {
  CornerDownLeft,
  PanelLeftOpen,
  PanelRightOpen,
  Send,
} from "lucide-react";
import {
  SERVICE_MANUAL,
  CALLBACK_SLA,
  manualResearch,
  mockActivity,
  mockAvailability,
  mockCaseHistory,
  mockManuals,
  mockPart,
  mockPdfPages,
  mockRecommendation,
  mockUserProfile,
  type ActivityStepDef,
  type Bookmark,
  type Manual,
} from "@/lib/mock-data";
import type { ActivityStep, Message, Stage } from "@/lib/types";

const LIVE_CASE_ID = "case-live";

const BOOKMARK_LABELS: Record<number, string> = {
  3: "Control Box Assembly",
  4: "Startup & Fault Codes",
  6: "Error Codes",
  8: "Blower Diagnostics",
  11: "Board LED Diagnostics",
  14: "Wiring Diagram",
  18: "Board Replacement",
};

const EXPECTED_INPUT: Partial<Record<Stage, string>> = {
  ask: "Customer's 2019 Carrier 38MURA shows error code E5 and the blower won't spin. What's causing it and how do I fix it?",
  reportVoltage: "No voltage at CN2.",
  reportFlashes: "3 flashes.",
  recommend: "Yes, check availability.",
  discussion: "Show the replacement procedure",
  handoff: "@human",
};

const PLACEHOLDERS: Record<Stage, string> = {
  ask: "Ask about the unit or the fault…",
  load: "Select a manual to continue…",
  reportVoltage: "Report the voltage reading at CN2…",
  reportFlashes: "Report the control-board flash count…",
  recommend: "Reply to the agent…",
  discussion: "Ask a follow-up…",
  handoff: "Type @human to reach a human tech…",
  callback: "Confirm your callback number…",
};

const GREETING: Message = {
  id: "greeting",
  role: "agent",
  kind: "text",
  text: "Here's the open case. Ask me about the unit or the fault, and I'll pull the exact service-manual pages and point you to the likely fix. You stay in control of the diagnosis.",
};

type TurnPlan = {
  steps: ActivityStepDef[];
  messages: Omit<Message, "id">[];
  onDone?: () => void;
};

const STAGGER_MS = 480;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [availableManuals, setAvailableManuals] = useState<Manual[]>([]);
  const [activeManuals, setActiveManuals] = useState<Manual[]>([]);
  const [selectedManualIds, setSelectedManualIds] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [activePdfPage, setActivePdfPage] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>("ask");
  const [input, setInput] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<string>(LIVE_CASE_ID);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const idRef = useRef(0);
  const nextId = useCallback(() => {
    idRef.current += 1;
    return `msg-${idRef.current}`;
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<number[]>([]);
  const autofillRef = useRef<number | null>(null);

  const isLiveCase = activeCaseId === LIVE_CASE_ID;

  const stopAutofill = useCallback(() => {
    if (autofillRef.current !== null) {
      window.clearInterval(autofillRef.current);
      autofillRef.current = null;
    }
    setIsAutoFilling(false);
  }, []);

  const startAutofill = useCallback(
    (target: string) => {
      stopAutofill();
      setIsAutoFilling(true);
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

  const resetDemo = useCallback(() => {
    if (autofillRef.current !== null) {
      window.clearInterval(autofillRef.current);
      autofillRef.current = null;
    }
    setIsAutoFilling(false);
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    setMessages([GREETING]);
    setAvailableManuals([]);
    setActiveManuals([]);
    setSelectedManualIds([]);
    setBookmarks([]);
    setIsThinking(false);
    setPdfModalOpen(false);
    setActivePdfPage(null);
    setStage("ask");
    setInput("");
  }, []);

  const startNewCase = useCallback(() => {
    resetDemo();
    setActiveCaseId(LIVE_CASE_ID);
  }, [resetDemo]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      if (autofillRef.current !== null) {
        window.clearInterval(autofillRef.current);
      }
    };
  }, []);

  const shownMessages = useMemo(
    () =>
      isLiveCase
        ? messages
        : (mockCaseHistory.find((item) => item.id === activeCaseId)?.thread ??
          []),
    [activeCaseId, isLiveCase, messages],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    }
  }, [shownMessages, isThinking]);

  const push = useCallback(
    (message: Omit<Message, "id">) =>
      setMessages((prev) => [...prev, { ...message, id: nextId() }]),
    [nextId],
  );

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);

  const streamTurn = useCallback(
    (plan: TurnPlan) => {
      const thinkingId = nextId();
      const initialSteps: ActivityStep[] = plan.steps.map((step) => ({
        label: step.label,
        ms: step.ms,
        parallel: step.parallel,
        state: "pending",
      }));

      setMessages((prev) => [
        ...prev,
        {
          id: thinkingId,
          role: "agent",
          kind: "thinking",
          steps: initialSteps,
          streaming: true,
          seconds: 0,
        },
      ]);
      setIsThinking(true);

      const startedAt = Date.now();

      const patchStep = (index: number, patch: Partial<ActivityStep>) =>
        setMessages((prev) =>
          prev.map((message) =>
            message.id === thinkingId
              ? {
                  ...message,
                  steps: (message.steps ?? []).map((step, i) =>
                    i === index ? { ...step, ...patch } : step,
                  ),
                }
              : message,
          ),
        );

      const groups: number[][] = [];
      plan.steps.forEach((step, index) => {
        if (step.parallel && groups.length > 0) {
          groups[groups.length - 1].push(index);
        } else {
          groups.push([index]);
        }
      });

      const finish = () => {
        const seconds = Math.max(
          1,
          Math.round((Date.now() - startedAt) / 1000),
        );
        setMessages((prev) =>
          prev.map((message) =>
            message.id === thinkingId
              ? { ...message, streaming: false, seconds }
              : message,
          ),
        );

        let delay = 240;
        plan.messages.forEach((message) => {
          after(delay, () => push(message));
          delay += STAGGER_MS;
        });

        after(delay, () => {
          setIsThinking(false);
          plan.onDone?.();
        });
      };

      const runGroup = (groupIndex: number) => {
        if (groupIndex >= groups.length) {
          after(180, finish);
          return;
        }

        const group = groups[groupIndex];
        const groupStart = Date.now();
        group.forEach((index) =>
          patchStep(index, { state: "running", startedAt: groupStart }),
        );
        const duration = Math.max(...group.map((index) => plan.steps[index].ms));

        after(duration, () => {
          group.forEach((index) => patchStep(index, { state: "done" }));
          after(140, () => runGroup(groupIndex + 1));
        });
      };

      after(300, () => runGroup(0));
    },
    [after, nextId, push],
  );

  const addBookmark = useCallback((page: number, manualId: string) => {
    setBookmarks((prev) =>
      prev.some((b) => b.page === page && b.manualId === manualId)
        ? prev
        : [
            ...prev,
            { page, label: BOOKMARK_LABELS[page] ?? "Reference", manualId },
          ],
    );
  }, []);

  const startHandoff = useCallback(() => {
    setStage("callback");
    streamTurn({
      steps: mockActivity.handoff,
      messages: [
        {
          role: "agent",
          kind: "text",
          text: "I can't quote exact pricing or an installation window from here, but I can connect you with a human specialist. Let me brief them first so you don't have to repeat anything.",
        },
        {
          role: "agent",
          kind: "text",
          text: "Briefing sent — this conversation, the CN2 readings, the recommended part, and the manual pages are attached. The estimated wait time is 2 minutes, and a specialist will call you as soon as possible.",
        },
        {
          role: "agent",
          kind: "callback",
          callback: {
            phone: mockUserProfile.phone,
            sla: CALLBACK_SLA,
            status: "asking",
          },
        },
      ],
    });
  }, [streamTurn]);

  const processTurn = useCallback(
    (text: string, current: Stage) => {
      push({ role: "user", kind: "text", text });

      if (/(^|\s)@human\b/i.test(text)) {
        startHandoff();
        return;
      }

      switch (current) {
        case "ask":
          streamTurn({
            steps: mockActivity.discover,
            messages: [
              {
                role: "agent",
                kind: "text",
                text: "I found 3 manuals for the 2019 Carrier 38MURA. Select the ones you'd like me to load into context.",
              },
              { role: "agent", kind: "manuals", manuals: mockManuals },
            ],
            onDone: () => {
              setAvailableManuals(mockManuals);
              setStage("load");
            },
          });
          break;

        case "reportVoltage":
          streamTurn({
            steps: mockActivity.voltage,
            messages: [
              {
                role: "agent",
                kind: "text",
                text: "Then the fault is upstream of the motor. The manual's next step is to read the control-board LED and count the flashes. What do you see?",
              },
            ],
            onDone: () => {
              addBookmark(11, SERVICE_MANUAL.id);
              setStage("reportFlashes");
            },
          });
          break;

        case "reportFlashes":
          streamTurn({
            steps: mockActivity.flashes,
            messages: [
              {
                role: "agent",
                kind: "text",
                text: "The Service Manual indicates 3 LED flashes means an internal control-board fault (p.11). Likely fix is to replace the control board. Part: CB-38MURA-2019. That's a recommendation, not a confirmed diagnosis.",
              },
              { role: "agent", kind: "part", part: mockPart },
              {
                role: "agent",
                kind: "recommendation",
                recommendation: mockRecommendation,
              },
              {
                role: "agent",
                kind: "text",
                text: "Want me to check availability for this part?",
              },
            ],
            onDone: () => setStage("recommend"),
          });
          break;

        case "recommend":
          if (/^(no|nope|not now|later)\b/i.test(text.trim())) {
            after(500, () => {
              push({
                role: "agent",
                kind: "text",
                text: "No problem. The recommendation stays on the case. Ask me anything else.",
              });
              setStage("discussion");
            });
            break;
          }
          streamTurn({
            steps: mockActivity.availability,
            messages: [
              {
                role: "agent",
                kind: "text",
                text: "The control board is in stock at 3 regional warehouses with a 1-2 day lead time.",
              },
              {
                role: "agent",
                kind: "availability",
                availability: mockAvailability,
              },
              {
                role: "agent",
                kind: "text",
                text: "Want me to add it to the case notes, or look up anything else?",
              },
            ],
            onDone: () => setStage("discussion"),
          });
          break;

        case "discussion": {
          const lower = text.toLowerCase();

          if (/replace|procedure|swap|step/.test(lower)) {
            after(650, () => {
              push({
                role: "agent",
                kind: "text",
                text: "Here's the control-board replacement procedure from the Service Manual:\n\n1. Disconnect power at the service switch and confirm 0VAC.\n2. Photograph the harness routing, then disconnect CN1, CN2, and the thermostat block.\n3. Remove the two mounting screws and lift the board out.\n4. Transfer the configuration jumper to the replacement board and reverse the steps.",
              });
              push({ role: "agent", kind: "citations", citations: [18] });
              setStage("handoff");
              startAutofill("@human");
            });
            break;
          }

          let reply: Omit<Message, "id">[];

          if (/another|new unit|different|next unit/.test(lower)) {
            reply = [
              {
                role: "agent",
                kind: "text",
                text: "Sure. Tell me the make, model, and the fault, and I'll start a fresh lookup.",
              },
            ];
          } else if (/note|case/.test(lower)) {
            reply = [
              {
                role: "agent",
                kind: "text",
                text: "Added to the case notes: control-board fault recommended, part CB-38MURA-2019, in stock with a 1-2 day lead time.",
              },
            ];
          } else {
            reply = [
              {
                role: "agent",
                kind: "text",
                text: "I can pull the control-board replacement procedure, check another unit, or add a note to the case. What would you like?",
              },
            ];
          }

          after(650, () => reply.forEach(push));
          break;
        }

        case "handoff":
          startHandoff();
          break;

        case "load":
          break;
      }
    },
    [addBookmark, after, push, startAutofill, startHandoff, streamTurn],
  );

  const submit = useCallback(
    (override?: string) => {
      if (!isLiveCase) return;
      const text = (override ?? input).trim();
      if (!text || isThinking) return;
      stopAutofill();
      setInput("");
      processTurn(text, stage);
    },
    [input, isLiveCase, isThinking, processTurn, stage, stopAutofill],
  );

  const handleInputFocus = useCallback(() => {
    if (!isLiveCase || isThinking || stage === "load" || input) return;
    const target = EXPECTED_INPUT[stage];
    if (target) startAutofill(target);
  }, [input, isLiveCase, isThinking, stage, startAutofill]);

  const handleInputChange = useCallback(
    (value: string) => {
      if (isAutoFilling) stopAutofill();
      setInput(value);
    },
    [isAutoFilling, stopAutofill],
  );

  const toggleManual = useCallback(
    (id: string) => {
      if (stage !== "load") return;
      setSelectedManualIds((prev) =>
        prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
      );
    },
    [stage],
  );

  const loadSelected = useCallback(() => {
    if (stage !== "load" || selectedManualIds.length === 0) return;

    const chosen = mockManuals.filter((manual) =>
      selectedManualIds.includes(manual.id),
    );
    const includesService = selectedManualIds.includes(SERVICE_MANUAL.id);

    setAvailableManuals((prev) =>
      prev.filter((manual) => !selectedManualIds.includes(manual.id)),
    );
    setActiveManuals((prev) => {
      const ids = new Set(prev.map((manual) => manual.id));
      return [...prev, ...chosen.filter((manual) => !ids.has(manual.id))];
    });
    setSelectedManualIds([]);

    // Compose one run from the selected manuals' research blocks.
    const steps: ActivityStepDef[] = [];
    chosen.forEach((manual) => {
      const research = manualResearch[manual.id];
      steps.push({
        label: `Loading and indexing ${research.file} (${research.pages} pages)`,
        ms: 1200,
      });
    });

    const searches = chosen.flatMap(
      (manual) => manualResearch[manual.id].searches,
    );
    searches.forEach((search, index) =>
      steps.push({ ...search, parallel: index > 0 }),
    );

    const totalResults = chosen.reduce(
      (sum, manual) => sum + manualResearch[manual.id].results,
      0,
    );
    steps.push({ label: `Reading ${totalResults} results`, ms: 1100 });

    chosen.forEach((manual) =>
      manualResearch[manual.id].matches.forEach((match) => steps.push(match)),
    );
    steps.push({ label: "Synthesizing answer", ms: 1200 });

    const pages = chosen.flatMap(
      (manual) => manualResearch[manual.id].pagesReferenced,
    );
    const contributions = chosen
      .filter((manual) => manual.id !== SERVICE_MANUAL.id)
      .map((manual) => manualResearch[manual.id].contribution)
      .filter(Boolean);

    const onDone = () => {
      chosen.forEach((manual) =>
        manualResearch[manual.id].pagesReferenced.forEach((page) =>
          addBookmark(page, manual.id),
        ),
      );
      setStage("reportVoltage");
    };

    if (includesService) {
      const base =
        "E5 is an AC overcurrent fault. On the 38MURA it's most often a lost blower control signal, not a failed motor. Start by checking for 24VAC at connector CN2.";
      const text = contributions.length
        ? `${base} Also loaded: ${contributions.join("; ")}.`
        : base;

      push({
        role: "agent",
        kind: "text",
        text: "Service Manual loaded into context.",
      });
      streamTurn({
        steps,
        messages: [
          { role: "agent", kind: "text", text },
          { role: "agent", kind: "citations", citations: pages },
        ],
        onDone,
      });
    } else {
      streamTurn({
        steps,
        messages: [
          {
            role: "agent",
            kind: "text",
            text: `From the loaded context: ${contributions.join(
              "; ",
            )}. I can still guide the E5 checks from here — start by checking for 24VAC at connector CN2.`,
          },
          { role: "agent", kind: "citations", citations: pages },
        ],
        onDone,
      });
    }
  }, [addBookmark, push, selectedManualIds, stage, streamTurn]);

  const openPage = useCallback((page: number) => {
    setActivePdfPage(page);
    setPdfModalOpen(true);
  }, []);

  const closePdf = useCallback(() => {
    setPdfModalOpen(false);
    setActivePdfPage(null);
  }, []);

  const handleCheckAvailability = useCallback(() => {
    if (stage === "recommend" && !isThinking) {
      stopAutofill();
      processTurn("Yes, check availability.", stage);
    }
  }, [isThinking, processTurn, stage, stopAutofill]);

  const handleCallbackConfirm = useCallback(
    (choice: "yes" | "no", phone: string) => {
      if (stage !== "callback") return;
      const confirmed = choice === "yes" ? mockUserProfile.phone : phone;
      stopAutofill();
      push({
        role: "user",
        kind: "text",
        text: choice === "yes" ? "Yes, that number is fine." : confirmed,
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.kind === "callback" &&
          message.callback &&
          message.callback.status === "asking"
            ? {
                ...message,
                callback: {
                  ...message.callback,
                  status: "done",
                  confirmedPhone: confirmed,
                },
              }
            : message,
        ),
      );
      after(500, () => {
        push({
          role: "agent",
          kind: "text",
          text:
            choice === "yes"
              ? `Done — you're on the callback list. A specialist will call ${confirmed} within about 2 minutes. I'll keep this case updated if anything changes.`
              : `Got it — I've updated the callback number to ${confirmed}. A specialist will call you there within about 2 minutes. I'll keep this case updated if anything changes.`,
        });
        setStage("discussion");
      });
    },
    [after, push, stage, stopAutofill],
  );

  const inputLocked =
    !isLiveCase || isThinking || stage === "load" || stage === "callback";
  const manualHint = isLiveCase && stage === "load" && !isThinking;
  const viewingCase = mockCaseHistory.find((item) => item.id === activeCaseId);

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <AppHeader onReset={startNewCase} />

      <div className="relative flex min-h-0 flex-1">
        {leftOpen ? (
          <div className="hidden w-48 shrink-0 lg:block">
            <CaseHistory
              cases={mockCaseHistory}
              activeCaseId={activeCaseId}
              onSelectCase={setActiveCaseId}
              onNewCase={startNewCase}
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
              {!isLiveCase && viewingCase ? (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-line-strong bg-elevated/60 px-3.5 py-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-muted">
                  Viewing a past case
                  <button
                    type="button"
                    onClick={() => setActiveCaseId(LIVE_CASE_ID)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-ink-soft transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <CornerDownLeft className="h-3.5 w-3.5" />
                    Back to active case
                  </button>
                </div>
              ) : null}

              {shownMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  selectedManualIds={isLiveCase ? selectedManualIds : []}
                  manualsLocked={!isLiveCase || stage !== "load" || isThinking}
                  manualHint={manualHint}
                  onToggleManual={isLiveCase ? toggleManual : undefined}
                  onLoadSelected={isLiveCase ? loadSelected : undefined}
                  onCitation={openPage}
                  onCheckAvailability={handleCheckAvailability}
                  onCallbackConfirm={handleCallbackConfirm}
                />
              ))}
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
                  value={input}
                  rows={3}
                  onChange={(event) => handleInputChange(event.target.value)}
                  onFocus={handleInputFocus}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  disabled={inputLocked}
                  placeholder={
                    isLiveCase
                      ? PLACEHOLDERS[stage]
                      : "Viewing a past case. Start a new case to chat."
                  }
                  className="scroll-soft min-w-0 flex-1 resize-none bg-transparent py-2 text-[0.88rem] leading-relaxed text-ink placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={inputLocked || isAutoFilling || !input.trim()}
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
          <div className="hidden w-[30%] min-w-[18rem] max-w-md shrink-0 lg:block">
            <ContextSidebar
              availableManuals={isLiveCase ? availableManuals : []}
              activeManuals={isLiveCase ? activeManuals : []}
              bookmarks={isLiveCase ? bookmarks : []}
              selectedManualIds={isLiveCase ? selectedManualIds : []}
              selectionEnabled={isLiveCase && stage === "load" && !isThinking}
              onToggleManual={toggleManual}
              onOpenBookmark={openPage}
              onCollapse={() => setRightOpen(false)}
            />
          </div>
        ) : null}

        {!leftOpen ? (
          <button
            type="button"
            onClick={() => setLeftOpen(true)}
            aria-label="Show cases"
            className="absolute left-2 top-2 z-20 hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:inline-flex"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        ) : null}

        {!rightOpen ? (
          <button
            type="button"
            onClick={() => setRightOpen(true)}
            aria-label="Show context"
            className="absolute right-2 top-2 z-20 hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:inline-flex"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <PdfModal
        page={pdfModalOpen && activePdfPage ? mockPdfPages[activePdfPage] : null}
        onClose={closePdf}
      />
    </div>
  );
}
