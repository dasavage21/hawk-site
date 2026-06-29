import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { cn, IconCheck, IconArrowRight, IconMenu, IconX, IconStar, PRICING_TIERS } from "~/lib/utils";

export const Route = createFileRoute("/")({
  component: Home,
});

// --- Sub-components ---

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white">
            L
          </span>
          LocalAmp
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            How it Works
          </a>
          <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Pricing
          </a>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-500 hover:to-violet-500"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        >
          {open ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-6 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#features" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600">
              Features
            </a>
            <a href="#how-it-works" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600">
              How it Works
            </a>
            <a href="#pricing" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600">
              Pricing
            </a>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                Log in
              </Link>
              <Link to="/signup" className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-medium text-white">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/50 via-white to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-indigo-100/50 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <IconStar className="h-3.5 w-3.5 text-indigo-500" />
          AI-powered growth for local businesses
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Get more local customers{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            without the marketing headaches
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
          LocalAmp replaces your entire marketing stack — website, lead capture, AI chat assistant, and analytics — for one flat monthly fee. No agencies. No complexity. Just results.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] hover:from-indigo-500 hover:to-violet-500"
          >
            Start Free Trial
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center rounded-xl border border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-gray-500">Trusted by local businesses across the US</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <span className="text-lg font-bold text-gray-400">ACE Roofing</span>
            <span className="text-lg font-bold text-gray-400">GreenLeaf HVAC</span>
            <span className="text-lg font-bold text-gray-400">Pinnacle Dental</span>
            <span className="text-lg font-bold text-gray-400">Sunset Landscaping</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: "AI Website Builder",
      description: "Enter your business info and get a beautiful, mobile-optimized website in minutes. No design skills needed.",
      gradient: "from-indigo-500 to-indigo-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      title: "Smart Lead Capture",
      description: "Built-in forms, call tracking, and contact widgets that capture every visitor who might become a customer.",
      gradient: "from-violet-500 to-violet-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      title: "AI Chat Assistant",
      description: "Your 24/7 sales rep that answers questions, books appointments, and qualifies leads automatically.",
      gradient: "from-purple-500 to-purple-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: "Performance Dashboard",
      description: "See every lead, conversion, and campaign metric in one clean dashboard. Know what's working.",
      gradient: "from-pink-500 to-pink-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      title: "Automated Follow-ups",
      description: "SMS and email sequences that nurture leads while you sleep. Never miss a follow-up again.",
      gradient: "from-amber-500 to-amber-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      title: "SEO & Ads Management",
      description: "AI optimizes your site for search and manages ad campaigns to bring in more traffic. (Pro tier)",
      gradient: "from-emerald-500 to-emerald-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="border-t border-gray-100 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold text-indigo-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            One platform to grow your business
          </p>
          <p className="mt-4 text-lg text-gray-600">
            No more juggling five different tools or overpaying agencies. LocalAmp brings it all together.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={cn("mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 text-white shadow-sm", feature.gradient)}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "1",
      title: "Sign up",
      description: "Create your account in under a minute. No credit card required to start.",
    },
    {
      step: "2",
      title: "Enter your info",
      description: "Tell us about your business — name, industry, services. Our AI does the rest.",
    },
    {
      step: "3",
      title: "Get customers",
      description: "Your website goes live, leads start flowing, and our AI nurtures them into paying customers.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-gray-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold text-indigo-600">How it Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Three simple steps to grow
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Getting started takes minutes, not months. No technical skills required.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-[60%] hidden h-0.5 w-[60%] bg-gradient-to-r from-indigo-200 to-violet-200 md:block" />
              )}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                {step.step}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/signup"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
          >
            Get started for free
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ tier }: { tier: typeof PRICING_TIERS[number] }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md",
        tier.highlighted
          ? "border-indigo-200 ring-1 ring-indigo-500 scale-105"
          : "border-gray-200"
      )}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
      <p className="mt-1 text-sm text-gray-600">{tier.description}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold tracking-tight text-gray-900">${tier.price}</span>
        <span className="text-sm text-gray-500">/month</span>
      </div>

      <ul className="mt-8 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
            <IconCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        to="/signup"
        className={cn(
          "mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all",
          tier.highlighted
            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-500 hover:to-violet-500"
            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        )}
      >
        {tier.cta}
      </Link>
    </div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-t border-gray-100 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold text-indigo-600">Simple pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            One flat fee. No surprises.
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Replace your agency or disjointed tools for less than what you're paying now. Cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 items-start max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white">
                L
              </span>
              LocalAmp
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              AI-powered growth for local businesses. One platform, flat monthly fee.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Product</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a></li>
              <li><a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a></li>
              <li><Link to="/signup" className="text-sm text-gray-600 hover:text-gray-900">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Company</h4>
            <ul className="mt-4 space-y-2">
              <li><span className="text-sm text-gray-500">About</span></li>
              <li><span className="text-sm text-gray-500">Blog</span></li>
              <li><span className="text-sm text-gray-500">Contact</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li><span className="text-sm text-gray-500">Privacy Policy</span></li>
              <li><span className="text-sm text-gray-500">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LocalAmp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// --- Main Page ---

function Home() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
}