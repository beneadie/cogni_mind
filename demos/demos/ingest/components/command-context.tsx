"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type CommandContextValue = {
  showCommands: boolean;
  toggle: () => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [showCommands, setShowCommands] = useState(false);
  const value = useMemo<CommandContextValue>(
    () => ({ showCommands, toggle: () => setShowCommands((v) => !v) }),
    [showCommands],
  );
  return (
    <CommandContext.Provider value={value}>{children}</CommandContext.Provider>
  );
}

export function useCommands(): CommandContextValue {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useCommands must be used within a CommandProvider");
  }
  return context;
}
