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
 *  - AI Chat Assistant widget (auto-embedded)
 *
 * For the MVP, templates are pre-built industry designs with dynamic content
 * injection (no LLM calls). Future phases may add AI-powered customization.
 */
export function generateWebsite(data: BusinessData): string {
  const render = getTemplate(data.industry);
  const html = render(data);

  // Inject the chat widget embed snippet before </body>
  const embedSnippet = generateChatEmbed(data.name, data.industry);
  return html.replace("</body>", `${embedSnippet}\n</body>`);
}

/**
 * Generate the HTML snippet for the AI Chat Assistant widget.
 * This gets embedded into generated websites.
 */
function generateChatEmbed(businessName: string, industry: string): string {
  // Use the business name as a stable session identifier
  const businessId = businessName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  return [
    `<!-- LocalAmp AI Chat Assistant -->`,
    `<div id="localamp-chat" data-business-id="${businessId}" data-industry="${industry}" style="display:none"></div>`,
    `<script>`,
    `(function(){`,
    `var d=document.getElementById('localamp-chat');`,
    `if(!d)return; d.style.display='block';`,
    `var s=d.createElement('script');`,
    `s.src='/api/embed/chat-embed.js';`,
    `s.async=true;`,
    `d.parentNode.appendChild(s);`,
    `})();`,
    `</script>`,
  ].join("\n");
}

export { type BusinessData } from "./templates/index";
export { getTemplate } from "./templates/index";