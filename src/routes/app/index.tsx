import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { getBusinessData } from "~/lib/get-business";

export const Route = createFileRoute("/app/")({
  component: AppDashboard,
  loader: () => getBusinessData(),
});

function AppDashboard() {
  const { user } = useAuth();
  const { business, site } = Route.useLoaderData();

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back{business?.name ? `, ${business.name}` : ""}!
          </h2>
          <p className="mt-1 text-gray-600">Here's your business at a glance.</p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Total Leads
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
            <p className="mt-1 text-xs text-gray-400">
              {business ? "View in Leads tab" : "Complete setup to start"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Website
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {site?.published ? "Live" : "—"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {site?.published
                ? `Published at ${site.subdomain}.localamp.com`
                : business ? "Just generated!" : "Not generated yet"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Plan
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">Free</p>
            <p className="mt-1 text-xs text-gray-400">14-day trial active</p>
          </div>
        </div>

        {/* Status cards */}
        <div className="mt-8 space-y-4">
          {/* Onboarding status */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">Setup Progress</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${user ? "bg-green-500" : "bg-gray-300"}`} />
                <p className={`text-sm ${user ? "text-gray-700" : "text-gray-400"}`}>
                  Account created
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${business?.industry ? "bg-green-500" : "bg-gray-300"}`} />
                <p className={`text-sm ${business?.industry ? "text-gray-700" : "text-gray-400"}`}>
                  Business details completed
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${site ? "bg-green-500" : "bg-gray-300"}`} />
                <p className={`text-sm ${site ? "text-gray-700" : "text-gray-400"}`}>
                  Website generated
                </p>
              </div>
            </div>
            {(!business?.industry || !site) && (
              <Link
                to="/onboarding"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500"
              >
                Complete Setup
              </Link>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
            <div className="mt-4 text-center py-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-900">No activity yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Activity will appear here once your website is live and leads start coming in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}