// Generates richer, dependency-free sample manual PDFs into public/manuals.
// Run: node scripts/generate-manuals.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "manuals");

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = [0.13, 0.12, 0.1];
const SOFT = [0.28, 0.26, 0.24];
const MUTED = [0.5, 0.48, 0.45];
const AMBER = [0.44, 0.3, 0.12];
const LINE = [0.74, 0.72, 0.68];
const LINE_S = [0.55, 0.53, 0.5];
const PAPER = [0.995, 0.992, 0.985];
const PANEL = [0.955, 0.94, 0.915];

const escapeText = (text) =>
  String(text)
    .replace(/[^\x20-\x7E]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

function wrapText(text, size, maxWidth, font) {
  const factor = font === "F3" ? 0.6 : font === "F2" ? 0.55 : 0.5;
  const maxChars = Math.max(6, Math.floor(maxWidth / (size * factor)));
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

class Page {
  constructor() {
    this.ops = [];
    this.y = MARGIN + 6;
  }

  pdfY(yTop) {
    return PAGE_H - yTop;
  }

  rg(color) {
    return `${color.join(" ")} rg`;
  }

  RG(color) {
    return `${color.join(" ")} RG`;
  }

  drawText(text, x, yTop, opts = {}) {
    const {
      font = "F1",
      size = 10.5,
      color = SOFT,
      maxWidth = CONTENT_W,
      leading = size * 1.4,
    } = opts;
    const lines = wrapText(text, size, maxWidth, font);
    let y = yTop;
    for (const line of lines) {
      const yy = this.pdfY(y + size);
      this.ops.push(
        `BT /${font} ${size} Tf ${this.rg(color)} 1 0 0 1 ${x} ${yy} Tm (${escapeText(
          line,
        )}) Tj ET`,
      );
      y += leading;
    }
    return y;
  }

  text(str, opts = {}) {
    this.y = this.drawText(str, opts.x ?? MARGIN, this.y, opts);
    this.y += opts.after ?? 8;
    return this;
  }

  centerText(text, x0, yTop, w, opts = {}) {
    const size = opts.size ?? 10;
    const font = opts.font ?? "F1";
    const factor = font === "F3" ? 0.6 : font === "F2" ? 0.55 : 0.5;
    const est = Math.min(w, String(text).length * size * factor);
    return this.drawText(text, x0 + (w - est) / 2, yTop, {
      ...opts,
      size,
      font,
      maxWidth: w,
    });
  }

  line(x1, yTop1, x2, yTop2, { stroke = LINE_S, lw = 0.7 } = {}) {
    const y1 = this.pdfY(yTop1);
    const y2 = this.pdfY(yTop2);
    this.ops.push(
      `${this.RG(stroke)} ${lw} w ${x1} ${y1} m ${x2} ${y2} l S`,
    );
  }

  fillRect(x, yTop, w, h, fill) {
    const y = this.pdfY(yTop + h);
    this.ops.push(`${this.rg(fill)} ${x} ${y} ${w} ${h} re f`);
  }

  rect(x, yTop, w, h, { stroke = LINE_S, fill = null, lw = 0.7 } = {}) {
    const y = this.pdfY(yTop + h);
    if (fill) this.ops.push(`${this.rg(fill)} ${x} ${y} ${w} ${h} re f`);
    if (stroke) {
      this.ops.push(
        `${this.RG(stroke)} ${lw} w ${x} ${y} ${w} ${h} re S`,
      );
    }
  }

  circle(cx, cyTop, r, { stroke = null, fill = null, lw = 0.7 } = {}) {
    const cy = this.pdfY(cyTop);
    const k = 0.5523 * r;
    const path =
      `${cx + r} ${cy} m ` +
      `${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r} c ` +
      `${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy} c ` +
      `${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r} c ` +
      `${cx + k} ${cy - r} ${cx + r} ${cy - k} ${cx + r} ${cy} c`;
    if (fill) this.ops.push(`${this.rg(fill)} ${path} f`);
    if (stroke) this.ops.push(`${this.RG(stroke)} ${lw} w ${path} S`);
  }

  polygon(points, { stroke = null, fill = null, lw = 0.7 } = {}) {
    let path = `${points[0][0]} ${this.pdfY(points[0][1])} m `;
    for (let i = 1; i < points.length; i++) {
      path += `${points[i][0]} ${this.pdfY(points[i][1])} l `;
    }
    path += "h";
    if (fill) this.ops.push(`${this.rg(fill)} ${path} f`);
    if (stroke) this.ops.push(`${this.RG(stroke)} ${lw} w ${path} S`);
  }

  arrow(x1, yTop1, x2, yTop2, color = [0.4, 0.38, 0.34]) {
    this.line(x1, yTop1, x2, yTop2, { stroke: color, lw: 0.9 });
    const y1 = this.pdfY(yTop1);
    const y2 = this.pdfY(yTop2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 6;
    const a1 = angle + Math.PI - 0.42;
    const a2 = angle + Math.PI + 0.42;
    this.ops.push(
      `${this.RG(color)} 0.9 w ${x2} ${y2} m ${x2 + len * Math.cos(a1)} ${y2 + len * Math.sin(a1)} l S`,
    );
    this.ops.push(
      `${this.RG(color)} 0.9 w ${x2} ${y2} m ${x2 + len * Math.cos(a2)} ${y2 + len * Math.sin(a2)} l S`,
    );
  }

  pageHeader(title, pageNum, total) {
    this.drawText(title, MARGIN, MARGIN - 24, {
      font: "F2",
      size: 8.5,
      color: MUTED,
      maxWidth: CONTENT_W - 90,
      leading: 10,
    });
    this.drawText(`${pageNum} / ${total}`, PAGE_W - MARGIN - 60, MARGIN - 24, {
      font: "F1",
      size: 8.5,
      color: MUTED,
      maxWidth: 60,
      leading: 10,
    });
    this.line(MARGIN, MARGIN - 8, PAGE_W - MARGIN, MARGIN - 8, {
      stroke: LINE,
      lw: 0.7,
    });
    this.y = MARGIN + 6;
  }

  pageFooter(pageNum) {
    const yTop = PAGE_H - MARGIN + 6;
    this.line(MARGIN, yTop - 6, PAGE_W - MARGIN, yTop - 6, {
      stroke: LINE,
      lw: 0.7,
    });
    this.drawText(
      "Carrier 38MURA  |  Confidential  |  Prototype sample",
      MARGIN,
      yTop,
      { font: "F1", size: 7.5, color: MUTED, maxWidth: CONTENT_W - 70, leading: 9 },
    );
    this.drawText(`Page ${pageNum}`, PAGE_W - MARGIN - 60, yTop, {
      font: "F1",
      size: 7.5,
      color: MUTED,
      maxWidth: 60,
      leading: 9,
    });
  }

  heading(text) {
    this.y = this.drawText(text, MARGIN, this.y, {
      font: "F2",
      size: 17,
      color: INK,
      maxWidth: CONTENT_W,
      leading: 21,
    });
    this.y += 8;
  }

  subheading(text) {
    this.y = this.drawText(text, MARGIN, this.y, {
      font: "F2",
      size: 11.5,
      color: AMBER,
      maxWidth: CONTENT_W,
      leading: 15,
    });
    this.y += 4;
  }

  paragraph(text) {
    this.y = this.drawText(text, MARGIN, this.y, {
      font: "F1",
      size: 10.5,
      color: SOFT,
      maxWidth: CONTENT_W,
      leading: 15,
    });
    this.y += 8;
  }

  bullets(items) {
    for (const item of items) {
      this.circle(MARGIN + 4, this.y + 7, 1.5, { fill: AMBER });
      this.y = this.drawText(item, MARGIN + 15, this.y, {
        font: "F1",
        size: 10.5,
        color: SOFT,
        maxWidth: CONTENT_W - 15,
        leading: 15,
      });
    }
    this.y += 8;
  }

  numbered(items) {
    items.forEach((item, index) => {
      this.y = this.drawText(`${index + 1}.`, MARGIN, this.y, {
        font: "F2",
        size: 10.5,
        color: AMBER,
        maxWidth: 20,
        leading: 15,
      });
      this.y = this.drawText(item, MARGIN + 18, this.y, {
        font: "F1",
        size: 10.5,
        color: SOFT,
        maxWidth: CONTENT_W - 18,
        leading: 15,
      });
    });
    this.y += 8;
  }

  note(text, tone = "amber") {
    const colors =
      tone === "amber"
        ? { bg: [0.985, 0.965, 0.9], bar: AMBER, fg: [0.42, 0.3, 0.12] }
        : { bg: [0.94, 0.95, 0.96], bar: [0.4, 0.42, 0.45], fg: SOFT };
    const lines = wrapText(text, 9.5, CONTENT_W - 26, "F1");
    const h = lines.length * 13 + 14;
    this.fillRect(MARGIN, this.y, CONTENT_W, h, colors.bg);
    this.fillRect(MARGIN, this.y, 3, h, colors.bar);
    this.drawText(text, MARGIN + 13, this.y + 7, {
      font: "F1",
      size: 9.5,
      color: colors.fg,
      maxWidth: CONTENT_W - 26,
      leading: 13,
    });
    this.y += h + 12;
  }

  highlight(text) {
    const lines = wrapText(text, 11, CONTENT_W - 30, "F2");
    const h = lines.length * 15 + 16;
    this.fillRect(MARGIN, this.y, CONTENT_W, h, [0.95, 0.9, 0.74]);
    this.rect(MARGIN, this.y, CONTENT_W, h, { stroke: [0.78, 0.63, 0.15], lw: 0.9 });
    this.drawText(text, MARGIN + 15, this.y + 8, {
      font: "F2",
      size: 11,
      color: AMBER,
      maxWidth: CONTENT_W - 30,
      leading: 15,
    });
    this.y += h + 12;
  }

  table(headers, rows, widths) {
    const colW = widths ?? headers.map(() => 1);
    const scale = CONTENT_W / colW.reduce((a, b) => a + b, 0);
    const w = colW.map((value) => value * scale);
    const rowH = 20;
    const x0 = MARGIN;
    const top = this.y;

    this.fillRect(x0, this.y, CONTENT_W, rowH, PANEL);
    let cx = x0;
    headers.forEach((header, i) => {
      this.drawText(header, cx + 6, this.y + 5, {
        font: "F2",
        size: 9.5,
        color: INK,
        maxWidth: w[i] - 12,
        leading: 12,
      });
      cx += w[i];
    });
    this.y += rowH;

    rows.forEach((row, ri) => {
      if (ri % 2 === 1) this.fillRect(x0, this.y, CONTENT_W, rowH, PAPER);
      cx = x0;
      row.forEach((cell, i) => {
        this.drawText(String(cell), cx + 6, this.y + 5, {
          font: "F1",
          size: 9.5,
          color: SOFT,
          maxWidth: w[i] - 12,
          leading: 12,
        });
        cx += w[i];
      });
      this.y += rowH;
    });

    for (let i = 0; i <= rows.length + 1; i++) {
      const ly = top + i * rowH;
      this.line(x0, ly, x0 + CONTENT_W, ly, { stroke: LINE, lw: 0.5 });
    }
    cx = x0;
    for (let i = 0; i <= headers.length; i++) {
      this.line(cx, top, cx, this.y, { stroke: LINE, lw: 0.5 });
      cx += w[i] ?? 0;
    }
    this.y += 12;
  }

  // --- diagrams -------------------------------------------------------
  diagram(kind, caption, height = 150) {
    this.rect(MARGIN, this.y, CONTENT_W, height, {
      stroke: LINE,
      fill: PAPER,
      lw: 0.7,
    });
    const ix = MARGIN + 12;
    const iy = this.y + 10;
    const iw = CONTENT_W - 24;
    const ih = height - 28;
    this[kind](ix, iy, iw, ih);
    if (caption) {
      this.drawText(caption, MARGIN + 12, this.y + height - 15, {
        font: "F1",
        size: 8,
        color: MUTED,
        maxWidth: CONTENT_W - 24,
        leading: 10,
      });
    }
    this.y += height + 12;
  }

  drawBox(x, yTop, w, h, title, sub) {
    this.fillRect(x, yTop, w, h, [0.99, 0.985, 0.975]);
    this.rect(x, yTop, w, h, { stroke: LINE_S, lw: 0.7 });
    this.centerText(title, x, yTop + 7, w, {
      font: "F2",
      size: 8.5,
      color: INK,
    });
    if (sub) {
      this.centerText(sub, x, yTop + 18, w, {
        font: "F1",
        size: 7,
        color: MUTED,
      });
    }
  }

  block(x, yTop, w, h) {
    const boxW = Math.min(150, w * 0.3);
    const boxH = 32;
    const midX = x + w / 2 - boxW / 2;
    this.drawBox(x + 8, yTop + 8, boxW, boxH, "Thermostat", "24VAC call");
    this.drawBox(x + w - boxW - 8, yTop + 8, boxW, boxH, "Blower Motor", "CN2 harness");
    this.drawBox(midX, yTop + h / 2 - boxH / 2, boxW, boxH, "Control Board", "CB-38MURA-2019");
    this.drawBox(midX, yTop + h - boxH - 8, boxW, boxH, "Inverter", "Line voltage");
    this.arrow(x + 8 + boxW, yTop + 8 + boxH / 2, midX, yTop + h / 2);
    this.arrow(x + w - boxW - 8, yTop + 8 + boxH / 2, midX + boxW, yTop + h / 2);
    this.arrow(midX + boxW / 2, yTop + h / 2 + boxH / 2, midX + boxW / 2, yTop + h - boxH - 8);
  }

  wiring(x, yTop, w, h) {
    const boardW = w * 0.42;
    const boardH = h - 16;
    this.rect(x + 4, yTop + 8, boardW, boardH, { stroke: LINE_S, fill: [0.99, 0.985, 0.975] });
    this.centerText("Control Board", x + 4, yTop + 16, boardW, { font: "F2", size: 8.5, color: INK });
    this.centerText("CB-38MURA-2019", x + 4, yTop + 27, boardW, { font: "F3", size: 7, color: MUTED });

    const connX = x + 4 + boardW - 26;
    const connY = yTop + h / 2 - 34;
    this.rect(connX, connY, 20, 68, { stroke: LINE_S, fill: [0.93, 0.91, 0.87] });
    this.centerText("CN2", connX, connY - 10, 20, { font: "F2", size: 6.5, color: INK });

    const motorX = x + w - 96;
    const motorY = yTop + h / 2 - 26;
    this.rect(motorX, motorY, 92, 52, { stroke: LINE_S, fill: [0.99, 0.985, 0.975] });
    this.centerText("Blower", motorX, motorY + 12, 92, { font: "F2", size: 8.5, color: INK });
    this.centerText("Motor", motorX, motorY + 23, 92, { font: "F2", size: 8.5, color: INK });
    this.centerText("CN2-1 to CN2-3", motorX, motorY + 38, 92, { font: "F3", size: 6.5, color: MUTED });

    const pins = [
      { label: "CN2-1  RED", color: [0.75, 0.15, 0.15], py: connY + 8 },
      { label: "CN2-2  WHT", color: [0.35, 0.33, 0.3], py: connY + 34 },
      { label: "CN2-3  BLU", color: [0.15, 0.3, 0.7], py: connY + 60 },
    ];
    pins.forEach((pin) => {
      this.line(connX + 20, pin.py, motorX, pin.py, { stroke: pin.color, lw: 1.3 });
      this.drawText(pin.label, connX + 26, pin.py - 11, {
        font: "F3",
        size: 6.5,
        color: pin.color,
        maxWidth: 70,
        leading: 8,
      });
    });

    this.drawText("24VAC control signal from board to blower motor", x + 4, yTop + h - 6, {
      font: "F1",
      size: 7,
      color: MUTED,
      maxWidth: w - 8,
      leading: 9,
    });
  }

  flow(x, yTop, w, h) {
    const bw = Math.min(200, w * 0.44);
    const bh = 30;
    const cx = x + w / 2;
    this.drawBox(cx - bw / 2, yTop + 2, bw, bh, "Call for fan", "Thermostat demand");
    this.arrow(cx, yTop + 2 + bh, cx, yTop + 38);
    this.diamond(cx - bw / 2, yTop + 38, bw, 40, "24VAC at CN2?");
    const resY = yTop + h - 32;
    const rw = (w - 30) / 2;
    const leftX = x + 8;
    const rightX = x + 22 + rw;
    this.drawBox(leftX, resY, rw, 30, "Check board LED", "Section 6.3");
    this.drawBox(rightX, resY, rw, 30, "Motor / harness", "Verify CN2 pins");
    this.arrow(cx - 12, yTop + 78, leftX + rw / 2, resY, [0.4, 0.38, 0.34]);
    this.arrow(cx + 12, yTop + 78, rightX + rw / 2, resY, [0.4, 0.38, 0.34]);
    this.drawText("NO", cx - 40, yTop + 84, {
      font: "F2",
      size: 7.5,
      color: AMBER,
      maxWidth: 24,
      leading: 9,
    });
    this.drawText("YES", cx + 22, yTop + 84, {
      font: "F2",
      size: 7.5,
      color: [0.15, 0.4, 0.25],
      maxWidth: 24,
      leading: 9,
    });
  }

  diamond(x, yTop, w, h, label) {
    const pts = [
      [x + w / 2, yTop],
      [x + w, yTop + h / 2],
      [x + w / 2, yTop + h],
      [x, yTop + h / 2],
    ];
    this.polygon(pts, { stroke: LINE_S, fill: [0.99, 0.985, 0.975], lw: 0.7 });
    this.centerText(label, x, yTop + h / 2 - 5, w, {
      font: "F2",
      size: 8,
      color: INK,
    });
  }

  blower(x, yTop, w, h) {
    const r = Math.min(h / 2 - 6, 58);
    const cx = x + w * 0.4;
    const cy = yTop + h / 2;
    this.circle(cx, cy, r, { stroke: LINE_S, lw: 1 });
    this.circle(cx, cy, r * 0.72, { stroke: LINE, lw: 0.7 });
    this.circle(cx, cy, r * 0.16, { stroke: LINE_S, fill: [0.93, 0.91, 0.87], lw: 0.7 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      this.line(
        cx + Math.cos(a) * r * 0.16,
        cy + Math.sin(a) * r * 0.16,
        cx + Math.cos(a) * r * 0.72,
        cy + Math.sin(a) * r * 0.72,
        { stroke: LINE, lw: 0.6 },
      );
    }
    const mx = cx + r + 24;
    this.rect(mx, cy - 20, 66, 40, { stroke: LINE_S, fill: [0.99, 0.985, 0.975] });
    this.centerText("Motor", mx, cy - 8, 66, { font: "F2", size: 8, color: INK });
    this.centerText("VFD driven", mx, cy + 3, 66, { font: "F1", size: 6.5, color: MUTED });
    this.line(cx + r, cy, mx, cy, { stroke: LINE_S, lw: 1 });
    this.drawText("Indoor blower wheel and drive motor", x + 4, yTop + h - 6, {
      font: "F1",
      size: 7,
      color: MUTED,
      maxWidth: w - 8,
      leading: 9,
    });
  }

  bars(x, yTop, w, h) {
    const values = [600, 800, 1000, 1200];
    const labels = ["Low", "Med-Low", "Med-High", "High"];
    const maxV = 1300;
    const baseY = yTop + h - 16;
    const chartH = h - 28;
    const barW = (w - 40) / (values.length * 1.6);
    this.line(x + 20, yTop + 6, x + 20, baseY, { stroke: LINE_S, lw: 0.8 });
    this.line(x + 20, baseY, x + w - 10, baseY, { stroke: LINE_S, lw: 0.8 });
    values.forEach((value, i) => {
      const bx = x + 34 + i * ((w - 40) / values.length);
      const bh = (value / maxV) * chartH;
      this.fillRect(bx, baseY - bh, barW, bh, [0.85, 0.72, 0.4]);
      this.rect(bx, baseY - bh, barW, bh, { stroke: [0.6, 0.5, 0.25], lw: 0.6 });
      this.centerText(String(value), bx - 6, baseY - bh - 12, barW + 12, { font: "F3", size: 6.5, color: INK });
      this.centerText(labels[i], bx - 6, baseY + 4, barW + 12, { font: "F1", size: 6.5, color: MUTED });
    });
    this.drawText("Airflow (CFM) by speed tap", x + 20, yTop + 2, {
      font: "F1",
      size: 7,
      color: MUTED,
      maxWidth: w - 20,
      leading: 9,
    });
  }

  parts(x, yTop, w, h) {
    const outerW = w * 0.5;
    const outerX = x + 8;
    this.rect(outerX, yTop + 6, outerW, h - 12, { stroke: LINE_S, fill: [0.985, 0.98, 0.97] });
    this.centerText("Control Box Assembly", outerX, yTop + 12, outerW, { font: "F2", size: 8.5, color: INK });

    const comps = [
      { n: "1", label: "Control board" },
      { n: "2", label: "Transformer" },
      { n: "3", label: "Capacitor" },
      { n: "4", label: "Harness, CN2" },
    ];
    const cw = outerW - 24;
    comps.forEach((comp, i) => {
      const cy = yTop + 28 + i * 28;
      this.rect(outerX + 12, cy, cw, 22, { stroke: LINE, fill: [0.99, 0.985, 0.975] });
      this.circle(outerX + 22, cy + 11, 7, { fill: AMBER });
      this.centerText(comp.n, outerX + 15, cy + 8, 14, { font: "F2", size: 7, color: [1, 1, 1] });
      this.drawText(comp.label, outerX + 34, cy + 7, { font: "F1", size: 8, color: SOFT, maxWidth: cw - 24, leading: 10 });
    });

    const listX = x + outerW + 24;
    this.drawText("Callouts", listX, yTop + 10, { font: "F2", size: 8, color: AMBER, maxWidth: w - outerW - 30, leading: 10 });
    comps.forEach((comp, i) => {
      this.drawText(`${comp.n}. ${comp.label}`, listX, yTop + 26 + i * 16, {
        font: "F1",
        size: 8,
        color: SOFT,
        maxWidth: w - outerW - 30,
        leading: 10,
      });
    });
  }

  logo(cx, cyTop, r) {
    const outer = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      outer.push([cx + Math.cos(a) * r, cyTop + Math.sin(a) * r]);
    }
    this.polygon(outer, { stroke: AMBER, lw: 1.6 });
    const inner = outer.map(([px, py]) => [
      cx + (px - cx) * 0.6,
      cyTop + (py - cyTop) * 0.6,
    ]);
    this.polygon(inner, { stroke: [0.6, 0.5, 0.25], lw: 0.8 });
    outer.forEach(([px, py]) => this.circle(px, py, 2.2, { fill: AMBER }));
    this.circle(cx, cyTop, 2.2, { fill: AMBER });
  }

  toStream() {
    return this.ops.join("\n") + "\n";
  }
}

// --- content banks ----------------------------------------------------
const GEN_PARAS = [
  "This section covers the recommended field procedure for the 2019 Carrier 38MURA. Follow the steps in order and verify each measurement before moving to the next step. Record every reading on the service worksheet.",
  "The 38MURA uses a variable-speed inverter to match capacity to load. Because the inverter regulates motor speed, most faults present as a control-signal problem rather than a mechanical failure.",
  "Before opening any panel, disconnect power at the service switch and wait for the DC bus to discharge. Confirm 0VAC and 0VDC at the board before proceeding.",
  "Use a calibrated multimeter with a true-RMS function for all AC measurements. Resistance checks must be made with the unit de-energized and the harness disconnected.",
  "Connector CN2 carries the low-voltage control signal between the board and the blower motor. A loose or corroded pin here is one of the most common causes of intermittent operation.",
  "The board stores the last five fault codes in non-volatile memory. Review the stored codes before clearing them, because the history often points to the true root cause.",
  "Record ambient and supply-air temperatures at the same time so the temperature split can be compared against the charging chart for the current mode.",
  "When a reading is out of range, do not replace the component until the associated wiring and connectors have been verified good. Most returned parts test good on the bench.",
  "Torque all electrical terminations to the value shown in the specifications table. Loose terminations overheat and can damage the board terminals over time.",
  "Document the final readings and the parts used on the work order. Accurate records shorten the next visit and support the warranty claim.",
];

const GEN_BULLETS = [
  ["Disconnect and lock out power.", "Confirm 0VAC and 0VDC at the board.", "Inspect connectors for corrosion.", "Record baseline readings before any change.", "Reassemble and re-check operation."],
  ["Verify thermostat demand is present.", "Check the low-voltage transformer output.", "Measure the signal at CN2.", "Compare against the table in this section.", "Clear codes only after the repair is verified."],
  ["Use only factory-approved replacement parts.", "Match the full part number, including revision.", "Transfer configuration jumpers where fitted.", "Confirm harness routing against the reference photos.", "Run a full startup sequence after assembly."],
  ["Measure with the unit in the same mode as the fault.", "Allow readings to stabilize for 30 seconds.", "Note the ambient temperature at the time of test.", "Repeat any suspect measurement twice.", "Compare to the published range, not to an assumption."],
];

const GEN_TABLES = [
  { headers: ["Item", "Expected", "Notes"], rows: [["Line voltage", "208-230 VAC", "+/-10%"], ["Low voltage", "24 VAC", "+/-10%"], ["DC bus", "310 VDC", "Discharged before service"], ["CN2 signal", "24 VAC", "Call for fan"], ["Ambient", "see chart", "Record at test"]] },
  { headers: ["Terminal", "Wire", "Function"], rows: [["CN2-1", "RED", "24VAC supply"], ["CN2-2", "WHT", "Common return"], ["CN2-3", "BLU", "Tach feedback"], ["CN1-1", "BLK", "Earth ground"], ["CN1-2", "YEL", "Thermostat Y"]] },
  { headers: ["Code", "Meaning", "Action"], rows: [["E1", "High pressure", "Check charge and airflow"], ["E2", "Low pressure", "Check charge and leak"], ["E4", "Locked rotor", "Check compressor"], ["E5", "AC overcurrent", "See Section 5.2"], ["E6", "Communication", "Check harness"]] },
  { headers: ["Step", "Tool", "Spec"], rows: [["Mounting screws", "1/4 in driver", "2.5 N-m"], ["Terminals", "Torque driver", "0.8 N-m"], ["Line set", "Flare wrench", "per chart"], ["Filter", "Hand", "snug"], ["Panel", "1/4 in driver", "1.5 N-m"]] },
  { headers: ["Speed Tap", "CFM", "Static"], rows: [["Low", "600", "0.20 in wc"], ["Med-Low", "800", "0.30 in wc"], ["Med-High", "1000", "0.40 in wc"], ["High", "1200", "0.50 in wc"]] },
];

const GEN_NOTES = [
  "Always confirm 0VAC and 0VDC at the board before making resistance measurements.",
  "Record the outdoor ambient and the suction line temperature together for an accurate comparison.",
  "If a code returns after clearing, inspect the harness before replacing the board.",
  "Use the wiring diagram in Appendix D to confirm connector pinouts before probing.",
];

const DIAGRAM_KINDS = ["block", "bars", "flow", "blower", "wiring"];
const pick = (list, index) => list[index % list.length];

function genericPage(p, ctx, topic, pageNum) {
  p.pageHeader(ctx.title, pageNum, ctx.total);
  p.heading(`${pageNum}. ${topic}`);
  p.paragraph(pick(GEN_PARAS, pageNum));
  p.subheading("Procedure notes");
  p.bullets(pick(GEN_BULLETS, pageNum));
  const table = pick(GEN_TABLES, pageNum);
  p.table(table.headers, table.rows, table.headers.map(() => 1));
  p.diagram(pick(DIAGRAM_KINDS, pageNum), `${topic} reference`);
  p.note(pick(GEN_NOTES, pageNum));
  p.pageFooter(pageNum);
}

function coverPage(p, ctx) {
  p.y = 100;
  p.logo(PAGE_W / 2, 160, 58);
  p.centerText(ctx.coverTitle, 0, 250, PAGE_W, { font: "F2", size: 22, color: INK });
  p.centerText(ctx.model, 0, 282, PAGE_W, { font: "F1", size: 12, color: SOFT });
  p.centerText(ctx.docNo, 0, 302, PAGE_W, { font: "F3", size: 9, color: MUTED });
  p.drawText(
    "Prototype sample document for the clickable demo. Not an official Carrier publication.",
    0,
    350,
    { font: "F4", size: 9.5, color: MUTED, maxWidth: PAGE_W },
  );
  p.y = 410;
  p.table(
    ["Rev", "Date", "Description"],
    [
      ["1.0", "2019-05", "Initial release for the 2019 model year."],
      ["1.1", "2019-09", "Updated CN2 pinout and fault-code table."],
      ["1.2", "2020-02", "Added inverter diagnostics and torque values."],
    ],
    [0.7, 1.1, 3.4],
  );
  p.note("For professional use only. Service work must be performed by qualified personnel.");
  p.y = 700;
  p.centerText("Cognimind  |  Field Support Copilot", 0, 700, PAGE_W, {
    font: "F1",
    size: 8.5,
    color: MUTED,
  });
}

function tocPage(p, ctx, topics) {
  p.pageHeader(ctx.title, 2, ctx.total);
  p.heading("Contents");
  const entries = [];
  topics.forEach((topic, index) => {
    const pageNum = index + 1;
    if (pageNum <= 2) return;
    entries.push([topic, pageNum]);
  });
  const half = Math.ceil(entries.length / 2);
  const columns = [entries.slice(0, half), entries.slice(half)];
  const colW = CONTENT_W / 2;
  const startY = p.y + 4;
  columns.forEach((column, ci) => {
    let y = startY;
    column.forEach(([label, pageNum]) => {
      const x = MARGIN + ci * colW;
      p.drawText(label, x, y, {
        font: "F1",
        size: 9.5,
        color: SOFT,
        maxWidth: colW - 34,
        leading: 12,
      });
      p.drawText(String(pageNum), x + colW - 26, y, {
        font: "F1",
        size: 9.5,
        color: MUTED,
        maxWidth: 26,
        leading: 12,
      });
      y += 16;
    });
  });
  p.y = Math.max(p.y, startY + half * 16) + 8;
  p.note("Page numbers refer to the printed page footer. Cross-references use section numbers.");
  p.pageFooter(2);
}

// --- special pages ----------------------------------------------------
function serviceE5(p, ctx) {
  p.pageHeader(ctx.title, 6, ctx.total);
  p.heading("Error Code E5: AC Overcurrent");
  p.subheading("Section 5.2: Fault Codes & Diagnostics");
  p.highlight("E5 indicates an AC overcurrent condition detected at the inverter output.");
  p.paragraph(
    "E5 is logged when the board senses current above the upper limit at the inverter output. In most cases the condition is caused by a missing or intermittent control signal rather than a failed motor. Verify the blower control signal before condemning any component.",
  );
  p.subheading("Common causes");
  p.bullets([
    "Lost or intermittent 24VAC control signal at CN2.",
    "Loose or corroded CN2 pins.",
    "Blower motor overload or seized bearings.",
    "Failed control board output stage.",
    "Incorrect field wiring at the thermostat.",
  ]);
  p.table(
    ["Step", "Check", "Expected"],
    [
      ["1", "Line voltage at unit", "208-230 VAC"],
      ["2", "24VAC at CN2-1", "24 VAC +/-10%"],
      ["3", "Motor spin by hand", "Free rotation"],
      ["4", "Board LED code", "See Section 6.3"],
    ],
    [0.7, 2.2, 1.4],
  );
  p.note("Always confirm 0VAC and 0VDC at the board before making resistance measurements. See Appendix D for the CN2 wiring diagram.");
  p.pageFooter(6);
}

function serviceBlower(p, ctx) {
  p.pageHeader(ctx.title, 8, ctx.total);
  p.heading("Blower Motor: No Spin");
  p.subheading("Section 5.4: Indoor Blower Diagnostics");
  p.paragraph(
    "A blower that will not spin during a call for fan is most often caused by a missing 24VAC control signal at CN2. Work through the flow below before removing the motor.",
  );
  p.diagram("flow", "Blower no-spin diagnostic flow", 170);
  p.table(
    ["Measurement", "Point", "Range"],
    [
      ["Control signal", "CN2-1 to CN2-2", "24 VAC"],
      ["Motor resistance", "CN2-3 to CN2-2", "see chart"],
      ["Tach feedback", "CN2-3", "pulsed DC"],
      ["Line voltage", "L1 to L2", "208-230 VAC"],
    ],
    [1.4, 1.4, 1.2],
  );
  p.note("If the motor spins freely but receives no control signal, the fault is upstream at the control board.");
  p.pageFooter(8);
}

function serviceBoard(p, ctx) {
  p.pageHeader(ctx.title, 11, ctx.total);
  p.heading("Control Board Fault: 3-Flash Code");
  p.subheading("Section 6.3: Board LED Diagnostics");
  p.highlight("3 flashes: internal control-board fault, replace the board.");
  p.paragraph(
    "The control board LED reports a fault code at startup. Count the flashes after the board completes its self-test. Confirm the harness and the low-voltage transformer before ordering a replacement.",
  );
  p.table(
    ["Flashes", "Meaning", "Action"],
    [
      ["1", "Line-voltage fault", "Check supply and fuses"],
      ["2", "Low-voltage fault", "Check transformer"],
      ["3", "Board fault", "Replace board"],
      ["4", "Sensor fault", "Check sensor wiring"],
      ["5", "Communication", "Check harness"],
    ],
    [1, 1.6, 1.8],
  );
  p.subheading("Replacement decision");
  p.numbered([
    "Confirm 24VAC at the transformer secondary.",
    "Confirm the harness is fully seated at CN1 and CN2.",
    "Re-check the flash count with the unit calling for fan.",
    "If the code returns, replace the control board CB-38MURA-2019.",
  ]);
  p.pageFooter(11);
}

function serviceWiring(p, ctx) {
  p.pageHeader(ctx.title, 14, ctx.total);
  p.heading("Wiring Diagram: Control Board CN2");
  p.subheading("Appendix D: Schematics");
  p.paragraph(
    "The low-voltage control signal leaves the board at connector CN2 and runs to the blower motor harness. Verify each pin against the table before probing the board.",
  );
  p.diagram("wiring", "CN2 control-signal wiring", 250);
  p.table(
    ["Pin", "Wire", "Signal"],
    [
      ["CN2-1", "RED", "24VAC supply"],
      ["CN2-2", "WHT", "Common return"],
      ["CN2-3", "BLU", "Tach feedback"],
    ],
    [1, 1, 1.6],
  );
  p.pageFooter(14);
}

function serviceReplacement(p, ctx) {
  p.pageHeader(ctx.title, 18, ctx.total);
  p.heading("Control Board Replacement");
  p.subheading("Section 7.1: Control Board (CB-38MURA-2019)");
  p.paragraph(
    "Use the procedure below to replace the control board. Transfer the configuration jumper from the old board so field settings are preserved.",
  );
  p.numbered([
    "Disconnect power at the service switch and confirm 0VAC at the board.",
    "Remove the control-box cover and photograph the harness routing.",
    "Disconnect CN1, CN2, and the thermostat terminal block.",
    "Remove the two mounting screws and lift the board out.",
    "Transfer the configuration jumper to the replacement board, then reverse the steps.",
  ]);
  p.table(
    ["Item", "Tool", "Torque"],
    [
      ["Mounting screws", "1/4 in driver", "2.5 N-m"],
      ["Terminal screws", "Torque driver", "0.8 N-m"],
      ["Ground screw", "1/4 in driver", "2.5 N-m"],
    ],
    [1.4, 1.4, 1.2],
  );
  p.note("Run a full startup sequence after replacement and confirm the LED shows a steady state with no fault code.");
  p.pageFooter(18);
}

function installStartup(p, ctx) {
  p.pageHeader(ctx.title, 4, ctx.total);
  p.heading("Startup Sequence and Fault Codes");
  p.subheading("Section 3.1: Startup");
  p.paragraph(
    "Power the unit and confirm the board LED runs its startup sequence. The startup table lists each code and its meaning. The table gives the code meaning only; use the Service Manual for the diagnostic procedure.",
  );
  p.numbered([
    "Confirm all electrical and refrigerant connections are complete.",
    "Energize the unit at the service switch.",
    "Observe the board LED startup sequence.",
    "Record any fault code before it clears.",
  ]);
  p.table(
    ["Code", "Meaning", "Reference"],
    [
      ["E1", "High pressure", "Service Manual 5.3"],
      ["E2", "Low pressure", "Service Manual 5.3"],
      ["E4", "Locked rotor", "Service Manual 5.5"],
      ["E5", "AC overcurrent", "Service Manual 5.2"],
    ],
    [0.8, 1.6, 1.8],
  );
  p.note("E5 is listed as an AC overcurrent fault in the startup table. Load the Service Manual to complete the diagnostic procedure.");
  p.pageFooter(4);
}

function partsControlBox(p, ctx) {
  p.pageHeader(ctx.title, 3, ctx.total);
  p.heading("Control Box Assembly");
  p.subheading("Section 2: Control Box");
  p.paragraph(
    "The control box assembly contains the control board, low-voltage transformer, run capacitor, and motor harness. Order the control board by its full part number to match the 2019 revision.",
  );
  p.diagram("parts", "Control box assembly callouts", 190);
  p.table(
    ["Item", "Part Number", "Description"],
    [
      ["1", "CB-38MURA-2019", "Control board"],
      ["2", "XF-24VA-01", "Low-voltage transformer, 24VAC"],
      ["3", "CAP-35-370", "Run capacitor, 35/370"],
      ["4", "HRN-CN2-01", "Blower motor harness, CN2"],
    ],
    [0.6, 1.5, 2.4],
  );
  p.note("The control board is CB-38MURA-2019. Confirm the revision suffix before ordering.");
  p.pageFooter(3);
}

function buildManual({ title, model, docNo, topics, specials }) {
  const ctx = { title, model, docNo, coverTitle: title, total: topics.length };
  const streams = [];
  for (let n = 1; n <= topics.length; n++) {
    const page = new Page();
    if (n === 1) coverPage(page, ctx);
    else if (n === 2) tocPage(page, ctx, topics);
    else if (specials[n]) specials[n](page, ctx);
    else genericPage(page, ctx, topics[n - 1], n);
    streams.push(page.toStream());
  }
  return streams;
}

const serviceTopics = [
  "Cover", "Contents", "Safety and Tools", "System Overview", "Call for Fan Sequence",
  "Error Code E5", "E5 Measured Values", "Blower Motor", "Blower Motor Testing",
  "Control Board Overview", "Board LED Codes", "LED Code Reference", "Inverter Diagnostics",
  "Wiring Diagram", "Wiring Legend", "Sensor Diagnostics", "Overcurrent Protection",
  "Control Board Replacement", "Post-Replacement Checks", "Maintenance Schedule",
  "Troubleshooting Quick Reference", "Error Code Appendix", "Specifications",
  "Electrical Characteristics", "Parts Replacement Reference", "Glossary",
  "Revision History", "Warranty and Notes",
];

const installTopics = [
  "Cover", "Contents", "Receiving and Inspection", "Startup Sequence",
  "Startup Checklist", "Mounting the Outdoor Unit", "Clearances", "Refrigerant Line Sets",
  "Line Set Sizing", "Brazing and Purge", "Pressure Testing", "Evacuation",
  "Electrical Service", "Low-Voltage Wiring", "Thermostat Wiring", "Condensate Drainage",
  "Duct Connections", "Airflow Setup", "Charging the System", "System Checkout",
  "Commissioning Checklist", "Customer Handoff",
];

const partsTopics = [
  "Cover", "Contents", "Control Box Assembly", "Outdoor Unit Chassis",
  "Condenser Fan Assembly", "Compressor Assembly", "Reversing Valve",
  "Indoor Coil Assembly", "Blower Assembly", "Evaporator Components", "Drain Pan",
  "Filter Rack", "Line Set Components", "Electrical Accessories", "Thermostat Accessories",
  "Mounting Hardware", "Decorative Panels", "Fastener Kits", "Ordering Information", "Notes",
];

// --- PDF writer -------------------------------------------------------
function buildPdf(streams) {
  const catalogNum = 1;
  const pagesNum = 2;
  const fontNums = { F1: 3, F2: 4, F3: 5, F4: 6 };
  const firstPageNum = 7;
  const pageNums = [];
  const contentNums = [];
  streams.forEach((_, index) => {
    pageNums.push(firstPageNum + index * 2);
    contentNums.push(firstPageNum + index * 2 + 1);
  });
  const total = firstPageNum + streams.length * 2 - 1;

  const bodies = new Array(total + 1).fill("");
  bodies[catalogNum] = `<< /Type /Catalog /Pages ${pagesNum} 0 R >>`;
  bodies[pagesNum] = `<< /Type /Pages /Kids [${pageNums
    .map((num) => `${num} 0 R`)
    .join(" ")}] /Count ${streams.length} >>`;
  bodies[fontNums.F1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  bodies[fontNums.F2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  bodies[fontNums.F3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";
  bodies[fontNums.F4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>";

  streams.forEach((stream, index) => {
    bodies[pageNums[index]] =
      `<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 ${fontNums.F1} 0 R /F2 ${fontNums.F2} 0 R /F3 ${fontNums.F3} 0 R /F4 ${fontNums.F4} 0 R >> >> ` +
      `/Contents ${contentNums[index]} 0 R >>`;
    bodies[contentNums[index]] =
      `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}endstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets = new Array(total + 1).fill(0);
  for (let num = 1; num <= total; num++) {
    offsets[num] = Buffer.byteLength(pdf, "latin1");
    pdf += `${num} 0 obj\n${bodies[num]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${total + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let num = 1; num <= total; num++) {
    pdf += `${String(offsets[num]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${total + 1} /Root ${catalogNum} 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

const manuals = [
  {
    file: "carrier-38mura-service-2019.pdf",
    docNo: "SM-38MURA-2019",
    title: "Carrier 38MURA Service Manual (2019)",
    model: "Model 38MURA  |  2019  |  Service",
    topics: serviceTopics,
    specials: {
      6: serviceE5,
      8: serviceBlower,
      11: serviceBoard,
      14: serviceWiring,
      18: serviceReplacement,
    },
  },
  {
    file: "carrier-38mura-installation-2019.pdf",
    docNo: "IM-38MURA-2019",
    title: "Carrier 38MURA Installation Manual (2019)",
    model: "Model 38MURA  |  2019  |  Installation",
    topics: installTopics,
    specials: { 4: installStartup },
  },
  {
    file: "carrier-38mura-parts-2019.pdf",
    docNo: "PL-38MURA-2019",
    title: "Carrier 38MURA Parts List (2019)",
    model: "Model 38MURA  |  2019  |  Parts",
    topics: partsTopics,
    specials: { 3: partsControlBox },
  },
];

mkdirSync(outDir, { recursive: true });
for (const manual of manuals) {
  const streams = buildManual(manual);
  const buffer = buildPdf(streams);
  const target = join(outDir, manual.file);
  writeFileSync(target, buffer);
  console.log(`wrote ${target} (${streams.length} pages, ${buffer.length} bytes)`);
}
