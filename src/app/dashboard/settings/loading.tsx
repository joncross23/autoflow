import { CardSkeleton } from "@/components/shared";

export default function SettingsLoading() {
  return (
    <div className="p-6 max-w-3xl">
      <header className="mb-8">
        <div className="skeleton h-8 w-28 mb-2" />
        <div className="skeleton h-4 w-48" />
      </header>

      <div className="space-y-8">
        {/* Profile section */}
        <section>
          <div className="skeleton h-6 w-24 mb-4" />
          <CardSkeleton className="h-32" />
        </section>

        {/* Appearance section */}
        <section>
          <div className="skeleton h-6 w-32 mb-4" />
          <CardSkeleton className="h-40" />
        </section>

        {/* Security section */}
        <section>
          <div className="skeleton h-6 w-28 mb-4" />
          <CardSkeleton className="h-48" />
        </section>
      </div>
    </div>
  );
}
