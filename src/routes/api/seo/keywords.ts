import { createFileRoute } from "@tanstack/react-router";
import { generateKeywords, generateLocationPageData } from "../../../ai/seo";
import type { BusinessData } from "../../../ai/templates/plumber";

/**
 * POST /api/seo/keywords — Generate SEO keyword suggestions and location page data.
 *
 * Request body:
 *   businessData: BusinessData
 *   targetCity: string (optional) - for location page generation
 *   targetState: string (optional) - for location page generation
 *
 * Returns:
 *   keywords: string[] - suggested keywords
 *   locationPage: object - generated location page data
 */
export const Route = createFileRoute("/api/seo/keywords")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            businessData: BusinessData;
            targetCity?: string;
            targetState?: string;
          };

          if (!body.businessData) {
            return Response.json(
              { error: "businessData is required" },
              { status: 400 },
            );
          }

          const keywords = generateKeywords(body.businessData);

          const locationPage = generateLocationPageData(
            body.businessData,
            body.targetCity,
            body.targetState,
          );

          return Response.json({
            keywords,
            locationPage,
            total: keywords.length,
          });
        } catch (err) {
          console.error("Keywords error:", err);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
