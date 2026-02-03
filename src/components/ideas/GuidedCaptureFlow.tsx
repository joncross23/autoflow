"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, ArrowLeft, ArrowRight, Check, Clock, X, Loader2, Sparkles } from "lucide-react";
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

const OPENING_QUESTION: Question = {
  id: "pain_point",
  label: "Describe the biggest pain point or time-waster you're facing",
  hint: "Be specific about what drains your time, causes errors, or frustrates your team",
  placeholder: "e.g., Every Monday I spend 2 hours manually copying sales data from multiple spreadsheets into our reporting tool...",
  minLength: 0,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function extractTitle(text: string): string {
  if (!text) return "Untitled Idea";
  if (text.length <= 60) return text.trim();

  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length > 0 && firstSentence.length <= 60) {
    return firstSentence.trim();
  }

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

  // AI follow-up state
  const [followUpQuestions, setFollowUpQuestions] = useState<Question[]>([]);
  const [loadingFollowUps, setLoadingFollowUps] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  // Build full questions list: opening question + AI-generated follow-ups
  const allQuestions: Question[] = [OPENING_QUESTION, ...followUpQuestions];
  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentStep];
  const isLastQuestion = currentStep === totalQuestions - 1 && followUpQuestions.length > 0;

  // ============================================
  // AUTO-SAVE & RESTORE
  // ============================================

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem('guided-capture-draft', JSON.stringify(answers));
        setAutoSaved(true);
        const timer = setTimeout(() => setAutoSaved(false), 2000);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error('Failed to auto-save:', e);
        if (!sessionStorage.getItem('autosave-warning-shown')) {
          toast("Auto-save isn't working. Your answers may not be saved if you close the page.", "error");
          sessionStorage.setItem('autosave-warning-shown', 'true');
        }
      }
    }
  }, [answers, toast]);

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
  // AI FOLLOW-UP GENERATION
  // ============================================

  const generateFollowUps = async (painPointAnswer: string) => {
    setLoadingFollowUps(true);
    setFollowUpError(null);

    try {
      const response = await fetch("/api/guided-capture/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: painPointAnswer }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate follow-up questions");
      }

      const { questions } = await response.json();
      // Add minLength to each AI-generated question
      const withMinLength: Question[] = questions.map((q: Omit<Question, "minLength">) => ({
        ...q,
        minLength: 0,
      }));
      setFollowUpQuestions(withMinLength);
      setCurrentStep(1);
    } catch (err) {
      console.error("Failed to generate follow-ups:", err);
      setFollowUpError(
        err instanceof Error ? err.message : "Failed to generate follow-up questions"
      );
    } finally {
      setLoadingFollowUps(false);
    }
  };

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================

  const handleNext = () => {
    if (!currentQuestion) return;
    const currentAnswer = answers[currentQuestion.id] || "";

    // After Q1, generate AI follow-ups (need at least some text for AI)
    if (currentStep === 0 && followUpQuestions.length === 0) {
      if (currentAnswer.trim().length < 10) {
        toast("Please provide a bit more detail so AI can generate relevant follow-up questions", "error");
        return;
      }
      generateFollowUps(currentAnswer);
      return;
    }

    if (isLastQuestion) {
      const generatedTitle = extractTitle(answers.pain_point || "");
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
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleCancel = () => {
    router.push('/dashboard/ideas');
  };

  // ============================================
  // SUBMISSION HANDLER
  // ============================================

  const handleCreateIdea = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Build a concise readable summary (full Q&A is preserved in Capture Details metadata)
      const painPoint = answers.pain_point || "";
      const followUps = followUpQuestions
        .map(q => answers[q.id] || "")
        .filter(a => a.trim().length > 0);
      const description = [
        painPoint,
        ...followUps,
      ].join("\n\n").trim();

      // Build metadata
      const metadata: IdeaMetadata = {
        guided_capture: {
          version: "2.0",
          captured_at: new Date().toISOString(),
          started_at: new Date(startTime).toISOString(),
          time_to_complete_seconds: Math.floor((Date.now() - startTime) / 1000),
          questions: allQuestions.map(q => ({
            id: q.id,
            question: q.label,
            answer: answers[q.id] || "",
          })),
        },
      };

      const newIdea = await createIdea({
        title: editableTitle.trim(),
        description,
        pain_points: answers.pain_point,
        desired_outcome: answers.followup_3 || answers.followup_2 || "",
        status: "new",
        source_type: "guided",
        metadata,
      });

      localStorage.removeItem('guided-capture-draft');
      toast("Idea created from Guided Capture", "success");
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
  // RENDER LOADING STATE (AI generating follow-ups)
  // ============================================

  if (loadingFollowUps) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Guided Capture</h1>
              <p className="text-sm text-muted-foreground">
                Generating follow-up questions...
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-medium mb-1">Analysing your response...</p>
                  <p className="text-sm text-muted-foreground">
                    AI is generating tailored follow-up questions to uncover more detail
                  </p>
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER ERROR STATE (follow-up generation failed)
  // ============================================

  if (followUpError && followUpQuestions.length === 0 && currentStep === 0) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Guided Capture</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-10 w-10">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-error">{followUpError}</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFollowUpError(null);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Edit Answer
                  </Button>
                  <Button
                    onClick={() => generateFollowUps(answers.pain_point || "")}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                  {allQuestions.map((q, idx) => (
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

  if (!currentQuestion) return null;

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
            {currentStep > 0 && (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-primary/70">
                <Sparkles className="h-3 w-3" />
                <span>AI-generated based on your first answer</span>
              </div>
            )}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleNext();
                  }
                }}
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
                {currentStep === 0 && followUpQuestions.length === 0 ? (
                  <>
                    Next
                    <Sparkles className="h-4 w-4" />
                  </>
                ) : isLastQuestion ? (
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
          {currentStep === 0
            ? "Describe your pain point and AI will generate targeted follow-up questions."
            : "Your answers are auto-saved. Feel free to take your time."}
        </p>
      </div>
    </div>
  );
}
