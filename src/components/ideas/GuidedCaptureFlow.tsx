"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, ArrowLeft, ArrowRight, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { createIdea } from "@/lib/api/ideas";
import { cn } from "@/lib/utils";
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

function CharacterCount({
  id,
  text,
  minLength = 20
}: {
  id?: string;
  text: string;
  minLength?: number;
}) {
  const count = text.length;
  const hasGoodDetail = count >= minLength;
  const remaining = minLength - count;

  return (
    <div
      id={id}
      className="flex items-center justify-between text-sm mb-2"
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{count} characters</span>
        {hasGoodDetail && (
          <span className="text-green-600 font-semibold flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            Good detail
          </span>
        )}
        {!hasGoodDetail && count > 0 && (
          <span className="text-orange-600 font-medium">
            {remaining} more needed
          </span>
        )}
      </div>
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
    <div className="mb-6">
      <div className="flex justify-center gap-2 mb-2">
        {Array.from({ length: total + 1 }).map((_, i) => {
          const isActive = i === current;
          const isComplete = i < current;
          const isReview = i === total;
          const label = isReview ? "Review" : `Question ${i + 1}`;
          const status = isActive ? " - Current" : isComplete ? " - Complete" : "";

          return (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                isActive && "w-6 bg-primary",
                isComplete && "w-2 bg-green-600 dark:bg-green-500",
                !isActive && !isComplete && "w-2 bg-border"
              )}
              title={label + status}
              aria-label={label + status}
              role="progressbar"
              aria-valuenow={isActive || isComplete ? 100 : 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {current < total ? `Step ${current + 1} of ${total}` : "Review"}
      </p>
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
  const [autoSaved, setAutoSaved] = useState(false);

  const totalQuestions = GUIDED_CAPTURE_QUESTIONS.length;
  const currentQuestion = GUIDED_CAPTURE_QUESTIONS[currentStep];
  const isLastQuestion = currentStep === totalQuestions - 1;

  // ============================================
  // AUTO-SAVE & RESTORE
  // ============================================

  // Auto-save to localStorage with error handling
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem('guided-capture-draft', JSON.stringify(answers));
        setAutoSaved(true);
        // Reset after 2 seconds
        const timer = setTimeout(() => setAutoSaved(false), 2000);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error('Failed to auto-save:', e);
        // Show warning once per session
        if (!sessionStorage.getItem('autosave-warning-shown')) {
          toast("Auto-save isn't working. Your answers may not be saved if you close the page.", "error");
          sessionStorage.setItem('autosave-warning-shown', 'true');
        }
      }
    }
  }, [answers, toast]);

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

  const handleCancel = () => {
    // Navigate back to ideas dashboard
    // Auto-save will preserve the draft if user wants to return
    router.push('/dashboard/ideas');
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
      const errorMessage = error instanceof Error
        ? error.message
        : "We couldn't save your idea. Please check your connection and try again.";
      toast(errorMessage, "error");
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Review Your Idea</h1>
              <p className="text-sm text-muted-foreground">
                Review and edit before creating
              </p>
            </div>
            {autoSaved && (
              <div className="inline-flex items-center gap-1.5 text-xs text-green-600 px-2 py-1 bg-green-600/10 rounded-full">
                <Check className="h-3 w-3" />
                Auto-saved
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-10 w-10"
              aria-label="Cancel and return to ideas dashboard"
              title="Cancel"
            >
              <X className="h-5 w-5" />
            </Button>
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
              <div className="bg-primary/5 rounded-lg p-4 border-2 border-primary/20">
                <Label htmlFor="title" className="text-base font-semibold mb-3 block">
                  Give your idea a name
                </Label>
                <Input
                  id="title"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  onFocus={(e) => {
                    // Auto-scroll into view on mobile
                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }
                  }}
                  placeholder="Enter a title for your idea"
                  className="text-lg font-semibold"
                  maxLength={100}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    This will be the name of your automation idea
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {editableTitle.length}/100
                  </p>
                </div>
              </div>

              {/* Summary of answers */}
              <div>
                <Label className="text-base font-semibold">Your Answers</Label>
                <div className="mt-3 space-y-4 max-h-[400px] overflow-y-auto">
                  {GUIDED_CAPTURE_QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="border-l-4 border-primary/30 pl-4 py-2 bg-muted/20 rounded-r-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {q.label}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80 ml-8">
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
                  className="gap-2 min-h-[44px]"
                  aria-label="Go back to edit answers"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Edit
                </Button>
                <Button
                  onClick={handleCreateIdea}
                  disabled={isSubmitting || !editableTitle.trim()}
                  className="flex-1 gap-2 min-h-[44px]"
                  aria-label={isSubmitting ? "Creating idea..." : "Create idea and go to dashboard"}
                  aria-disabled={isSubmitting || !editableTitle.trim()}
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Guided Capture</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentStep + 1} of {totalQuestions}
            </p>
          </div>
          {autoSaved && (
            <div className="inline-flex items-center gap-1.5 text-xs text-green-600 px-2 py-1 bg-green-600/10 rounded-full">
              <Check className="h-3 w-3" />
              Auto-saved
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-10 w-10"
            aria-label="Cancel and return to ideas dashboard"
            title="Cancel"
          >
            <X className="h-5 w-5" />
          </Button>
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
              <CharacterCount
                id="character-count"
                text={answers[currentQuestion.id] || ""}
                minLength={currentQuestion.minLength}
              />
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className={cn(
                  "min-h-[150px] md:min-h-[180px] resize-y",
                  (answers[currentQuestion.id] || "").length > 0 &&
                  (answers[currentQuestion.id] || "").length < currentQuestion.minLength &&
                  "border-orange-500 focus-visible:ring-orange-500"
                )}
                autoFocus
                aria-describedby="character-count"
                aria-invalid={(answers[currentQuestion.id] || "").length > 0 && (answers[currentQuestion.id] || "").length < currentQuestion.minLength}
                aria-label={currentQuestion.label}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="gap-2 min-h-[44px] min-w-[120px]"
                  aria-label="Go to previous question"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <div className="w-[120px]" aria-hidden="true" />
              )}
              <Button
                onClick={handleNext}
                disabled={(answers[currentQuestion.id] || "").length < currentQuestion.minLength}
                className="flex-1 gap-2 min-h-[44px]"
                aria-label={
                  (answers[currentQuestion.id] || "").length < currentQuestion.minLength
                    ? `Provide at least ${currentQuestion.minLength} characters to continue`
                    : isLastQuestion ? "Continue to review your answers" : "Go to next question"
                }
                aria-disabled={(answers[currentQuestion.id] || "").length < currentQuestion.minLength}
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
