import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllLocations } from "~/lib/get-business";

export const Route = createFileRoute("/app/website")({
  component: WebsitePage,
  loader: () => getAllLocations(),
});

function WebsitePage() {
  const { locations } = Route.useLoaderData();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const publishedLocations = locations.filter((l) => l.site?.published);
  const current = publishedLocations[selectedIndex] || null;

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-gray-500">No locations yet.</p>
          <Link to="/app/locations" className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white">
            Add Location
          </Link>
        </div>
      </div>
    );
  }

  if (publishedLocations.length === 0) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Websites</h2>
            <p className="mt-1 text-gray-600">{locations.length} location{locations.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No websites generated yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Visit each location and complete setup to generate its AI-powered website.
            </p>
            <Link to="/app/locations" className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-sm">
              Go to Locations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Websites</h2>
          <p className="mt-1 text-gray-600">{publishedLocations.length} website{publishedLocations.length !== 1 ? "s" : ""} live</p>
        </div>

        {/* Location tabs */}
        {publishedLocations.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {publishedLocations.map((loc, i) => (
              <button
                key={loc.id}
                onClick={() => setSelectedIndex(i)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  i === selectedIndex
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        )}

        {current && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{current.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Published at{" "}
                    <span className="font-mono text-indigo-600">{current.site?.subdomain}.localamp.com</span>
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Live
                </span>
              </div>
              {current.address && (
                <p className="mt-2 text-sm text-gray-600">{current.address}</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">Preview</h3>
              </div>
              <div className="h-[500px] overflow-auto">
                <iframe
                  srcDoc={current.site?.generatedHtml || undefined}
                  title={`${current.name} preview`}
                  className="h-full w-full border-0"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}