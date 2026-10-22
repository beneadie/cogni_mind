import type { TurnBeat, TurnPlan, WorkBeat } from "./flow";
import { systems } from "./ingest-data";
import { dl2400ManualDiff } from "./demoData";

export type Resolution = {
  flagId: string;
  /** Human label for the field. */
  field: string;
  /** Value written back to the data sheet once resolved. */
  displayValue: string;
  order: number;
  /** One-line reason used when recommending which field to start with. */
  reason: string;
  /** Short guidance the agent gives before it researches. */
  guidance: string;
  beats: WorkBeat[];
  proposal: { value: string; source: string; rationale: string };
  confirmText: string;
};

export const RESOLUTIONS: Record<string, Resolution> = {
  warranty: {
    flagId: "warranty",
    field: "Warranty",
    displayValue: "10 years",
    order: 1,
    reason: "the rev C spec never states it, and the 2019 sheet carries 10 years",
    guidance:
      "Warranty isn't in the rev C spec at all, so I'll check where it might live — the ERP material master, the 2019 data sheet, and the warranty records.",
    beats: [
      {
        kind: "action",
        label: "Searching the ERP material master",
        command: "erp.material('DL-2400', fields=['warranty'])",
        result: "no value",
        ms: 900,
      },
      {
        kind: "action",
        label: "Reading the 2019 data sheet",
        command: "vault.get('DL-2400_datasheet_2019.pdf#warranty')",
        result: "10 years",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Checking the warranty records",
        command: "records.warranty('DL-2400')",
        result: "10 years",
        ms: 850,
      },
      {
        kind: "observe",
        text: "The rev C spec is silent, but the 2019 data sheet and the warranty records both say 10 years — nothing supersedes it.",
      },
    ],
    proposal: {
      value: "10 years",
      source: "DL-2400_datasheet_2019.pdf, p.2 · Warranty records",
      rationale:
        "The spec never addresses warranty. The last published value still applies and is corroborated by the warranty records.",
    },
    confirmText: "Yes, keep 10 years.",
  },
  weight: {
    flagId: "weight",
    field: "Weight",
    displayValue: "1.2 lbs",
    order: 2,
    reason: "it's required by the template but missing from the spec",
    guidance:
      "Weight is required but the spec never lists it. I'll check the ERP master, the previous data sheet, and the CAD metadata.",
    beats: [
      {
        kind: "action",
        label: "Reading the ERP material master",
        command: "erp.material('DL-2400', fields=['weight'])",
        result: "1.2 lbs",
        ms: 950,
      },
      {
        kind: "action",
        label: "Reading the previous data sheet",
        command: "vault.get('DL-2400_datasheet_2019.pdf#weight')",
        result: "1.2 lbs",
        ms: 950,
      },
      {
        kind: "action",
        label: "Checking the CAD file metadata",
        command: "cad.meta('DL-2400.step').mass",
        result: "1.19 lbs",
        ms: 900,
      },
      {
        kind: "observe",
        text: "Three independent sources agree: the ERP master, the prior data sheet, and the CAD mass.",
      },
    ],
    proposal: {
      value: "1.2 lbs",
      source: "DL-2400_datasheet_2019.pdf, p.1 · ERP material master",
      rationale:
        "Three independent sources agree on 1.2 lbs, so it's safe to carry into the governed sheet.",
    },
    confirmText: "Yes, use 1.2 lbs.",
  },
  fire: {
    flagId: "fire",
    field: "Fire Rating",
    displayValue: "N/A",
    order: 3,
    reason: "it's required, but no value exists anywhere in the spec",
    guidance:
      "Fire Rating is required but the spec is silent. I'll check the certification records and the ANSI/BHMA test reports before assuming it applies.",
    beats: [
      {
        kind: "action",
        label: "Searching the certification records",
        command: "certs.find('DL-2400', kind='fire')",
        result: "none",
        ms: 900,
      },
      {
        kind: "action",
        label: "Reading the ANSI/BHMA test reports",
        command: "reports.get('A156.13')",
        result: "no fire test",
        ms: 1000,
      },
      {
        kind: "observe",
        text: "This hardware class has no fire-rating requirement — Grade 1 covers cycle and security, not fire.",
      },
    ],
    proposal: {
      value: "N/A",
      source: "Certification records · ANSI/BHMA A156.13",
      rationale:
        "No fire rating applies to this product class, so the field should be marked N/A rather than left blank.",
    },
    confirmText: "Yes, mark it N/A.",
  },
  throw: {
    flagId: "throw",
    field: "Throw",
    displayValue: "0.75 in",
    order: 4,
    reason: "the spec and the published sheet disagree",
    guidance:
      "The spec and the published sheet disagree on Throw. I'll re-read both at the source before recommending which value is correct.",
    beats: [
      {
        kind: "action",
        label: "Re-reading the spec dimension",
        command: "spec.section('§3.2').line('throw')",
        result: "0.75 in",
        ms: 950,
      },
      {
        kind: "action",
        label: "Re-reading the published sheet",
        command: "vault.get('datasheet_2019.pdf#throw')",
        result: "0.625 in",
        ms: 950,
      },
      {
        kind: "observe",
        text: "The rev C spec (1987) is the more recent engineering source; the published sheet predates it.",
      },
    ],
    proposal: {
      value: "0.75 in (spec)",
      source: "DL-2400_revC.pdf, §3.2 p.2",
      rationale:
        "rev C is the engineering source of truth and supersedes the older published sheet.",
    },
    confirmText: "Yes, keep the spec value.",
  },
  cycles: {
    flagId: "cycles",
    field: "Cycle Rating",
    displayValue: "500,000 cycles",
    order: 5,
    reason: "the OCR read is low-confidence on a poor scan",
    guidance:
      "The scan is fuzzy around Cycle Rating. I'll re-read it at higher resolution and cross-check the test report.",
    beats: [
      {
        kind: "action",
        label: "Re-OCRing the performance section",
        command: "ocr(page=3, dpi=600)",
        result: "500,000 cycles",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Cross-checking the ANSI/BHMA test report",
        command: "reports.cycles('DL-2400')",
        result: "500,000",
        ms: 1000,
      },
      {
        kind: "observe",
        text: "At 600 dpi the reading is unambiguous: 500,000 — the earlier 0.62 confidence was a scan artifact.",
      },
    ],
    proposal: {
      value: "500,000 cycles",
      source: "revC §5.1 p.3 · ANSI/BHMA test report",
      rationale:
        "A higher-resolution read and the test report agree on 500,000 cycles.",
    },
    confirmText: "Yes, confirm 500,000.",
  },
};

