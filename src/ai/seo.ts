import type { BusinessData } from "./templates/plumber";

/**
 * SEO metadata generator for local business websites.
 * Generates optimized titles, descriptions, keywords, and structured data.
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

/**
 * Generate industry-specific SEO metadata from business data.
 */
export function generateSEOMetadata(data: BusinessData): SEOMetadata {
  const { name, industry, city, state, services, description } = data;
  const industryLabel = getIndustryLabel(industry);

  // Title: "Business Name | Industry in City, State"
  const title = `${name} | ${industryLabel} in ${city}, ${state}`;

  // Description: "Trusted {industry} serving {city}, {state} since 20XX..."
  const desc = description.length > 155
    ? description.slice(0, 152) + "..."
    : description;

  const keywords = [
    industryLabel.toLowerCase(),
    city.toLowerCase(),
    state.toLowerCase(),
    `${industryLabel.toLowerCase()} ${city}`,
    `${city} ${industryLabel.toLowerCase()}`,
    ...services.slice(0, 4),
  ].join(", ");

  return {
    title,
    description: desc,
    keywords,
    ogTitle: `${name} - ${city} ${industryLabel}`,
    ogDescription: description.slice(0, 200),
  };
}

/**
 * Generate location-specific page data.
 * E.g., "Plumber in Portland" — used for local SEO landing pages.
 */
export function generateLocationPageData(
  data: BusinessData,
  targetCity?: string,
  targetState?: string,
) {
  const city = targetCity || data.city;
  const state = targetState || data.state;
  const industryLabel = getIndustryLabel(data.industry);

  return {
    title: `${industryLabel} in ${city}, ${state} | ${data.name}`,
    h1: `${industryLabel} in ${city}, ${state}`,
    description: `Looking for a ${industryLabel.toLowerCase()} in ${city}, ${state}? ${data.name} provides professional ${data.industry} services in ${city} and surrounding areas. Call ${data.phone} for a free quote.`,
    slug: `${industryLabel.toLowerCase().replace(/\s+/g, "-")}-in-${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`,
  };
}

/**
 * Generate Schema.org LocalBusiness JSON-LD structured data.
 */
