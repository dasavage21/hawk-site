import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllLocations } from "~/lib/get-business";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
  loader: () => getAllLocations(),
});

function SettingsPage() {
  const { locations } = Route.useLoaderData();

  const totalLeads = locations.reduce((sum, l) => sum + l.leadCount, 0);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-gray-600">Manage your account and locations</p>
        </div>

        {/* Account info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Account Overview</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Locations</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{locations.length}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Leads</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalLeads}</p>
            </div>
          </div>
        </div>

        {/* Location list */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">All Locations</h3>
            <Link to="/app/locations" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Manage
            </Link>
          </div>

          {locations.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No locations yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                    <p className="text-xs text-gray-500">{loc.industry || "—"} &middot; {loc.leadCount} leads</p>
                  </div>
                  {loc.site?.published && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Live
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Full settings editing will be available in the next update.
        </p>
      </div>
    </div>
  );
}