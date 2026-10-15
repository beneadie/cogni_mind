// PURPOSE: Keyword/synonym tables the local classifier matches: one cue rule per failure type, plus negation words.
// ROLE: classifier (data). USED BY: classifier/local.ts.
// Patterns include the typos and shop slang seen in old free-text records ("comp", "compresser", "leeking", "weeping").

import type { FailureType } from "../contracts";

/** A family of words; a rule needs one hit from each of its groups in the same clause. */
export type TermGroup = {
  /** Plain-language name shown as the evidence cue. */
  label: string;
  /** Must carry the "g" flag (matched with matchAll). */
  pattern: RegExp;
  /** Symptom groups can be negated ("no leak found"); component groups cannot. */
  symptom: boolean;
};

/** Everything needed to suggest one failure type from free text. */
export type CueRule = {
  failureType: FailureType;
  groups: readonly TermGroup[];
  /** Plain-language rule shown in the step list when it fires. */
  rule: string;
  /** A located leak explains low refrigerant, so the leak wins instead of competing with its own symptom. */
  suppressedBy?: readonly FailureType[];
};

// --- Shared word families ---

const LEAK: TermGroup = {
  label: "leak term",
  pattern: /\b(?:leak\w*|leek\w*|weep\w*|seep\w*|oil(?:y)? (?:residue|stain|spot|mess)|bubbl\w*)/gi,
  symptom: true,
};
const COMPRESSOR: TermGroup = { label: "compressor term", pattern: /\b(?:compr?[eo]?s{1,2}[eo]rs?|comp)\b/gi, symptom: false };
const COIL: TermGroup = { label: "coil term", pattern: /\b(?:a-coil|coils?|evap(?:orator)?)\b/gi, symptom: false };
const FAILED = /\b(?:fault\w*|fail\w*|dead|fried|burn\w*|seized|won'?t spin|not spinning|squeal\w*|grind\w*|bearings?)\b/gi;

// --- Cue rules (one per failure type, same order as FAILURE_TYPES) ---

// "Leak" alone is never enough: ACS's new form separates compressor leaks from coil leaks, so a leak
// only becomes a failure type when the same clause also names where it is.
/** Cue rules for every failure type the local classifier can suggest. */
export const CUE_RULES: readonly CueRule[] = [
  { failureType: "compressor_leak", groups: [COMPRESSOR, LEAK], rule: "Compressor term + leak term in the same clause → Compressor leak" },
  { failureType: "coil_leak", groups: [COIL, LEAK], rule: "Coil term + leak term in the same clause → Coil leak" },
  {
    failureType: "refrigerant_low",
    groups: [
      {
        label: "low-charge term",
        pattern: /\b(?:low (?:on )?(?:freon|refrigerant|charge|gas)|under ?charged|topped (?:it )?off|top[- ]off|recharged?)\b/gi,
        symptom: true,
      },
    ],
    rule: "Low-charge term with no located leak → Refrigerant low",
    suppressedBy: ["compressor_leak", "coil_leak"],
  },
  {
    failureType: "control_board_fault",
    groups: [
      { label: "control board term", pattern: /\b(?:board|pcb)\b/gi, symptom: false },
      { label: "fault term", pattern: /\b(?:fault\w*|fail\w*|dead|fried|burn\w*|error code|flash\w*|blink\w*)\b/gi, symptom: true },
    ],
    rule: "Board term + fault term in the same clause → Control board fault",
  },
  {
    failureType: "fan_motor_failure",
    groups: [
      { label: "fan/motor term", pattern: /\b(?:fan|blower|motor)s?\b/gi, symptom: false },
      { label: "failure term", pattern: FAILED, symptom: true },
    ],
    rule: "Fan or motor term + failure term in the same clause → Fan motor failure",
  },
  {
    failureType: "door_latch_panel",
    groups: [
      { label: "latch/panel term", pattern: /\b(?:latch\w*|door|panel|cabinet)\b/gi, symptom: false },
      { label: "damage term", pattern: /\b(?:broke\w*|loose|rattl\w*|won'?t close|missing|bent|stuck)\b/gi, symptom: true },
    ],
    rule: "Latch or panel term + damage term in the same clause → Door latch / panel",
  },
  {
    failureType: "condensate_drain",
    groups: [
      { label: "drain term", pattern: /\b(?:condensate|drain(?: line| pan)?|float switch)\b/gi, symptom: false },
      { label: "blockage term", pattern: /\b(?:clog\w*|block\w*|overflow\w*|backed up|water on|leak\w*)/gi, symptom: true },
    ],
    rule: "Drain term + blockage term in the same clause → Condensate drain",
  },
  {
    failureType: "electrical_trip",
    groups: [
      { label: "breaker/fuse term", pattern: /\b(?:breakers?|fuses?|contactor)\b/gi, symptom: false },
      { label: "trip term", pattern: /\b(?:trip\w*|blow\w*|blown|pop\w*|short\w*)\b/gi, symptom: true },
    ],
    rule: "Breaker or fuse term + trip term in the same clause → Electrical / breaker trip",
  },
];

/** Words that cancel a symptom when they come before it in the same clause ("no leak found"). */
export const NEGATION = /\b(?:no|not|never|without|isn'?t|wasn'?t|didn'?t|doesn'?t|ruled out|negative for)\b/i;

/** Clause boundaries: a cue only counts when its words sit in the same sentence fragment. */
export const CLAUSE_SPLIT = /[.;!?\n]+|,\s*/;
