import type { Message } from "./types";

export type Manual = {
  id: string;
  brand: string;
  year: string;
  model: string;
  type: string;
  title: string;
  file: string;
};

export type Bookmark = {
  page: number;
  label: string;
  manualId: string;
};

export type PdfPage = {
  page: number;
  manualTitle: string;
  file: string;
  heading: string;
  subheading: string;
  body: string[];
  highlight: string;
};

export type Availability = {
  part: string;
  partNumber: string;
  availability: string;
  warehouses: string;
  leadTime: string;
};

export type Recommendation = {
  finding: string;
  likelyFix: string;
  partNumber: string;
  note: string;
};

export type ActivityStepDef = {
  label: string;
  ms: number;
  parallel?: boolean;
};

export type ManualResearch = {
  id: string;
  file: string;
  pages: number;
  searches: { label: string; ms: number }[];
  results: number;
  matches: { label: string; ms: number }[];
  pagesReferenced: number[];
  /** One-line summary used when composing a reply from multiple manuals. */
  contribution: string;
};

export type MockCase = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  group: "Today" | "Previous 7 days";
  isLive?: boolean;
  thread?: Message[];
};

export const mockManuals: Manual[] = [
  {
    id: "man-1",
    brand: "Carrier",
    year: "2019",
    model: "38MURA",
    type: "Service Manual",
    title: "Carrier 38MURA Service Manual (2019)",
    file: "carrier-38mura-service-2019.pdf",
  },
  {
    id: "man-2",
    brand: "Carrier",
    year: "2019",
    model: "38MURA",
    type: "Installation Manual",
    title: "Carrier 38MURA Installation Manual (2019)",
    file: "carrier-38mura-installation-2019.pdf",
  },
  {
    id: "man-3",
    brand: "Carrier",
    year: "2019",
    model: "38MURA",
    type: "Parts List",
    title: "Carrier 38MURA Parts List (2019)",
    file: "carrier-38mura-parts-2019.pdf",
  },
];

/** The manual the demo loads into context. */
export const SERVICE_MANUAL = mockManuals[0];

/** Per-manual research blocks. When several manuals are selected, their
 *  blocks are composed into one run rather than hand-authoring each combo. */
export const manualResearch: Record<string, ManualResearch> = {
  "man-1": {
    id: "man-1",
    file: "Carrier_38MURA_Service_2019.pdf",
    pages: 28,
    searches: [
      { label: 'Searching "E5 overcurrent"', ms: 1200 },
      { label: 'Searching "blower won\'t spin"', ms: 1200 },
      { label: 'Searching "overcurrent"', ms: 1200 },
    ],
    results: 19,
    matches: [
      { label: "Match: p.6 (Error Code E5: AC Overcurrent)", ms: 900 },
      { label: "Match: p.8 (Blower Motor No Spin)", ms: 900 },
      { label: "Match: p.14 (Wiring Diagram)", ms: 900 },
    ],
    pagesReferenced: [6, 8, 14],
    contribution: "",
  },
  "man-2": {
    id: "man-2",
    file: "Carrier_38MURA_Installation_2019.pdf",
    pages: 22,
    searches: [
      { label: 'Searching "startup sequence and fault codes"', ms: 1200 },
    ],
    results: 7,
    matches: [
      { label: "Match: p.4 (Startup Sequence and Fault Codes)", ms: 900 },
    ],
    pagesReferenced: [4],
    contribution: "the startup table lists E5 as AC overcurrent (p.4)",
  },
  "man-3": {
    id: "man-3",
    file: "Carrier_38MURA_Parts_2019.pdf",
    pages: 20,
    searches: [{ label: 'Searching "control board"', ms: 1200 }],
    results: 4,
    matches: [{ label: "Match: p.3 (Control Box Assembly)", ms: 900 }],
    pagesReferenced: [3],
    contribution: "the control board is CB-38MURA-2019 (p.3)",
  },
};

export const mockPart = {
  partNumber: "CB-38MURA-2019",
  description: "Control Board (2019 Carrier 38MURA)",
};

export const mockAvailability: Availability = {
  part: "Control Board (CB-38MURA-2019)",
  partNumber: "CB-38MURA-2019",
  availability: "In Stock",
  warehouses: "3 regional warehouses",
  leadTime: "1-2 days",
};

/** The technician's profile, used when briefing a human for a callback. */
export const mockUserProfile = {
  phone: "+1 (555) 014-2287",
};