export const RESOLUTION_ORDER = ["warranty", "weight", "fire", "throw", "cycles"];

export function resolutionTurn(flagId: string, onDone: () => void): TurnPlan {
  const resolution = RESOLUTIONS[flagId];
  const beats: TurnBeat[] = [
    { kind: "thought", text: resolution.guidance },
    ...resolution.beats,
    {
      kind: "card",
      message: { role: "agent", kind: "proposal", proposalId: flagId },
    },
    {
      kind: "text",
      text: `I'd set ${resolution.field} to "${resolution.proposal.value}" (${resolution.proposal.source}). Shall I apply it?`,
    },
  ];
  return { beats, onDone };
}

export function specIngestTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "Before I can build anything, I have to reach the data — the spec is a scan, the reference sheet is a separate PDF, and the BOM lives in the ERP.",
      },
      {
        kind: "action",
        label: "Connecting to the PLM document vault",
        command: "vault.connect('ACS')",
        result: "connected",
        ms: 800,
      },
      {
        kind: "action",
        label: "Fetching the scanned engineering spec",
        command: "vault.get('DL-2400_revC.pdf')",
        result: "12 pages",
        ms: 1000,
      },
      { kind: "card", message: { role: "agent", kind: "upload" } },
      {
        kind: "action",
        label: "Fetching the published data sheet",
        command: "vault.get('DL-2400_datasheet_2019.pdf')",
        result: "2 pages",
        ms: 950,
      },
      { kind: "card", message: { role: "agent", kind: "source", sourceId: "published" } },
      {
        kind: "action",
        label: "Reading the ERP bill of materials",
        command: "GET /erp/bom?item=DL-2400",
        result: "14 components",
        ms: 950,
      },
      { kind: "card", message: { role: "agent", kind: "source", sourceId: "bom" } },
      {
        kind: "note",
        tone: "good",
        text: "Three sources in the workspace. Everything downstream traces back to them.",
      },
      {
        kind: "text",
        text: "Ready to extract the data-sheet template from the rev C scan?",
      },
    ],
    onDone,
  };
}

