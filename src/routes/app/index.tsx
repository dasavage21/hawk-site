import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { getAllLocations } from "~/lib/get-business";

export const Route = createFileRoute("/app/")({
  component: AppDashboard,
  loader: () => getAllLocations(),
});

function AppDashboard() {
  const { user } = useAuth();
  const { locations } = Route.useLoaderData();

  const totalLeads = locations.reduce((sum, l) => sum + l.leadCount, 0);
  const publishedSites = locations.filter((l) => l.site?.published).length;
  const firstLocation = locations[0] || null;
  const needsSetup = locations.length === 0 || !firstLocation?.industry || !firstLocation?.site;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h2>
          <p className="mt-1 text-gray-600">
            {locations.length > 0
              ? `${locations.length} location${locations.length !== 1 ? "s" : ""} — ${totalLeads} total lead${totalLeads !== 1 ? "s" : ""}`
              : "Get started by adding your first location"}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Locations
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{locations.length}</p>
            <p className="mt-1 text-xs text-gray-400">
              {locations.length === 0 ? "Add your first location" : `${publishedSites} website${publishedSites !== 1 ? "s" : ""} live`}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Total Leads
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalLeads}</p>
            <p className="mt-1 text-xs text-gray-400">
              {totalLeads === 0 ? "No leads yet — your websites will change that!" : "Across all locations"}
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
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {locations.length > 1 ? "Pro" : "Free"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {locations.length > 1 ? "Multi-location" : "14-day trial active"}
            </p>
          </div>
        </div>

        {/* Location list preview */}
        {locations.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Your Locations</h3>
              <Link to="/app/locations" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Manage all
              </Link>
            </div>
            <div className="space-y-3">
              {locations.slice(0, 5).map((loc) => (
                <div key={loc.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                      {loc.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                      <p className="text-xs text-gray-500">{loc.address || loc.industry || "No address"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{loc.leadCount}</p>
                      <p className="text-xs text-gray-500">leads</p>
                    </div>
                    {loc.site?.published && (
                      <span className="hidden rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 sm:inline">
                        Live
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {locations.length > 5 && (
                <p className="text-center text-sm text-gray-500">
                  + {locations.length - 5} more location{locations.length - 5 !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Setup CTA */}
        {needsSetup && (
          <div className="mt-8 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center">
            <p className="text-sm font-medium text-indigo-700">
              🚀 Ready to launch? Add your first location to get AI-generated websites.
            </p>
            <Link
              to="/app/locations"
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500"
            >
              Add Location
            </Link>
          </div>
        )}

        {/* Activity section */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
          <div className="mt-4 text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900">No recent activity</p>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here once leads start coming in across your locations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}