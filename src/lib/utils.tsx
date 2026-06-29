import type { ReactNode } from "react";

// --- Tailwind class merger (simple version) ---
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Icons as inline SVGs ---

export function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={cn("h-6 w-6", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function IconX({ className }: { className?: string }) {
  return (
    <svg className={cn("h-6 w-6", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconStar({ className }: { className?: string }) {
  return (
    <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// --- Pricing data ---
export interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: 79,
    description: "Get online and start capturing leads fast.",
    features: [
      "AI-generated website",
      "Lead capture forms",
      "Performance dashboard",
      "Email notifications",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    price: 149,
    description: "Convert more leads with AI-powered follow-ups.",
    features: [
      "Everything in Starter",
      "AI chat assistant",
      "SMS & email automation",
      "Lead scoring & qualification",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: 299,
    description: "Full-service growth engine for multi-location businesses.",
    features: [
      "Everything in Growth",
      "AI SEO optimization",
      "Ads management",
      "Multi-location support",
      "Dedicated account manager",
      "Priority support",
    ],
    cta: "Start Free Trial",
  },
];