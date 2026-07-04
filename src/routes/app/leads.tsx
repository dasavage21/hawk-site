import { useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { getAllLocations, getAllLeadsData, getLeadsData } from "~/lib/get-business";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/app/leads")({
  component: LeadsPage,
  loader: () => getAllLocations(),
});

interface Lead {
  id: string;
  businessId: string;
  businessName?: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  createdAt: string | null;
}

function LeadsPage() {
  const { locations } = Route.useLoaderData();
  const search = useSearch({ from: Route.id });
  const businessIdParam = (search as any).businessId as string | undefined;

  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>(businessIdParam || "all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load leads from all locations
  const loadLeads = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllLeadsData();
      setAllLeads(result.leads as Lead[]);
      setLoaded(true);
    } catch (err) {
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  // Load on first render
  if (!loaded && !loading) {
    loadLeads();
  }

  // Filter leads
  const filteredLeads = allLeads.filter((lead) => {
    if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
    if (locationFilter !== "all" && lead.businessId !== locationFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.includes(q))
      );
    }
    return true;
  });

  // Enrich with location name
  const locationNameMap = new Map(locations.map((l) => [l.id, l.name]));

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getSourceBadge = (source: string | null) => {
    switch (source) {
      case "web":
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Web</span>;
      case "phone":
        return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Phone</span>;
      case "chat":
        return <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">Chat</span>;
      case "contact-form":
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Contact Form</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{source || "Unknown"}</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="mt-1 text-gray-600">
            {loaded
              ? `${allLeads.length} total lead${allLeads.length !== 1 ? "s" : ""} across ${locations.length} location${locations.length !== 1 ? "s" : ""}`
              : "Loading leads..."}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none sm:w-64"
              />
            </div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="web">Web</option>
              <option value="phone">Phone</option>
              <option value="chat">Chat</option>
              <option value="contact-form">Contact Form</option>
            </select>
          </div>
          <button
            onClick={loadLeads}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className={cn("h-4 w-4", loading && "animate-spin")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading && !loaded && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="mt-3 text-sm text-gray-500">Loading leads...</p>
            </div>
          </div>
        )}

        {loaded && !loading && filteredLeads.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {searchQuery || sourceFilter !== "all" || locationFilter !== "all" ? "No matching leads" : "No leads yet"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || sourceFilter !== "all" || locationFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Leads will appear here when visitors interact with your websites."}
            </p>
          </div>
        )}

        {loaded && filteredLeads.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-gray-50",
                        selectedLead?.id === lead.id && "bg-indigo-50/50"
                      )}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{lead.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        <div>{lead.email || "—"}</div>
                        <div className="text-xs text-gray-400">{lead.phone || ""}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {lead.businessName || locationNameMap.get(lead.businessId) || "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{getSourceBadge(lead.source)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{formatDate(lead.createdAt)}</td>
                      <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">{lead.message || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="space-y-3 sm:hidden">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{lead.email || lead.phone || "—"}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{lead.businessName || locationNameMap.get(lead.businessId) || ""}</p>
                    </div>
                    {getSourceBadge(lead.source)}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">{formatDate(lead.createdAt)}</p>
                  {lead.message && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{lead.message}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Lead detail panel */}
            {selectedLead && (
              <div className="mt-6 rounded-xl border border-indigo-100 bg-white p-6 shadow-sm ring-1 ring-indigo-500/20">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
                  <button onClick={() => setSelectedLead(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Name</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Source</p>
                    <p className="mt-1">{getSourceBadge(selectedLead.source)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedLead.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Phone</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedLead.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Location</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedLead.businessName || locationNameMap.get(selectedLead.businessId) || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Date</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLead.createdAt)}</p>
                  </div>
                  {selectedLead.message && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Message</p>
                      <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-900">{selectedLead.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {loaded && !loading && allLeads.length > 0 && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Showing {filteredLeads.length} of {allLeads.length} leads
          </p>
        )}
      </div>
    </div>
  );
}