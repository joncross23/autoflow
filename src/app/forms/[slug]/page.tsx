import { notFound } from "next/navigation";
import PublicQuestionnaireForm from "@/components/forms/PublicQuestionnaireForm";

/**
 * Public questionnaire form page
 * No authentication required
 *
 * Route: /forms/[slug]
 */
export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch questionnaire data server-side
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/forms/${slug}`,
    {
      cache: "no-store", // Always fetch fresh data
    }
  );

  if (!response.ok) {
    notFound();
  }

  const questionnaire = await response.json();

  return (
    <main className="min-h-screen bg-background font-sans">
      <PublicQuestionnaireForm questionnaire={questionnaire} />
    </main>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/forms/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        title: "Form Not Found",
      };
    }

    const questionnaire = await response.json();

    return {
      title: `${questionnaire.title} | AutoFlow`,
      description: questionnaire.description || "Complete this questionnaire to share your insights.",
    };
  } catch {
    return {
      title: "Form Not Found",
    };
  }
}
