import { createFileRoute } from "@tanstack/react-router";
import { db } from "../../../db";
import { sites } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { runSEOAudit } from "../../../ai/seo";
import type { BusinessData } from "../../../ai/templates/plumber";

/**
 * POST /api/seo/audit — Run an SEO audit on a generated business website.
 *
 * Request body:
 *   siteId: string (optional) - ID of the site to audit (fetches HTML from DB)
 *   html: string (optional) - raw HTML to audit directly
 *   businessData: BusinessData (optional) - business info for context
 *
 * Returns an SEO score (0-100) with detailed pass/fail/warn checks.
 */
export const Route = createFileRoute("/api/seo/audit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as Record<string, unknown>;
          let html = String(body.html ?? "").trim();
          const businessData = body.businessData as BusinessData | undefined;
          const siteId = String(body.siteId ?? "").trim();

          // Fetch HTML from database if siteId is provided
          if (!html && siteId) {
            const [site] = await db
              .select()
              .from(sites)
              .where(eq(sites.id, siteId))
              .limit(1);

            if (!site) {
              return Response.json({ error: "Site not found" }, { status: 404 });
            }
            html = site.generatedHtml || "";
          }

          if (!html && !businessData) {
            return Response.json(
              { error: "Provide html, siteId, or businessData" },
              { status: 400 },
            );
          }

          // If we have businessData but no html, generate a basic audit
          if (!html && businessData) {
            return Response.json({
              error: "HTML content is required to audit. Provide html or siteId.",
            }, { status: 400 });
          }

          const result = runSEOAudit(
            businessData || {
              name: "",
              industry: "",
              phone: "",
              address: "",
              city: "",
              state: "",
              zip: "",
              services: [],
              description: "",
            },
            html,
          );

          return Response.json({
            score: result.score,
            checks: result.checks,
            summary: {
              passed: result.checks.filter((c) => c.status === "pass").length,
              warnings: result.checks.filter((c) => c.status === "warn").length,
              failed: result.checks.filter((c) => c.status === "fail").length,
            },
          });
        } catch (err) {
          console.error("SEO audit error:", err);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
