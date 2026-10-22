import type { EmailDraft, Stage } from "./types";
import {
  CASE_ID,
  SUPPORT_EMAIL,
  mockStockCheck,
  mockUserProfile,
} from "./mock-data";

const STAGE_ORDER: Stage[] = [
  "ask",
  "load",
  "reportVoltage",
  "reportFlashes",
  "recommend",
  "discussion",
  "handoff",
  "callback",
  "email",
  "complete",
];

function reached(stage: Stage, threshold: Stage): boolean {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(threshold);
}

export function buildEmailDraft({
  problem,
  stage,
  hasStockCheck,
  loadedManuals,
}: {
  problem: string;
  stage: Stage;
  hasStockCheck: boolean;
  loadedManuals: string[];
}): EmailDraft {
  const tried: string[] = [];

  if (loadedManuals.length > 0) {
    tried.push(`Loaded ${loadedManuals.join(", ")} into context.`);
  }
  if (reached(stage, "reportFlashes")) {
    tried.push("Checked for 24VAC at connector CN2; there was no voltage.");
  }
  if (reached(stage, "recommend")) {
    tried.push(
      "Read the control-board LED: 3 flashes, which the manual identifies as an internal control-board fault (p.11).",
    );
    tried.push(
      "Recommended replacing the control board, part CB-38MURA-2019 (technician to verify).",
    );
  }
  if (hasStockCheck) {
    tried.push(
      `Requested a nearby-warehouse stock check for ${mockStockCheck.partNumber}; assigned to ${mockStockCheck.assignee} (${mockStockCheck.assigneeRole}). Availability and lead time are pending.`,
    );
  }

  if (tried.length === 0) {
    tried.push("No troubleshooting steps have been tried yet.");
  }

  const body = [
    "Hi Customer Support,",
    "",
    "Please help with the following field issue.",
    "",
    `Case: ${CASE_ID}`,
    "Unit: 2019 Carrier 38MURA (error code E5)",
    "",
    "Reported problem:",
    problem,
    "",
    "What we've tried so far:",
    ...tried.map((step) => `- ${step}`),
    "",
    "Please reply to:",
    mockUserProfile.name,
    `${mockUserProfile.role}, ${mockUserProfile.company}`,
    mockUserProfile.email,
    mockUserProfile.phone,
    "",
    "Thanks,",
    mockUserProfile.name,
  ].join("\n");

  return {
    to: SUPPORT_EMAIL,
    subject: `[${CASE_ID}] 2019 Carrier 38MURA - E5 fault, blower not spinning`,
    body,
    replyToName: mockUserProfile.name,
    replyToRole: `${mockUserProfile.role}, ${mockUserProfile.company}`,
    replyToEmail: mockUserProfile.email,
    replyToPhone: mockUserProfile.phone,
    status: "draft",
  };
}
