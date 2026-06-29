import { createFileRoute } from "@tanstack/react-router";
import { getBusinessData } from "~/lib/get-business";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
  loader: () => getBusinessData(),
});

function SettingsPage() {
  const { business } = Route.useLoaderData();

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-gray-600">Manage your business profile</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <p className="mt-1 text-sm text-gray-900">{business?.name || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <p className="mt-1 text-sm text-gray-900">{business?.industry || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{business?.phone || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-sm text-gray-900">{business?.address || "—"}</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Full settings editing will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
}