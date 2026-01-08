import { notFound } from "next/navigation";
import PublicQuestionnaireForm from "@/components/forms/PublicQuestionnaireForm";
import { getQuestionnaireBySlug } from "@/lib/api/questionnaires";

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

  // Fetch questionnaire data directly from database
  const questionnaire = await getQuestionnaireBySlug(slug);

  if (!questionnaire) {
    notFound();
  }

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
    const questionnaire = await getQuestionnaireBySlug(slug);

    if (!questionnaire) {
      return {
        title: "Form Not Found",
      };
    }

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
