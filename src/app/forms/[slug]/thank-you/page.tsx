import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Thank you page after form submission
 * Separate route for better URL structure and shareable success state
 */
export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-3">Thank you!</h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your responses have been submitted successfully. Our AI will analyse your submission and we'll be in touch soon with a personalised report.
        </p>

        <Card className="p-6 text-left mb-6">
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

        <Button asChild variant="ghost">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Thank You | AutoFlow",
  description: "Your questionnaire response has been submitted successfully.",
};