/** How quickly the on-call specialist is expected to call back. */
export const CALLBACK_SLA = "~2 minutes";

export const mockRecommendation: Recommendation = {
  finding:
    "Service Manual p.11: 3 LED flashes indicates an internal control-board fault.",
  likelyFix: "Replace the control board",
  partNumber: "CB-38MURA-2019",
  note: "Assistant recommendation. Technician verifies before ordering.",
};

export const mockCaseHistory: MockCase[] = [
  {
    id: "case-live",
    title: "New conversation",
    subtitle: "",
    tag: "Active",
    group: "Today",
    isLive: true,
  },
  {
    id: "case-2",
    title: "Trane XR15 firing E4 on startup",
    subtitle: "Thermostat code, compressor protection",
    tag: "11:24 AM",
    group: "Today",
    thread: [
      {
        id: "c2-1",
        role: "user",
        kind: "text",
        text: "Trane XR15 with an E4 code. What does it point to?",
      },
      {
        id: "c2-2",
        role: "agent",
        kind: "text",
        text: "E4 on the XR15 usually points to a locked-rotor or high-pressure condition. The service manual lists E4 under the compressor protection codes on page 21.",
      },
    ],
  },
  {
    id: "case-3",
    title: "Carrier 58MCA won't fire, pressure switch fault",
    subtitle: "No heat call, inducer and pressure switch",
    tag: "Yesterday",
    group: "Previous 7 days",
    thread: [
      {
        id: "c3-1",
        role: "user",
        kind: "text",
        text: "58MCA furnace won't fire, I'm getting a pressure switch fault. Where do I start?",
      },
      {
        id: "c3-2",
        role: "agent",
        kind: "text",
        text: "Start with the pressure switch tubing and the inducer. Page 18 of the service manual covers the pressure switch sequence and the common causes of a false fault.",
      },
    ],
  },
  {
    id: "case-4",
    title: "Lennox EL296 runs but no airflow",
    subtitle: "Blower and board output to the motor",
    tag: "Mon",
    group: "Previous 7 days",
    thread: [
      {
        id: "c4-1",
        role: "user",
        kind: "text",
        text: "Lennox EL296 runs but there's no airflow at the vents.",
      },
      {
        id: "c4-2",
        role: "agent",
        kind: "text",
        text: "Check the blower motor and the board output to it first. The EL296 wiring and blower diagnostics are on pages 22 and 23 of the service manual.",
      },
    ],
  },
];

/** Each step is its own timed "tool call". `parallel: true` runs it at the
 *  same time as the previous step (used for concurrent searches). */
export const mockActivity: {
  discover: ActivityStepDef[];
  voltage: ActivityStepDef[];
  flashes: ActivityStepDef[];
  availability: ActivityStepDef[];
  handoff: ActivityStepDef[];
} = {
  discover: [
    { label: 'Searching "Carrier 38MURA E5 blower not working"', ms: 1250 },
    { label: "Reading 6 results", ms: 1100 },
    { label: "3 likely matches identified", ms: 1000 },
  ],
  voltage: [
    { label: 'Searching "CN2 no voltage"', ms: 1200 },
    { label: "Reading 4 results", ms: 1000 },
    { label: "Match: p.14 (Wiring Diagram)", ms: 950 },
  ],
  flashes: [
    { label: 'Searching "control board 3 flashes"', ms: 1200 },
    { label: "Reading 5 results", ms: 1000 },
    { label: "Match: p.11 (Control Board Fault: 3-Flash Code)", ms: 950 },
    { label: "Identifying replacement part CB-38MURA-2019", ms: 1150 },
  ],
  availability: [
    { label: "Checking inventory for CB-38MURA-2019", ms: 1150 },
    { label: "Querying 3 regional warehouses", ms: 1050 },
    { label: "Confirming lead time", ms: 1000 },
  ],
  handoff: [
    { label: "Preparing a brief of this conversation", ms: 1150 },
    { label: "Routing to the on-call technician team", ms: 1050 },
    { label: "Attaching case notes, readings, and manual pages", ms: 1100 },
    { label: "Confirming the callback window", ms: 950 },
  ],
};

const SERVICE_FILE = "carrier-38mura-service-2019.pdf";
const INSTALL_FILE = "carrier-38mura-installation-2019.pdf";
const PARTS_FILE = "carrier-38mura-parts-2019.pdf";

