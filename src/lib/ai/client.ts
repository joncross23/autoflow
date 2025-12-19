import Anthropic from "@anthropic-ai/sdk";

// Server-side only - never expose to client
export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  return new Anthropic({
    apiKey,
  });
}
