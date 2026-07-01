import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getAllLocations, createLocation } from "~/lib/get-business";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/app/locations")({
  component: LocationsPage,
  loader: () => getAllLocations(),
});

const INDUSTRIES = [
  { value: "plumber", label: "Plumbing" },
  { value: "roofer", label: "Roofing" },
  { value: "hvac", label: "HVAC / Heating & Cooling" },
  { value: "dentist", label: "Dentist / Dental" },
  { value: "electrician", label: "Electrical / Electrician" },
  { value: "landscaper", label: "Landscaping / Lawn Care" },
  { value: "generic", label: "Other Service Business" },
];

const SERVICES_BY_INDUSTRY: Record<string, string[]> = {
  plumber: ["Pipe Repair", "Drain Cleaning", "Water Heater Installation", "Emergency Plumbing", "Fixture Installation", "Sewer Line Repair"],
  roofer: ["Roof Repair", "New Roof Installation", "Gutter Installation", "Roof Inspection", "Emergency Tarping", "Skylight Installation"],
  hvac: ["AC Repair", "Furnace Installation", "Duct Cleaning", "Thermostat Installation", "Emergency HVAC", "Preventive Maintenance"],
  dentist: ["General Dentistry", "Teeth Cleaning", "Fillings", "Crowns", "Root Canals", "Teeth Whitening"],
  electrician: ["Wiring & Rewiring", "Panel Upgrades", "Lighting Installation", "Outlet Repair", "Home Inspection", "Generator Installation"],
  landscaper: ["Lawn Mowing", "Garden Design", "Tree Trimming", "Irrigation Systems", "Hardscaping", "Seasonal Cleanup"],
  generic: ["Consultation", "Installation", "Repair Services", "Maintenance", "Emergency Service", "Free Estimates"],
};

function LocationsPage() {
  const { locations } = Route.useLoaderData();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const handleToggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !industry || !phone || !address || !city || !state || !description || selectedServices.length === 0) {
      setError("Please fill in all required fields and select at least one service");
      return;
    }

    setAdding(true);
    try {
      const result = await createLocation({
        name, phone, address, city, state, zip, industry,
        services: selectedServices, description,
      });
      if (result.success) {
        setShowAddForm(false);
        setName(""); setIndustry(""); setPhone(""); setAddress("");
        setCity(""); setState(""); setZip(""); setSelectedServices([]);
        setDescription("");
        // Refresh the page
        navigate({ to: "/app/locations" });
      } else {
        setError(result.error || "Failed to create location");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  const totalLeads = locations.reduce((sum, l) => sum + l.leadCount, 0);
  const publishedSites = locations.filter((l) => l.site?.published).length;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Locations</h2>
            <p className="mt-1 text-gray-600">
              {locations.length} location{locations.length !== 1 ? "s" : ""} — {totalLeads} total leads
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {showAddForm ? "Cancel" : "Add Location"}
          </button>
        </div>

        {/* Add location form */}
        {showAddForm && (
          <div className="mb-8 rounded-xl border border-indigo-200 bg-white p-6 shadow-sm ring-1 ring-indigo-500/20">
            <h3 className="text-lg font-semibold text-gray-900">New Location</h3>
            <p className="mt-1 text-sm text-gray-500">Add a new business location with its own AI-generated website.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Downtown Office"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry *</label>
                  <select value={industry} onChange={(e) => { setIndustry(e.target.value); setSelectedServices([]); }}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" required>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="Portland"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State *</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)}
                      placeholder="OR" maxLength={2}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP</label>
                    <input type="text" value={zip} onChange={(e) => setZip(e.target.value)}
                      placeholder="97201"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Services */}
              {industry && SERVICES_BY_INDUSTRY[industry] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Services Offered *</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SERVICES_BY_INDUSTRY[industry].map((service) => (
                      <button key={service} type="button" onClick={() => handleToggleService(service)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                          selectedServices.includes(service)
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        )}>
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this location..."
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" required />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <button type="submit" disabled={adding}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50">
                {adding ? "Creating..." : "Create Location & Website"}
              </button>
            </form>
          </div>
        )}

        {/* Location cards */}
        {locations.length === 0 && !showAddForm ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No locations yet</h3>
            <p className="mt-2 text-sm text-gray-500">Add your first location to get started with multi-location management.</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total Locations</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{locations.length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Websites Live</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{publishedSites} / {locations.length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalLeads}</p>
              </div>
            </div>

            {/* Location list */}
            <div className="space-y-4">
              {locations.map((loc) => (
                <div key={loc.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{loc.name}</h3>
                        {loc.site?.published && (
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Live</span>
                        )}
                      </div>
                      {loc.industry && (
                        <p className="mt-0.5 text-sm text-gray-500 capitalize">{loc.industry}</p>
                      )}
                      {loc.address && (
                        <p className="mt-1 text-sm text-gray-600">{loc.address}</p>
                      )}
                      {loc.phone && (
                        <p className="mt-0.5 text-sm text-gray-600">{loc.phone}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{loc.leadCount}</p>
                          <p className="text-xs text-gray-500">leads</p>
                        </div>
                        <Link
                          to="/app/leads"
                          search={{ businessId: loc.id }}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View Leads
                        </Link>
                      </div>
                      {loc.site && (
                        <p className="text-xs text-gray-400">
                          {loc.site.subdomain}.localamp.com
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}