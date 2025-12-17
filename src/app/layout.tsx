import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AutoFlow - AI & Automation Discovery Platform",
  description:
    "Capture automation ideas, evaluate them with AI, and track implementation projects.",
  keywords: ["automation", "AI", "productivity", "project management"],
  icons: {
    icon: "/favicon.svg",
  },
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
