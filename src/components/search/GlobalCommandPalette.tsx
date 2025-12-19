"use client";

import { CommandPalette, useCommandPalette } from "./CommandPalette";

export function GlobalCommandPalette() {
  const { open, setOpen } = useCommandPalette();

  return <CommandPalette open={open} onOpenChange={setOpen} />;
}
