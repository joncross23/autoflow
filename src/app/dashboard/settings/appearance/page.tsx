"use client";

import dynamic from "next/dynamic";
import AppearanceLoading from "./loading";

// Dynamically import AppearanceSettings with SSR disabled to avoid useTheme issues during build
const AppearanceSettings = dynamic(
  () =>
    import("@/components/theme/AppearanceSettings").then(
      (mod) => mod.AppearanceSettings
    ),
  {
    ssr: false,
    loading: () => <AppearanceLoading />,
  }
);

export default function AppearancePage() {
  return <AppearanceSettings />;
}