export const mockPdfPages: Record<number, PdfPage> = {
  3: {
    page: 3,
    manualTitle: "Carrier 38MURA Parts List (2019)",
    file: PARTS_FILE,
    heading: "Control Box Assembly",
    subheading: "Section 2: Control Box",
    body: [
      "Item 1: Control board, CB-38MURA-2019.",
      "Item 2: Low-voltage transformer, 24VAC.",
      "Item 3: Blower motor harness, CN2.",
      "Order the control board by its full part number to match the 2019 revision.",
    ],
    highlight: "Item 1: Control board, CB-38MURA-2019.",
  },
  4: {
    page: 4,
    manualTitle: "Carrier 38MURA Installation Manual (2019)",
    file: INSTALL_FILE,
    heading: "Startup Sequence and Fault Codes",
    subheading: "Section 3.1: Startup",
    body: [
      "Power the unit and confirm the board LED runs its startup sequence.",
      "E5 is listed as an AC overcurrent fault in the startup table.",
      "The startup table gives the code meaning only; use the Service Manual for the diagnostic procedure.",
    ],
    highlight: "E5 is listed as an AC overcurrent fault in the startup table.",
  },
  6: {
    page: 6,
    manualTitle: "Carrier 38MURA Service Manual (2019)",
    file: SERVICE_FILE,
    heading: "Error Code E5: AC Overcurrent",
    subheading: "Section 5.2: Fault Codes & Diagnostics",
    body: [
      "E5 indicates an AC overcurrent condition detected at the inverter output.",
      "Before replacing components, verify the blower motor spins freely and confirm line voltage at the indoor unit.",
      "If the motor does not spin, measure the control signal at connector CN2 while the unit is calling for fan.",
    ],
    highlight: "Error Code E5: AC Overcurrent",
  },
  8: {
    page: 8,
    manualTitle: "Carrier 38MURA Service Manual (2019)",
    file: SERVICE_FILE,
    heading: "Blower Motor: No Spin",
    subheading: "Section 5.4: Indoor Blower Diagnostics",
    body: [
      "A blower that will not spin during a call for fan is commonly caused by a missing 24VAC control signal at CN2.",
      "Confirm the motor harness is fully seated, then check for the presence of 24VAC across CN2 pins 1 and 2.",
      "A missing signal points upstream to the control board rather than the motor itself.",
    ],
    highlight: "24VAC across CN2 pins 1 and 2",
  },
  11: {
    page: 11,
    manualTitle: "Carrier 38MURA Service Manual (2019)",
    file: SERVICE_FILE,
    heading: "Control Board Fault: 3-Flash Code",
    subheading: "Section 6.3: Board LED Diagnostics",
    body: [
      "The control board LED reports a fault code at startup.",
      "1 flash: line-voltage fault.",
      "3 flashes: internal control-board fault, replace the board.",
      "Confirm the harness and the low-voltage transformer before ordering a replacement.",
    ],
    highlight: "3 flashes: internal control-board fault, replace the board.",
  },
  14: {
    page: 14,
    manualTitle: "Carrier 38MURA Service Manual (2019)",
    file: SERVICE_FILE,
    heading: "Wiring Diagram: Control Board CN2",
    subheading: "Appendix D: Schematics",
    body: [
      "CN2-1 (RED): 24VAC supply to blower motor control.",
      "CN2-2 (WHT): Common return.",
      "CN2-3 (BLU): Tachometer feedback from motor.",
      "The control board LED flashes a fault code on startup; three flashes indicates an internal board fault.",
    ],
    highlight: "CN2-1 (RED): 24VAC supply to blower motor control.",
  },
  18: {
    page: 18,
    manualTitle: "Carrier 38MURA Service Manual (2019)",
    file: SERVICE_FILE,
    heading: "Control Board Replacement",
    subheading: "Section 7.1: Control Board (CB-38MURA-2019)",
    body: [
      "1. Disconnect power at the service switch and confirm 0VAC at the board.",
      "2. Remove the control-box cover and photograph the harness routing.",
      "3. Disconnect CN1, CN2, and the thermostat terminal block.",
      "4. Remove the two mounting screws and lift the board out.",
      "5. Transfer the configuration jumper to the replacement board, then reverse the steps.",
    ],
    highlight: "Transfer the configuration jumper to the replacement board.",
  },
};
