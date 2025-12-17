import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "AutoFlow - AI & Automation Discovery Platform",
    template: "%s | AutoFlow",
  },
  description:
    "Capture automation ideas, evaluate them with AI, and track implementation projects. Streamline your workflow with intelligent prioritization.",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultMode="dark"
          defaultAccent="blue"
          storageKey="autoflow-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