export function generateLocalBusinessSchema(data: BusinessData): string {
  const { name, phone, address, city, state, zip, services, description, hours, email, yearsInBusiness } = data;
  const industryLabel = getIndustryLabel(data.industry);

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.localamp.com`,
    telephone: phone,
    email: email || "",
    image: "",
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: city,
      addressRegion: state,
      postalCode: zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "", // Would need geocoding
      longitude: "",
    },
    openingHoursSpecification: parseHours(hours),
    priceRange: "$$",
    areaServed: {
      "@type": "City",
      name: city,
    },
    ...(yearsInBusiness ? { foundingDate: `${new Date().getFullYear() - yearsInBusiness}` } : {}),
    sameAs: [],
  };

  // Add service-specific types
  if (industry === "plumber" || industry === "roofer" || industry === "hvac" || industry === "electrician") {
    (schema as Record<string, unknown>)["@type"] = "HomeAndConstructionBusiness";
  }

  return JSON.stringify(schema, null, 2);
}

/**
 * Generate an XML sitemap for the business website.
 */
export function generateSitemap(
  baseUrl: string,
  pages: Array<{ path: string; lastmod?: string; priority?: number }>,
): string {
  const defaultPages = [
    { path: "", priority: 1.0 },
    { path: "/services", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/contact", priority: 0.6 },
  ];

  const allPages = [...defaultPages, ...pages];

  const urls = allPages
    .map(
      (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${p.lastmod || new Date().toISOString().split("T")[0]}</lastmod>
    <priority>${p.priority || 0.5}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Generate Robots.txt content.
 */
export function generateRobotsTxt(baseUrl: string): string {
  return `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`;
}

/**
 * Basic SEO audit — scores a generated page for SEO best practices.
 */
export interface SEOAuditResult {
  score: number; // 0-100
  checks: SEOAuditCheck[];
}

export interface SEOAuditCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export function runSEOAudit(data: BusinessData, html: string): SEOAuditResult {
  const checks: SEOAuditCheck[] = [];
  let score = 100;

  // Title tag
  if (html.includes("<title>") && html.includes("</title>")) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "";
    if (title.length < 10) {
      checks.push({ name: "Title Tag", status: "fail", message: "Title too short (min 10 chars)" });
      score -= 15;
    } else if (title.length > 70) {
      checks.push({ name: "Title Tag", status: "warn", message: "Title too long (max 70 chars recommended)" });
      score -= 5;
    } else {
      checks.push({ name: "Title Tag", status: "pass", message: "Good length" });
    }
  } else {
    checks.push({ name: "Title Tag", status: "fail", message: "Missing title tag" });
    score -= 20;
  }

  // Meta description
  if (html.includes('name="description"')) {
    checks.push({ name: "Meta Description", status: "pass", message: "Present" });
  } else {
    checks.push({ name: "Meta Description", status: "fail", message: "Missing description" });
    score -= 15;
  }

  // Viewport
  if (html.includes('name="viewport"')) {
    checks.push({ name: "Responsive Viewport", status: "pass", message: "Viewport meta tag present" });
  } else {
    checks.push({ name: "Responsive Viewport", status: "fail", message: "Missing viewport meta tag" });
    score -= 10;
  }

  // Open Graph
  if (html.includes('property="og:title"') || html.includes('property="og:description"')) {
    checks.push({ name: "Open Graph Tags", status: "pass", message: "OG tags present" });
  } else {
    checks.push({ name: "Open Graph Tags", status: "warn", message: "No Open Graph tags" });
    score -= 5;
  }

  // H1
  if (/<h1[^>]*>/i.test(html)) {
    checks.push({ name: "H1 Heading", status: "pass", message: "H1 tag present" });
  } else {
    checks.push({ name: "H1 Heading", status: "fail", message: "Missing H1 tag" });
    score -= 10;
  }

  // Schema.org
  if (html.includes("schema.org")) {
    checks.push({ name: "Schema.org Markup", status: "pass", message: "Structured data found" });
  } else {
    checks.push({ name: "Schema.org Markup", status: "warn", message: "No schema.org markup" });
    score -= 5;
  }

  // Phone number
  if (data.phone && html.includes(`tel:${data.phone}`)) {
    checks.push({ name: "Click-to-Call", status: "pass", message: "Phone link with tel: present" });
  } else {
    checks.push({ name: "Click-to-Call", status: "warn", message: "No click-to-call phone link" });
    score -= 5;
  }

  // Image alt tags
  const imgCount = (html.match(/<img /gi) || []).length;
  const altCount = (html.match(/alt=/gi) || []).length;
  if (imgCount > 0 && altCount >= imgCount) {
    checks.push({ name: "Image Alt Text", status: "pass", message: "All images have alt text" });
  } else if (imgCount > 0) {
    checks.push({ name: "Image Alt Text", status: "warn", message: `${imgCount - altCount} images missing alt text` });
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    checks,
  };
}

/**
 * Generate keyword suggestions based on business data.
 */
export function generateKeywords(data: BusinessData): string[] {
  const { industry, city, state, services } = data;
  const industryLabel = getIndustryLabel(industry).toLowerCase();

  const keywords = [
    // Service-based
    `${industryLabel} ${city}`,
    `best ${industryLabel} in ${city}`,
    `${city} ${industryLabel}`,
    `${industryLabel} near me`,
    `${industryLabel} ${city} ${state}`,

    // Service-specific
    ...services.map((s) => `${s.toLowerCase()} ${city}`),

    // Location-specific
    `${industryLabel} ${city} ${state} area`,
    `${city} ${state} ${industryLabel} services`,

    // Problem-based
    `emergency ${industryLabel} ${city}`,
    `affordable ${industryLabel} ${city}`,
  ];

  return [...new Set(keywords)];
}

// --- Helpers ---

function getIndustryLabel(industry: string): string {
  const labels: Record<string, string> = {
    plumber: "Plumber",
    roofer: "Roofer",
    hvac: "HVAC Contractor",
    heating: "Heating Service",
    cooling: "AC Service",
    dentist: "Dentist",
    dental: "Dentist",
    electrician: "Electrician",
    electrical: "Electrician",
    landscaper: "Landscaper",
    landscaping: "Landscaper",
    lawn: "Landscaper",
  };
  return labels[industry.toLowerCase().trim()] || "Service Provider";
}

function parseHours(hours?: string): Array<{ "@type": string; dayOfWeek: string[]; opens: string; closes: string }> {
  if (!hours) {
    return [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
    ];
  }

  // Simple parser for common formats like "Mon-Fri: 8am-5pm"
  try {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const parts = hours.split(",");
    return parts.map((part) => {
      const [dayRange, timeRange] = part.split(":").map((s) => s.trim());
      const dayList = dayRange?.includes("-") 
        ? parseDayRange(dayRange, days)
        : [dayRange || ""];
      const [opens, closes] = (timeRange || "").split("-").map((t) => normalizeTime(t));
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayList.filter(Boolean),
        opens: opens || "09:00",
        closes: closes || "17:00",
      };
    });
  } catch {
    return [];
  }
}

function parseDayRange(range: string, days: string[]): string[] {
  const [start, end] = range.split("-").map((s) => s.trim());
  const startIdx = days.findIndex((d) => d.toLowerCase().startsWith(start.toLowerCase()));
  const endIdx = days.findIndex((d) => d.toLowerCase().startsWith(end.toLowerCase()));
  if (startIdx === -1 || endIdx === -1) return [range];
  return days.slice(startIdx, endIdx + 1);
}

function normalizeTime(t: string): string {
  const match = t.toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return t;
  let hour = parseInt(match[1], 10);
  const minute = match[2] ? `:${match[2]}` : ":00";
  const period = match[3];
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}${minute}`;
}