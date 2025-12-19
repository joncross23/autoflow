import { getAnthropicClient } from "./client";
import type { DbIdea } from "@/types/database";

export interface EvaluationResult {
  complexity_score: number;
  complexity_rationale: string;
  roi_score: number;
  roi_rationale: string;
  time_saved_hours: number;
  time_saved_rationale: string;
  recommendations: string[];
  risks: string[];
  overall_priority: "low" | "medium" | "high" | "critical";
  overall_summary: string;
}

const EVALUATION_PROMPT = `You are an automation expert helping businesses evaluate potential automation opportunities. Analyze the following automation idea and provide a structured evaluation.

<idea>
Title: {{title}}
Description: {{description}}
Current Frequency: {{frequency}}
Time per Task: {{timeSpent}} minutes
Current Owner: {{owner}}
Pain Points: {{painPoints}}
Desired Outcome: {{desiredOutcome}}
</idea>

Evaluate this automation idea and respond with a JSON object following this exact structure:
{
  "complexity_score": <number 1-5, where 1=trivial, 5=very complex>,
  "complexity_rationale": "<brief explanation of complexity assessment>",
  "roi_score": <number 1-5, where 1=low ROI, 5=excellent ROI>,
  "roi_rationale": "<brief explanation of ROI assessment>",
  "time_saved_hours": <estimated hours saved per year>,
  "time_saved_rationale": "<calculation explanation>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "risks": ["<risk 1>", "<risk 2>", ...],
  "overall_priority": "<one of: low, medium, high, critical>",
  "overall_summary": "<2-3 sentence executive summary>"
}

Consider:
- Technical complexity and required integrations
- Potential time savings based on frequency and current time spent
- Risk of errors in the current manual process
- Maintenance overhead of automation
- Learning curve and adoption challenges

Respond ONLY with the JSON object, no additional text.`;

function buildPrompt(idea: DbIdea): string {
  return EVALUATION_PROMPT
    .replace("{{title}}", idea.title)
    .replace("{{description}}", idea.description || "Not provided")
    .replace("{{frequency}}", idea.frequency || "Not specified")
    .replace("{{timeSpent}}", idea.time_spent?.toString() || "Not specified")
    .replace("{{owner}}", idea.owner || "Not specified")
    .replace("{{painPoints}}", idea.pain_points || "Not provided")
    .replace("{{desiredOutcome}}", idea.desired_outcome || "Not provided");
}

export async function evaluateIdea(idea: DbIdea): Promise<EvaluationResult> {
  const client = getAnthropicClient();
  const prompt = buildPrompt(idea);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Extract text from response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  // Parse JSON response - handle potential markdown code blocks
  try {
    let jsonText = textBlock.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const result = JSON.parse(jsonText) as EvaluationResult;

    // Validate required fields
    if (
      typeof result.complexity_score !== "number" ||
      typeof result.roi_score !== "number" ||
      typeof result.time_saved_hours !== "number" ||
      !Array.isArray(result.recommendations) ||
      !Array.isArray(result.risks) ||
      !["low", "medium", "high", "critical"].includes(result.overall_priority)
    ) {
      throw new Error("Invalid evaluation response structure");
    }

    return result;
  } catch (err) {
    console.error("Failed to parse AI response:", textBlock.text);
    throw new Error("Failed to parse AI evaluation response");
  }
}
