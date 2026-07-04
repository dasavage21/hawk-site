import { db } from "../db";
import { businesses } from "../db/schema";
import { eq } from "drizzle-orm";

export interface AdCopy {
  headline: string;
  description: string;
  callToAction: string;
}

export interface AdGenerationResult {
  googleLocalServices: AdCopy[];
  socialMedia: AdCopy[];
}

const templates: Record<string, { headlines: string[], descriptions: string[], ctas: string[] }> = {
  plumber: {
    headlines: [
      "Expert Plumber in Your Area",
      "Emergency Plumbing - 24/7 Service",
      "Trusted Local Plumbing Experts",
      "Leaky Pipe? We Can Help!",
    ],
    descriptions: [
      "Get reliable plumbing services today. Licensed and insured professionals at your service.",
      "From drains to pipes, we handle it all. Quality workmanship guaranteed.",
      "Your local choice for all plumbing needs. Fast response times and fair pricing.",
    ],
    ctas: ["Call Now", "Get a Quote", "Book Online"],
  },
  roofer: {
    headlines: [
      "Top-Rated Local Roofers",
      "Roof Repair & Replacement",
      "Trusted Roofing Experts",
      "Protect Your Home with a New Roof",
    ],
    descriptions: [
      "Quality roofing services you can trust. Durable materials and expert installation.",
      "Is your roof leaking? Get a free inspection from our local experts today.",
      "Specializing in residential and commercial roofing. Fully licensed and insured.",
    ],
    ctas: ["Get Free Estimate", "Call for Inspection", "Schedule Now"],
  },
  generic: {
    headlines: [
      "Quality Service You Can Trust",
      "Local Experts at Your Service",
      "Reliable and Professional",
    ],
    descriptions: [
      "Providing top-notch services for our local community. Satisfaction guaranteed.",
      "Get the job done right the first time. Contact our expert team today.",
    ],
    ctas: ["Contact Us", "Learn More", "Request Quote"],
  },
};

export async function generateAdCopy(businessId: string): Promise<AdGenerationResult> {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);

  const industry = (business?.industry?.toLowerCase() as string) || "generic";
  const selectedTemplates = templates[industry] || templates.generic;

  const generateVariations = (count: number): AdCopy[] => {
    const variations: AdCopy[] = [];
    for (let i = 0; i < count; i++) {
      variations.push({
        headline: selectedTemplates.headlines[Math.floor(Math.random() * selectedTemplates.headlines.length)],
        description: selectedTemplates.descriptions[Math.floor(Math.random() * selectedTemplates.descriptions.length)],
        callToAction: selectedTemplates.ctas[Math.floor(Math.random() * selectedTemplates.ctas.length)],
      });
    }
    return variations;
  };

  return {
    googleLocalServices: generateVariations(3),
    socialMedia: generateVariations(3),
  };
}
