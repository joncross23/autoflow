import { Metadata } from "next";
import { GuidedCaptureFlow } from "@/components/ideas/GuidedCaptureFlow";

export const metadata: Metadata = {
  title: "Guided Capture | AutoFlow",
  description: "Capture your automation idea step by step with guided questions",
};

/**
 * Guided Capture Page
 * Route: /dashboard/ideas/capture
 *
 * Presents a multi-step form to help users capture automation ideas
 * through guided questions. Creates ideas directly with Q&A stored in metadata.
 */
export default function GuidedCapturePage() {
  return <GuidedCaptureFlow />;
}
