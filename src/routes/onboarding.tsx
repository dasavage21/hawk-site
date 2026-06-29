import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user, isLoading } = useAuth();
  const businessName = user?.businessName || "Your Business";

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
          L
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome, {businessName}!
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Your account is ready. The full onboarding flow (business details, AI website generation) is coming soon.
        </p>
        <div className="mt-10 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-gray-700">Account created successfully</p>
            </div>
            <p className="mt-1 text-left text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              <p className="text-sm font-medium text-gray-400">AI website generation (coming in next update)</p>
            </div>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}