import { createFileRoute } from "@tanstack/react-router";
import { db } from "../../../db";
import { keywordRankings } from "../../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "../../../lib/get-current-user";

/**
 * GET /api/seo/rankings — Get keyword rankings for a business.
 * Query params: businessId (required)
 *
 * POST /api/seo/rankings — Add/update a keyword ranking entry.
 * Body: { businessId, keyword, position, searchVolume? }
 */
export const Route = createFileRoute("/api/seo/rankings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getCurrentUser();
        if (!user) return new Response("Unauthorized", { status: 401 });

        const url = new URL(request.url);
        const businessId = url.searchParams.get("businessId");
        if (!businessId) {
          return new Response("businessId is required", { status: 400 });
        }

        const rankings = await db
          .select()
          .from(keywordRankings)
          .where(eq(keywordRankings.businessId, businessId))
          .orderBy(desc(keywordRankings.checkedAt))
          .limit(100);

        return Response.json(rankings);
      },

      POST: async ({ request }) => {
        const user = await getCurrentUser();
        if (!user) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as Record<string, unknown>;
        const businessId = String(body.businessId ?? "").trim();
        const keyword = String(body.keyword ?? "").trim();

        if (!businessId || !keyword) {
          return new Response("businessId and keyword are required", { status: 400 });
        }

        const position = body.position ? parseInt(String(body.position), 10) : null;
        const searchVolume = body.searchVolume ? parseInt(String(body.searchVolume), 10) : null;

        // Get the previous position for this keyword
        const [lastRanking] = await db
          .select()
          .from(keywordRankings)
          .where(
            and(
              eq(keywordRankings.businessId, businessId),
              eq(keywordRankings.keyword, keyword),
            ),
          )
          .orderBy(desc(keywordRankings.checkedAt))
          .limit(1);

        const [newRanking] = await db
          .insert(keywordRankings)
          .values({
            businessId,
            keyword,
            position,
            previousPosition: lastRanking?.position ?? null,
            searchVolume,
          })
          .returning();

        return Response.json(newRanking);
      },
    },
  },
});
