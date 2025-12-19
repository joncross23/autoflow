import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalCommandPalette } from "@/components/search";
import { KeyboardShortcutsWrapper } from "@/components/shared";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your automation ideas pipeline and project progress.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
      <GlobalCommandPalette />
      <KeyboardShortcutsWrapper />
    </div>
  );
}
