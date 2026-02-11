import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "IdeaTracker - Capture, Score & Deliver Your Best Ideas";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0A0A0B 0%, #131316 50%, #1A1A1F 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo/Icon placeholder */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 24,
            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            marginBottom: 40,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v3m6.366 1.366l-2.12 2.12M21 12h-3M17.366 17.366l-2.12-2.12M12 21v-3M7.634 17.366l2.12-2.12M3 12h3M7.634 6.634l2.12 2.12" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#FAFAFA",
            marginBottom: 16,
            letterSpacing: -2,
          }}
        >
          IdeaTracker
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#A1A1AA",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Capture, score, and deliver your best ideas
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: "#71717A",
            marginTop: 24,
            display: "flex",
            gap: 16,
          }}
        >
          <span>Capture Ideas</span>
          <span>•</span>
          <span>AI Evaluation</span>
          <span>•</span>
          <span>Track Projects</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
