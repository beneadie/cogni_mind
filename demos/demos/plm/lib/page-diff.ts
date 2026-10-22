import type { DiffLine, DocDiff } from "./types";

type DiffOp = {
  kind: "context" | "remove" | "add";
  text: string;
  oldLine?: number;
  newLine?: number;
};

function diffLines(
  oldLines: readonly string[],
  newLines: readonly string[],
): DiffOp[] {
  const rows = oldLines.length;
  const cols = newLines.length;
  const table = Array.from({ length: rows + 1 }, () =>
    Array<number>(cols + 1).fill(0),
  );

  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let col = cols - 1; col >= 0; col -= 1) {
      table[row][col] =
        oldLines[row] === newLines[col]
          ? table[row + 1][col + 1] + 1
          : Math.max(table[row + 1][col], table[row][col + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let row = 0;
  let col = 0;

  while (row < rows && col < cols) {
    if (oldLines[row] === newLines[col]) {
      ops.push({
        kind: "context",
        text: oldLines[row],
        oldLine: row + 1,
        newLine: col + 1,
      });
      row += 1;
      col += 1;
    } else if (table[row + 1][col] >= table[row][col + 1]) {
      ops.push({ kind: "remove", text: oldLines[row], oldLine: row + 1 });
      row += 1;
    } else {
      ops.push({ kind: "add", text: newLines[col], newLine: col + 1 });
      col += 1;
    }
  }

  while (row < rows) {
    ops.push({ kind: "remove", text: oldLines[row], oldLine: row + 1 });
    row += 1;
  }

  while (col < cols) {
    ops.push({ kind: "add", text: newLines[col], newLine: col + 1 });
    col += 1;
  }

  return ops;
}

export function buildPageDiff({
  path,
  heading,
  context,
  oldLines,
  newLines,
}: {
  path: string;
  heading: string;
  context: string;
  oldLines: readonly string[];
  newLines: readonly string[];
}): DocDiff {
  const ops = diffLines(oldLines, newLines);
  const lines: DiffLine[] = ops.map((op) => ({
    kind: op.kind,
    segments: [{ text: op.text }],
    oldLine: op.oldLine,
    newLine: op.newLine,
  }));

  return {
    path,
    stats: {
      added: ops.filter((op) => op.kind === "add").length,
      removed: ops.filter((op) => op.kind === "remove").length,
    },
    hunks: [{ heading, context, lines }],
  };
}