export function extractTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "The scan is 300 dpi. I'll read it and fill the template field by field, flagging anything uncertain rather than guessing.",
      },
      {
        kind: "action",
        label: "Running OCR + layout analysis",
        command: "ocr(layout=True, dpi=300)",
        result: "12 pages",
        ms: 1100,
      },
      {
        kind: "action",
        label: "Extracting the 12 template fields",
        command: "extract(template='datasheet_v3')",
        result: "12 fields",
        ms: 1200,
      },
      {
        kind: "action",
        label: "Cross-checking against the published sheet",
        command: "diff(spec, published)",
        result: "1 conflict",
        ms: 1050,
      },
      {
        kind: "observe",
        text: "Throw reads 0.75 in in the spec but 0.625 in in the published sheet.",
      },
      {
        kind: "observe",
        text: "OCR is unsure about the Cycle Rating — a zero may have dropped off the scan.",
      },
      {
        kind: "action",
        label: "Flagging fields that need a human",
        command: "flag(uncertain)",
        result: "5 fields",
        ms: 900,
      },
      {
        kind: "note",
        tone: "warn",
        text: "Five fields can't be published without a decision.",
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "text",
          text: "Here's the draft data sheet — every value traces back to a source.",
        },
      },
      { kind: "card", message: { role: "agent", kind: "datasheet" } },
      { kind: "card", message: { role: "agent", kind: "exceptions" } },
      {
        kind: "text",
        text: "Click a row to trace it, or a source chip to open the page. I'd start with Warranty — the spec never states it and the 2019 sheet carries 10 years. Shall we begin there?",
      },
    ],
    onDone,
  };
}

export function verifyTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      { kind: "thought", text: "All decisions are in. Let me recompute the change set." },
      {
        kind: "action",
        label: "Recording your decisions",
        command: "apply(decisions)",
        result: "5 resolved",
        ms: 900,
      },
      {
        kind: "action",
        label: "Diffing against the published sheet",
        command: "diff(resolved, published)",
        result: "5 changed",
        ms: 1000,
      },
      { kind: "card", message: { role: "agent", kind: "approval" } },
      {
        kind: "text",
        text: "Nothing is published until you sign off. Approve and publish?",
      },
    ],
    onDone,
  };
}

export function publishTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "Publishing rev D, then I'll check what references the fields that changed.",
      },
      {
        kind: "action",
        label: "Publishing DL-2400 Data Sheet",
        command: "publish(sheet, rev='D')",
        result: "rev D",
        ms: 1100,
      },
      {
        kind: "action",
        label: "Scanning references to changed fields",
        command: "graph.backrefs(changed)",
        result: "3 documents",
        ms: 1100,
      },
      { kind: "card", message: { role: "agent", kind: "propagation" } },
      {
        kind: "text",
        text: "Three documents now need updating. Want me to bring the installation manual current?",
      },
    ],
    onDone,
  };
}

export function manualDraftTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "Pulling the installation manual and diffing it against the approved spec.",
      },
      {
        kind: "action",
        label: "Opening DL-2400 Installation Manual (rev A)",
        command: "vault.get('DL-2400_installation_2019.pdf')",
        result: "rev A",
        ms: 950,
      },
      {
        kind: "action",
        label: "Comparing against approved spec rev C",
        command: "diff(manual, spec.revC)",
        result: "4 changes",
        ms: 1150,
      },
      {
        kind: "card",
        message: { role: "agent", kind: "doc-diff", diff: dl2400ManualDiff },
      },
      { kind: "card", message: { role: "agent", kind: "manual-changes" } },
      {
        kind: "text",
        text: "Four sections change. Review each one to accept or keep the original.",
      },
    ],
    onDone,
  };
}

export function manualPublishTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "action",
        label: "Applying approved changes",
        command: "apply(manual.changes)",
        result: "4 applied",
        ms: 1000,
      },
      {
        kind: "action",
        label: "Republishing Installation Manual",
        command: "publish(manual, rev='C')",
        result: "rev C",
        ms: 1150,
      },
      { kind: "card", message: { role: "agent", kind: "publish-summary" } },
      { kind: "text", text: "Done — the loop is closed." },
      { kind: "card", message: { role: "agent", kind: "doc-health" } },
    ],
    onDone,
  };
}

export function healthTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "I'll index the DL Series registry and compare every document to the latest approved spec.",
      },
      {
        kind: "action",
        label: "Connecting to the document registry",
        command: "registry.list('DL')",
        result: "5 documents",
        ms: 950,
      },
      {
        kind: "action",
        label: "Diffing each document against spec rev C",
        command: "diff(doc, spec.revC)",
        result: "3 need updating",
        ms: 1150,
      },
      { kind: "card", message: { role: "agent", kind: "doc-health" } },
      {
        kind: "text",
        text: "Three documents are out of date — the installation manual trails four revisions. Bring it current?",
      },
    ],
    onDone,
  };
}

