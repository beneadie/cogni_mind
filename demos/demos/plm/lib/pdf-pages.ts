/**
 * Mock PDF files opened from the demo. Each file is a small set of pages with
 * a heading, a highlighted callout, and body copy — enough to read like a real
 * controlled document without shipping actual binaries.
 */

export type PdfPageContent = {
  page: number;
  subheading: string;
  heading: string;
  highlight?: string;
  body: string[];
};

export type PdfFile = {
  id: string;
  title: string;
  file: string;
  /** Real sample PDF served from /public/manuals, if one exists. */
  url?: string;
  pages: PdfPageContent[];
};

export const PDF_FILES: Record<string, PdfFile> = {
  "dl-2400-spec": {
    id: "dl-2400-spec",
    title: "DL-2400 Engineering Specification",
    file: "DL-2400_revC.pdf",
    url: "/manuals/dl-2400-spec.pdf",
    pages: [
      {
        page: 1,
        subheading: "Section 2.1: Materials",
        heading: "DL-2400 HEAVY-DUTY BRASS DOOR LATCH",
        highlight: "Latch body: forged brass, alloy C36000",
        body: [
          "Latch body: forged brass, alloy C36000.",
          "Springs: phosphor bronze.",
          "Finish: US3 polished brass.",
        ],
      },
      {
        page: 2,
        subheading: "Section 3.2: Dimensions",
        heading: "Dimensions",
        highlight: "Throw: 0.75 in",
        body: [
          "Overall length: 4.5 in.",
          "Backset: 2.375 in.",
          "Throw: 0.75 in.",
        ],
      },
      {
        page: 3,
        subheading: "Section 5.1: Performance",
        heading: "Performance",
        highlight: "Cycle rating: 500,000 cycles minimum",
        body: [
          "Cycle rating: 500,000 cycles minimum.",
          "Corrosion resistance: 96 hours salt spray.",
          "Certifications: ANSI/BHMA A156.13 Grade 1.",
        ],
      },
      {
        page: 4,
        subheading: "Section 7: Notes",
        heading: "Notes",
        body: [
          "Finish: US3 polished brass.",
          "Certifications: ANSI/BHMA A156.13 Grade 1.",
          "This revision supersedes all prior published data sheets.",
        ],
      },
    ],
  },

  "dl-2400-datasheet": {
    id: "dl-2400-datasheet",
    title: "DL-2400 Data Sheet (rev B)",
    file: "DL-2400_datasheet_2019.pdf",
    url: "/manuals/dl-2400-datasheet.pdf",
    pages: [
      {
        page: 1,
        subheading: "Product Data Sheet",
        heading: "DL-2400 — Heavy-Duty Brass Door Latch",
        highlight: "Throw: 0.625 in (published value)",
        body: [
          "Material: forged brass, C36000.",
          "Overall length: 4.5 in.",
          "Throw: 0.625 in.",
          "Cycle rating: 500,000 cycles.",
        ],
      },
      {
        page: 2,
        subheading: "Warranty",
        heading: "Warranty and Support",
        highlight: "Warranty: 10 years",
        body: [
          "Limited warranty: 10 years from date of purchase.",
          "Contact support for replacement parts.",
        ],
      },
    ],
  },

  "dl-2400-manual": {
    id: "dl-2400-manual",
    title: "DL-2400 Installation Manual (rev A)",
    file: "DL-2400_installation_2019.pdf",
    url: "/manuals/dl-2400-manual.pdf",
    pages: [
      {
        page: 4,
        subheading: "Section 1: Tools Required",
        heading: "Tools Required",
        body: ["Drill with 1 in spade bit.", "Phillips screwdriver."],
      },
      {
        page: 5,
        subheading: "Section 2: Rough Opening",
        heading: "Rough Opening",
        body: [
          "Backset: 2-3/8 in (60 mm).",
          "Bore diameter: 2-1/8 in (54 mm).",
        ],
      },
      {
        page: 6,
        subheading: "Section 3: Install Latch",
        heading: "Install Latch",
        highlight: "Throw: 0.625 in standard.",
        body: [
          "Insert the latch into the bore.",
          "Throw: 0.625 in standard.",
        ],
      },
      {
        page: 7,
        subheading: "Section 4: Strike Plate",
        heading: "Strike Plate",
        body: ["Align the strike with the latch bolt."],
      },
      {
        page: 9,
        subheading: "Section 6: Fasteners",
        heading: "Fasteners",
        body: ["Torque fasteners to 15 in-lb."],
      },
    ],
  },

  "maa-200-manual": {
    id: "maa-200-manual",
    title: "MAA-200 Installation Manual (rev A)",
    file: "MAA-200_installation_revA.pdf",
    url: "/manuals/maa-200-manual.pdf",
    pages: [
      {
        page: 1,
        subheading: "Section 1: Scope",
        heading: "MAA-200 Split System — Installation",
        body: [
          "This manual covers the mechanical and electrical installation of the MAA-200.",
          "Read all sections before beginning installation.",
        ],
      },
      {
        page: 12,
        subheading: "Section 7: Electrical",
        heading: "Electrical Connections",
        body: [
          "All field wiring must comply with local codes.",
          "The control circuit is 24 VAC.",
        ],
      },
      {
        page: 14,
        subheading: "Section 7.2: Wiring",
        heading: "Control Wiring Diagram",
        highlight: "Two-wire control connection (rev A).",
        body: [
          "Route control wiring through the grommet on the left-hand panel.",
          "Connect the thermostat to terminals R and C.",
          "Diagram 7.2 shows a two-wire control connection.",
        ],
      },
      {
        page: 16,
        subheading: "Section 8: Startup",
        heading: "Startup and Checkout",
        body: [
          "Confirm the control board LED runs its startup sequence.",
          "Record the supply and return temperatures.",
        ],
      },
    ],
  },

  "maa-200-spec": {
    id: "maa-200-spec",
    title: "MAA-200 Engineering Specification (rev C)",
    file: "MAA-200_spec_revC.pdf",
    url: "/manuals/maa-200-spec.pdf",
    pages: [
      {
        page: 1,
        subheading: "Revision C",
        heading: "MAA-200 Product Specification",
        body: [
          "Refrigerant: R-410A.",
          "Nominal capacity: 24,000 BTU/h.",
        ],
      },
      {
        page: 3,
        subheading: "Section 7.2: Control Wiring",
        heading: "Control Wiring Requirements",
        highlight: "Three-wire control connection required (rev C).",
        body: [
          "The control circuit requires a three-wire connection to the indoor unit.",
          "Terminals R, C, and G must be wired.",
          "This supersedes the two-wire arrangement in earlier revisions.",
        ],
      },
      {
        page: 5,
        subheading: "Section 9: Performance",
        heading: "Performance",
        body: [
          "Operating range: -10 °C to 46 °C.",
          "Sound pressure: 56 dB(A).",
        ],
      },
    ],
  },

  "maa-200-datasheet": {
    id: "maa-200-datasheet",
    title: "MAA-200 Data Sheet (2019)",
    file: "MAA-200_datasheet_2019.pdf",
    url: "/manuals/maa-200-datasheet.pdf",
    pages: [
      {
        page: 1,
        subheading: "Product Data Sheet",
        heading: "MAA-200 — Split System",
        highlight: "Control: 2-wire · Refrigerant: R-410A",
        body: [
          "Nominal capacity: 24,000 BTU/h.",
          "Refrigerant: R-410A.",
          "Control wiring: 2-wire.",
          "Revision B — 2019.",
        ],
      },
    ],
  },
};

export function getPdfFile(docId: string): PdfFile | null {
  return PDF_FILES[docId] ?? null;
}
