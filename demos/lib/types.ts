import type { Manual, Recommendation, StockCheck } from "./mock-data";

export type MessageKind =
  | "text"
  | "thinking"
  | "manuals"
  | "citations"
  | "part"
  | "stockCheck"
  | "recommendation"
  | "callback"
  | "email";

export type ActivityStepState = "pending" | "running" | "done";

export type ActivityStep = {
  label: string;
  ms: number;
  state: ActivityStepState;
  parallel?: boolean;
  startedAt?: number;
};

export type CallbackStatus = "asking" | "done";

export type Callback = {
  phone: string;
  sla: string;
  status: CallbackStatus;
  confirmedPhone?: string;
};

export type EmailStatus = "draft" | "sent" | "discarded";

export type EmailDraft = {
  to: string;
  subject: string;
  body: string;
  replyToName: string;
  replyToRole: string;
  replyToEmail: string;
  replyToPhone: string;
  status: EmailStatus;
};

export type Message = {
  id: string;
  role: "user" | "agent";
  kind: MessageKind;
  text?: string;
  steps?: ActivityStep[];
  seconds?: number;
  streaming?: boolean;
  manuals?: Manual[];
  citations?: number[];
  part?: { partNumber: string; description: string };
  stockCheck?: StockCheck;
  recommendation?: Recommendation;
  callback?: Callback;
  email?: EmailDraft;
};

export type Stage =
  | "ask"
  | "load"
  | "reportVoltage"
  | "reportFlashes"
  | "recommend"
  | "discussion"
  | "handoff"
  | "callback"
  | "email"
  | "complete";
