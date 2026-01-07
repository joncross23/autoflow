"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { DbQuestionnaire, Question } from "@/types/questionnaire";
import { ChevronLeft, ChevronRight, Check, Eye } from "lucide-react";

interface PublicQuestionnaireFormProps {
  questionnaire: DbQuestionnaire;
}

/**
 * Auto-save draft to localStorage
 */
function useDraftSaver(slug: string, answers: Record<string, string>) {
  useEffect(() => {
    const draftKey = `form-draft-${slug}`;
    localStorage.setItem(draftKey, JSON.stringify(answers));
  }, [slug, answers]);
}

/**
 * Load draft from localStorage
 */
function loadDraft(slug: string): Record<string, string> | null {
  if (typeof window === "undefined") return null;

  const draftKey = `form-draft-${slug}`;
  const saved = localStorage.getItem(draftKey);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Clear draft from localStorage
 */
function clearDraft(slug: string) {
  const draftKey = `form-draft-${slug}`;
  localStorage.removeItem(draftKey);
}

export default function PublicQuestionnaireForm({
  questionnaire,
}: PublicQuestionnaireFormProps) {
  const searchParams = useSearchParams();
  const isPreviewMode = searchParams.get("preview") === "true";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    return loadDraft(questionnaire.slug) || {};
  });
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save drafts (only in non-preview mode)
  useDraftSaver(questionnaire.slug, isPreviewMode ? {} : answers);

  const totalQuestions = questionnaire.questions.length;
  const isContactPage = currentIndex === totalQuestions;

  const currentQuestion = questionnaire.questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // In preview mode, just show success without submitting
    if (isPreviewMode) {
      setSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/forms/${questionnaire.slug}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          respondent_name: contactName,
          respondent_email: contactEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit response");
      }

      // Clear draft after successful submission
      clearDraft(questionnaire.slug);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = contactName.trim().length > 0 && contactEmail.includes("@");

  // Calculate progress percentage
  const progress = ((currentIndex + 1) / (totalQuestions + 1)) * 100;

  if (submitted) {
    return <SubmissionSuccess autoExtract={questionnaire.auto_extract} />;
  }

  return (
    <div>
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">
              Preview Mode - Submissions won't be saved
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <FormHeader
        title={questionnaire.title}
        description={questionnaire.description}
      />

      {/* Progress Bar */}
      <ProgressBar
        current={currentIndex + 1}
        total={totalQuestions + 1}
        progress={progress}
      />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Question Dots Indicator */}
        <QuestionDots
          total={totalQuestions}
          current={currentIndex}
          answers={answers}
          questions={questionnaire.questions}
        />

        {/* Question Card or Contact Fields */}
        {isContactPage ? (
          <ContactFields
            name={contactName}
            email={contactEmail}
            onNameChange={setContactName}
            onEmailChange={setContactEmail}
          />
        ) : (
          <QuestionCard
            question={currentQuestion}
            answer={currentAnswer}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            questionNumber={currentIndex + 1}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <FormNavigation
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          onPrev={handlePrev}
          onNext={handleNext}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

function FormHeader({
  title,
  description,
}: {
  title: string;
  description: string | null;
}) {
  return (
    <div className="bg-secondary border-b border-border/50 py-8 sm:py-12 text-center px-4">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg">
          A
        </div>
        <span className="text-2xl font-bold tracking-tight">AutoFlow</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        {title}
      </h1>

      {description && (
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function ProgressBar({
  current,
  total,
  progress,
}: {
  current: number;
  total: number;
  progress: number;
}) {
  return (
    <div className="bg-secondary border-b border-border/50 px-4 sm:px-6 py-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
          <span>
            Question {current} of {total}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function QuestionDots({
  total,
  current,
  answers,
  questions,
}: {
  total: number;
  current: number;
  answers: Record<string, string>;
  questions: Question[];
}) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {[...Array(total + 1)].map((_, i) => {
        const isActive = i === current;
        const isComplete =
          i < total ? (answers[questions[i]?.id] || "").length >= 20 : false;
        const isContact = i === total;

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
            title={isContact ? "Your details" : `Question ${i + 1}`}
          />
        );
      })}
    </div>
  );
}

function QuestionCard({
  question,
  answer,
  onChange,
  questionNumber,
}: {
  question: Question;
  answer: string;
  onChange: (value: string) => void;
  questionNumber: number;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Card
      className={`p-6 sm:p-8 transition-colors duration-200 ${
        isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      }`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          {questionNumber}
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 leading-snug">
            {question.label}
          </h3>
          {question.hint && (
            <p className="text-sm text-muted-foreground italic">
              {question.hint}
            </p>
          )}
        </div>
      </div>

      <Textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={question.placeholder || "Type your answer here..."}
        className="min-h-[120px] resize-y"
      />

      <div className="flex justify-between mt-2 text-xs sm:text-sm">
        <span className="text-muted-foreground">
          {answer.length > 0 ? `${answer.length} characters` : "Required"}
        </span>
        <span
          className={
            answer.length >= 20 ? "text-green-500" : "text-muted-foreground"
          }
        >
          {answer.length >= 20 ? "✓ Good detail" : "Tip: More detail helps our AI"}
        </span>
      </div>
    </Card>
  );
}

function ContactFields({
  name,
  email,
  onNameChange,
  onEmailChange,
}: {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}) {
  return (
    <Card className="p-6 sm:p-8">
      <h3 className="text-lg font-semibold mb-6">Your Details</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium mb-2 block">
            Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium mb-2 block">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </div>
      </div>
    </Card>
  );
}

function FormNavigation({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  canSubmit,
  isSubmitting,
}: {
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const isContactPage = currentIndex === totalQuestions;

  return (
    <div className="flex justify-between mt-6 sm:mt-8">
      <Button
        onClick={onPrev}
        disabled={isFirst}
        variant="ghost"
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {isContactPage ? (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? "Submitting..." : "Submit Responses"}
          <Check className="w-4 h-4" />
        </Button>
      ) : (
        <Button onClick={onNext} className="gap-2">
          {isLast ? "Continue to Details" : "Next Question"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function SubmissionSuccess({ autoExtract }: { autoExtract: boolean }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-500" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-3">Thank you!</h2>

      <p className="text-muted-foreground mb-8 leading-relaxed">
        {autoExtract
          ? "Your responses have been submitted and our AI is already analysing them to identify your best automation opportunities. We'll be in touch soon with a personalised report."
          : "Your responses have been submitted successfully. We'll review your submission and be in touch soon with insights and recommendations."}
      </p>

      <Card className="p-6 text-left">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">✦</span> What happens next?
        </h4>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>AI analyses your responses within 24 hours</li>
          <li>We identify top automation opportunities</li>
          <li>You receive a personalised priority report</li>
          <li>Optional: Schedule a call to discuss findings</li>
        </ol>
      </Card>
    </div>
  );
}
