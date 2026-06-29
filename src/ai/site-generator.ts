import { getTemplate, type BusinessData } from "./templates/index";

/**
 * Generate a complete HTML website for a local business.
 *
 * Accepts business data and returns a fully-formed HTML string using the
 * appropriate industry template (or generic fallback) with:
 *  - Hero section with business name and tagline
 *  - Services listing
 *  - About section
 *  - Contact CTA with phone number
 *  - Google Maps embed
 *  - SEO meta tags
 *  - Mobile-responsive design
 *
 * For the MVP, templates are pre-built industry designs with dynamic content
 * injection (no LLM calls). Future phases may add AI-powered customization.
 */
export function generateWebsite(data: BusinessData): string {
  const render = getTemplate(data.industry);
  return render(data);
}

export { type BusinessData } from "./templates/index";
export { getTemplate } from "./templates/index";