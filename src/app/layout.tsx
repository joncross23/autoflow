import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/hooks/useToast";

// Inter - fallback font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

// Plus Jakarta Sans - AutoFlow theme font (luxury/refined)
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: false, // Disable preload to avoid unused preload warnings
});

export const metadata: Metadata = {
  title: {
    default: "AutoFlow - AI & Automation Discovery Platform",
    template: "%s | AutoFlow",
  },
  description:
    "Capture automation ideas, evaluate them with AI, and track implementation projects. Streamline your workflow with intelligent prioritisation.",
  keywords: [
    "automation",
    "AI",
    "productivity",
    "project management",
    "workflow",
    "idea capture",
    "ROI analysis",
    "kanban",
  ],
  authors: [{ name: "AutoFlow Team" }],
  creator: "AutoFlow",
  publisher: "AutoFlow",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AutoFlow",
    title: "AutoFlow - AI & Automation Discovery Platform",
    description:
      "Capture automation ideas, evaluate them with AI, and track implementation projects.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoFlow - AI & Automation Discovery Platform",
    description:
      "Capture automation ideas, evaluate them with AI, and track implementation projects.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        <ThemeProvider
          defaultMode="dark"
          defaultAccent="blue"
          defaultSystemTheme="autoflow"
          storageKey="autoflow-theme"
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