export function regulationTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "I'll load the upcoming rules and match the bill of materials against restricted substances.",
      },
      {
        kind: "action",
        label: "Loading RoHS 2027",
        command: "load(regulation='RoHS_2027')",
        result: "Pb · Cd · Cr6",
        ms: 950,
      },
      {
        kind: "action",
        label: "Loading EU Chrome Restriction 2026",
        command: "load(regulation='EU_Chrome_2026')",
        result: "Cr",
        ms: 850,
      },
      {
        kind: "action",
        label: "Matching the BOM against restricted substances",
        command: "bom.match([Pb, Cd, Cr6])",
        result: "4 products",
        ms: 1050,
      },
      {
        kind: "observe",
        text: "DL-2400's C36000 brass carries lead above the RoHS threshold.",
      },
      {
        kind: "action",
        label: "Ranking by affected volume",
        command: "rank(units × risk)",
        result: "ranked",
        ms: 950,
      },
      { kind: "card", message: { role: "agent", kind: "regulation" } },
      {
        kind: "text",
        text: "DL-2400 is the largest exposure — lead in the brass body, 5,200 units shipped in the last 12 months.",
      },
    ],
    onDone,
  };
}

export function legacyTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "I'll turn your description into attributes, then search the archive for a match.",
      },
      {
        kind: "action",
        label: "Parsing the request",
        command: "parse('brass latch 2-3/8 backset 1980s')",
        result: "3 attributes",
        ms: 900,
      },
      {
        kind: "observe",
        text: "material=brass · backset=2.375 in · era=1980s",
      },
      {
        kind: "action",
        label: "Searching archived drawings and catalogs",
        command: "archive.search(attrs)",
        result: "3 parts",
        ms: 1150,
      },
      {
        kind: "action",
        label: "Scoring matches",
        command: "score(matches)",
        result: "96% best",
        ms: 900,
      },
      { kind: "card", message: { role: "agent", kind: "legacy" } },
      {
        kind: "text",
        text: "DL-2400 is a 96% match — the same part whose spec we've been working on.",
      },
    ],
    onDone,
  };
}

export function ingestConnectTurn(onDone: () => void): TurnPlan {
  const beats: TurnBeat[] = [
    {
      kind: "thought",
      text: "Six supplier catalogs live in systems that have never spoken to each other. I'll pull them all into one place.",
    },
  ];
  systems.forEach((system) => {
    beats.push({
      kind: "action",
      label: `Pulling the ${system.name} catalog`,
      command: `${system.method.split(" ")[0].toLowerCase()}.pull()`,
      result: `${system.records} rows`,
      ms: 900,
    });
  });
  beats.push(
    {
      kind: "note",
      tone: "good",
      text: "Six catalogs landed raw in one place — clean, cryptic, ALL-CAPS, and German.",
    },
    { kind: "card", message: { role: "agent", kind: "connections" } },
    { kind: "text", text: "Survey what arrived before I trust any of it?" },
  );
  return { beats, onDone };
}

export function ingestUnderstandTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "Headers can lie. I'll sample rows and confirm what I'm actually looking at.",
      },
      {
        kind: "action",
        label: "Detecting each source's dialect",
        command: "detect(schema)",
        result: "6 dialects",
        ms: 950,
      },
      {
        kind: "action",
        label: "Drawing a random sample across sources",
        command: "df.sample(30, random_state=0)",
        result: "30 rows",
        ms: 950,
      },
      {
        kind: "observe",
        text: "The German file writes “µF” where the others write “MFD” — same unit, different notation.",
      },
      {
        kind: "observe",
        text: "Commas are decimal separators, and prices are in EUR, not dollars.",
      },
      {
        kind: "action",
        label: "Resolving the category vocabulary",
        command: "set(de) - to_english(set(en))",
        result: "8 terms",
        ms: 950,
      },
      {
        kind: "note",
        tone: "warn",
        text: "Three traps confirmed: comma decimals, EUR pricing, German categories.",
      },
      { kind: "card", message: { role: "agent", kind: "ingest-notes" } },
      { kind: "text", text: "Reconcile the records into one master?" },
    ],
    onDone,
  };
}

export function ingestReconcileTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "Now I'll match records across the six sources and escalate anything ambiguous.",
      },
      {
        kind: "action",
        label: "Matching records across sources",
        command: "cluster(records, key=specs)",
        result: "3,873 → 1,500",
        ms: 1200,
      },
      {
        kind: "action",
        label: "Scoring each match",
        command: "confidence(match)",
        result: "conf ≥ 0.95",
        ms: 950,
      },
      {
        kind: "observe",
        text: "One fan blade is ambiguous — same size and blade count, but rotation is missing.",
      },
      {
        kind: "note",
        tone: "warn",
        text: "One match needs a human; the rest are confident.",
      },
      { kind: "card", message: { role: "agent", kind: "master" } },
      {
        kind: "text",
        text: "Master published. Cheapest 64 MFD / 370V capacitor is $12.97 at Delta — 24% below Summit.",
      },
    ],
    onDone,
  };
}
