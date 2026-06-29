import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { getBusinessData } from "~/lib/get-business";
import { completeOnboarding } from "~/lib/onboarding";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  loader: () => getBusinessData(),
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

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { business, site } = Route.useLoaderData();

  // Redirect if already onboarded
  if (business?.industry && site) {
    navigate({ to: "/app" });
    return null;
  }

  if (authLoading) {
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
    <div className="flex min-h-dvh bg-gray-50">
      {/* Sidebar - steps */}
      <aside className="hidden w-72 border-r border-gray-200 bg-white p-8 lg:block">
        <Link to="/" className="flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white">
            L
          </span>
          LocalAmp
        </Link>
        <div className="mt-12">
          <OnboardingSteps business={business} site={site} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <OnboardingContent business={business} site={site} />
      </main>
    </div>
  );
}

function OnboardingSteps({ business, site }: { business: any; site: any }) {
  const steps = [
    { num: 1, label: "Business Details", done: !!business?.industry },
    { num: 2, label: "Website Generation", done: !!site },
    { num: 3, label: "Launch", done: false },
  ];

  return (
    <div className="space-y-6">
      {steps.map((step) => (
        <div key={step.num} className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold",
              step.done
                ? "bg-green-500 text-white"
                : "bg-indigo-600 text-white"
            )}
          >
            {step.done ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              step.num
            )}
          </div>
          <div>
            <p className={cn("text-sm font-medium", step.done ? "text-green-700" : "text-gray-900")}>
              {step.label}
            </p>
            <p className="text-xs text-gray-500">
              {step.done ? "Complete" : step.num === 1 ? "Tell us about your business" : step.num === 2 ? "We build your site" : "Go live"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function OnboardingContent({ business, site }: { business: any; site: any }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(() => {
    if (site) return 3;
    if (business?.industry) return 2;
    return 1;
  });

  // Step 1 form state
  const [industry, setIndustry] = useState(business?.industry || "");
  const [phone, setPhone] = useState(business?.phone || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Step 2 state
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genProgress, setGenProgress] = useState(0);

  // Step 3 state
  const [generatedSite, setGeneratedSite] = useState<any>(site || null);

  const handleToggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!industry) {
      setFormError("Please select your industry");
      return;
    }
    if (!phone) {
      setFormError("Please enter your phone number");
      return;
    }
    if (!address || !city || !state) {
      setFormError("Please enter your full address");
      return;
    }
    if (selectedServices.length === 0) {
      setFormError("Please select at least one service");
      return;
    }
    if (!description) {
      setFormError("Please enter a brief description");
      return;
    }

    setStep(2);
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!business?.id || !user) return;

    setGenerating(true);
    setGenError("");

    // Simulate progress
    const interval = setInterval(() => {
      setGenProgress((prev) => Math.min(prev + 15, 90));
    }, 400);

    try {
      const subdomain = (business.name || "mybusiness")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 30);

      const result = await completeOnboarding({
        businessId: business.id,
        phone,
        address,
        city,
        state,
        zip,
        industry,
        services: selectedServices,
        description,
        subdomain,
      });

      clearInterval(interval);
      setGenProgress(100);

      if (result.success) {
        setGeneratedSite(result.site);
        setTimeout(() => setStep(3), 500);
      } else {
        setGenError(result.error || "Failed to generate website");
      }
    } catch (err: any) {
      clearInterval(interval);
      setGenError(err.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  // Step 1: Business Details
  if (step === 1) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tell us about your business</h1>
          <p className="mt-2 text-gray-600">
            We'll use this info to create your AI-powered website.
          </p>
        </div>

        <form onSubmit={handleStep1Submit} className="space-y-6">
          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry *</label>
            <select
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value);
                setSelectedServices([]);
              }}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              required
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Street Address *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Portland"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="OR"
                maxLength={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="97201"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Services */}
          {industry && SERVICES_BY_INDUSTRY[industry] && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Services Offered *</label>
              <p className="mt-1 text-xs text-gray-500">Select all that apply</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SERVICES_BY_INDUSTRY[industry].map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleToggleService(service)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                      selectedServices.includes(service)
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business — what makes you great? What areas do you serve?"
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-gray-400">{description.length} characters</p>
          </div>

          {formError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link to="/app" className="text-sm text-gray-500 hover:text-gray-700">
              Skip for now
            </Link>
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500"
            >
              Generate My Website
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Generating
  if (step === 2) {
    return (
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg text-center">
          {genError ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-2xl">
                <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Something went wrong</h2>
              <p className="mt-2 text-gray-600">{genError}</p>
              <button
                onClick={handleGenerate}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-sm"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                <svg className="h-8 w-8 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">Building your website</h2>
              <p className="mt-2 text-gray-600">
                Our AI is creating a custom website for your business...
              </p>

              {/* Progress bar */}
              <div className="mx-auto mt-8 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
                  style={{ width: `${genProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {genProgress < 30
                  ? "Analyzing your business info..."
                  : genProgress < 60
                  ? "Designing your website layout..."
                  : genProgress < 90
                  ? "Adding your services and contact info..."
                  : "Finalizing..."}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Success!
  return (
    <div className="flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
          <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Your website is live! 🎉
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Your AI-generated website is ready and published. Start attracting customers.
        </p>

        {generatedSite && (
          <div className="mx-auto mt-8 max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-gray-900">Website published</p>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Your site is live at <span className="font-mono text-indigo-600">{generatedSite.subdomain}.localamp.com</span>
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate({ to: "/app" })}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500"
          >
            Go to Dashboard
          </button>
          <Link
            to="/app/website"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            View My Website
          </Link>
        </div>
      </div>
    </div>
  );
}