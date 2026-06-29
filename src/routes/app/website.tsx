import { createFileRoute } from "@tanstack/react-router";
import { getBusinessData } from "~/lib/get-business";

export const Route = createFileRoute("/app/website")({
  component: WebsitePage,
  loader: () => getBusinessData(),
});

function WebsitePage() {
  const { business, site } = Route.useLoaderData();

  if (!business) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-500">Complete onboarding first to see your website.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Website</h2>
          <p className="mt-1 text-gray-600">
            {site?.published ? "Your site is live" : "Generate your AI-powered website"}
          </p>
        </div>

        {!site ? (
          <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No website yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Complete the onboarding flow to generate your AI-powered business website.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Published at{" "}
                    <span className="font-mono text-indigo-600">{site.subdomain}.localamp.com</span>
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {site.published ? "Live" : "Draft"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">Preview</h3>
              </div>
              <div className="h-[500px] overflow-auto">
                <iframe
                  srcDoc={site.generatedHtml || undefined}
                  title="Website preview"
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