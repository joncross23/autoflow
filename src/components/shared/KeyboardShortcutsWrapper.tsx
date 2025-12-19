"use client";

import { KeyboardShortcutsPanel, useKeyboardShortcuts } from "./KeyboardShortcutsPanel";

export function KeyboardShortcutsWrapper() {
  const { isOpen, close } = useKeyboardShortcuts();

  return <KeyboardShortcutsPanel isOpen={isOpen} onClose={close} />;
}
