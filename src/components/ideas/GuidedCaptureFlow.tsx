"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { createIdea } from "@/lib/api/ideas";
import type { IdeaMetadata } from "@/types/database";

// ============================================
// QUESTION DEFINITIONS
// ============================================

interface Question {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  minLength: number;
}

const GUIDED_CAPTURE_QUESTIONS: Question[] = [
  {
    id: "what",
    label: "What task or process drains your time unnecessarily?",
    hint: "Be specific about what you or your team currently do manually",
    placeholder: "e.g., Every Monday I spend 2 hours manually copying sales data from multiple spreadsheets...",
    minLength: 20,
  },
  {
    id: "why_painful",
    label: "Why does this matter? What's the real cost?",
    hint: "What's the impact on your work or team?",
    placeholder: "e.g., It's error-prone and delays our weekly reporting. When mistakes happen, we lose client trust...",
    minLength: 20,
  },
  {
    id: "frequency_time",
    label: "How often does this happen, and how long does it take?",
    hint: "Be specific: e.g., 'Every Monday, 2 hours'",
    placeholder: "e.g., Every week, takes about 2 hours each time. Sometimes more if there are data issues...",
    minLength: 20,
  },
  {
    id: "ideal_outcome",
    label: "If this was automated or fixed, what would be different?",
    hint: "Describe the specific change you'd see",
    placeholder: "e.g., Data would sync automatically overnight, and I'd just review a summary dashboard on Monday morning...",
    minLength: 20,
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Extract a clean title from user's answer
 * Better than simple truncation - tries to find natural breakpoints
 */
function extractTitle(text: string): string {
  if (!text) return "Untitled Idea";

  if (text.length <= 60) return text.trim();

  // Try to extract first sentence
  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length > 0 && firstSentence.length <= 60) {
    return firstSentence.trim();
  }

  // Otherwise truncate at word boundary
  const truncated = text.slice(0, 60).trim();
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 40) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

// ============================================
// CHARACTER COUNT COMPONENT
// ============================================

function CharacterCount({ text, minLength = 20 }: { text: string; minLength?: number }) {
  const count = text.length;
  const hasGoodDetail = count >= minLength;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
      <span>{count} characters</span>
      {hasGoodDetail && (
        <span className="text-green-600 font-medium">• Good detail</span>
      )}
      {!hasGoodDetail && count > 0 && (
        <span className="text-orange-600">• At least {minLength} needed</span>
      )}
    </div>
  );
}

// ============================================
// PROGRESS DOTS COMPONENT
// ============================================

function ProgressDots({
  total,
  current
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {Array.from({ length: total + 1 }).map((_, i) => {
        const isActive = i === current;
        const isComplete = i < current;
        const isReview = i === total;
        const label = isReview ? "Review" : `Question ${i + 1}`;

        return (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-200 ${
              isActive
                ? "w-6 bg-primary"
                : isComplete
                ? "w-2 bg-green-500"
                : "w-2 bg-border"
            }`}
            title={label}
            aria-label={label}
            role="progressbar"
          />
        );
      })}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GuidedCaptureFlow() {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const totalQuestions = GUIDED_CAPTURE_QUESTIONS.length;
  const currentQuestion = GUIDED_CAPTURE_QUESTIONS[currentStep];
  const isLastQuestion = currentStep === totalQuestions - 1;

  // ============================================
  // AUTO-SAVE & RESTORE
  // ============================================

  // Auto-save to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('guided-capture-draft', JSON.stringify(answers));
    }
  }, [answers]);

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('guided-capture-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setAnswers(parsed);
        toast("Draft restored - your previous answers were loaded", "info");
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================

  const handleNext = () => {
    const currentAnswer = answers[currentQuestion.id] || "";

    // Validate minimum length
    if (currentAnswer.length < currentQuestion.minLength) {
      toast(`Please provide at least ${currentQuestion.minLength} characters for this question`, "error");
      return;
    }

    if (isLastQuestion) {
      // Generate title and show review screen
      const generatedTitle = extractTitle(answers.what || "");
      setEditableTitle(generatedTitle);
      setShowReview(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (showReview) {
      setShowReview(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  // ============================================
  // SUBMISSION HANDLER
  // ============================================

  const handleCreateIdea = async () => {
    if (isSubmitting) return; // Prevent double-submit

    setIsSubmitting(true);

    try {
      // Combine answers into structured description
      const description = `
## What we currently do
${answers.what}

## Why it's painful
${answers.why_painful}

## Frequency and time
${answers.frequency_time}

## Ideal outcome
${answers.ideal_outcome}
      `.trim();

      // Build metadata
      const metadata: IdeaMetadata = {
        guided_capture: {
          version: "1.0",
          captured_at: new Date().toISOString(),
          started_at: new Date(startTime).toISOString(),
          time_to_complete_seconds: Math.floor((Date.now() - startTime) / 1000),
          questions: GUIDED_CAPTURE_QUESTIONS.map(q => ({
            id: q.id,
            question: q.label,
            answer: answers[q.id] || "",
          })),
        },
      };

      // Create idea
      const newIdea = await createIdea({
        title: editableTitle.trim(),
        description,
        pain_points: answers.why_painful,
        desired_outcome: answers.ideal_outcome,
        status: "new",
        source_type: "guided",
        metadata,
      });

      // Clear draft
      localStorage.removeItem('guided-capture-draft');

      // Show success toast
      toast("Idea created from Guided Capture", "success");

      // Redirect to idea detail slider (use 'selected' query param)
      router.push(`/dashboard/ideas?selected=${newIdea.id}`);
    } catch (error) {
      console.error('Failed to create idea:', error);
      toast("Failed to create idea. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER REVIEW SCREEN
  // ============================================

  if (showReview) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Review Your Idea</h1>
              <p className="text-sm text-muted-foreground">
                Review and edit before creating
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <ProgressDots total={totalQuestions} current={totalQuestions} />

          {/* Review card */}
          <Card>
            <CardHeader>
              <CardTitle>Confirm Details</CardTitle>
              <CardDescription>
                You can edit the title below, or make changes after creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Editable title */}
              <div>
                <Label htmlFor="title">Idea Title</Label>
                <Input
                  id="title"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  placeholder="Enter a title for your idea"
                  className="mt-2"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editableTitle.length}/100 characters
                </p>
              </div>

              {/* Summary of answers */}
              <div>
                <Label>Your Answers</Label>
                <div className="mt-2 space-y-3 border rounded-lg p-4 bg-muted/20">
                  {GUIDED_CAPTURE_QUESTIONS.map((q) => (
                    <div key={q.id}>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {q.label}
                      </p>
                      <p className="text-sm leading-relaxed">
                        {answers[q.id] || "(No answer provided)"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Edit
                </Button>
                <Button
                  onClick={handleCreateIdea}
                  disabled={isSubmitting || !editableTitle.trim()}
                  className="flex-1 gap-2"
                >
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create Idea
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER QUESTION SCREEN
  // ============================================

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Guided Capture</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentStep + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <ProgressDots total={totalQuestions} current={currentStep} />

        {/* Question card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0"
                role="status"
                aria-label={`Question ${currentStep + 1}`}
              >
                {currentStep + 1}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  {currentQuestion.label}
                </CardTitle>
                <CardDescription>
                  {currentQuestion.hint}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer textarea */}
            <div>
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="min-h-[150px] resize-none"
                autoFocus
              />
              <CharacterCount
                text={answers[currentQuestion.id] || ""}
                minLength={currentQuestion.minLength}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={(answers[currentQuestion.id] || "").length < currentQuestion.minLength}
                className="flex-1 gap-2"
              >
                {isLastQuestion ? (
                  <>
                    Review
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer hint */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Your answers are auto-saved. Feel free to take your time.
        </p>
      </div>
    </div>
  );
}
