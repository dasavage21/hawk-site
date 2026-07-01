import { createFileRoute } from "@tanstack/react-router";
import { db } from "../../../../db";
import { adCampaigns, adVariations, adPerformance } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";

export const Route = createFileRoute("/api/ads/campaigns/$campaignId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { campaignId } = params;

        const [campaign] = await db
          .select()
          .from(adCampaigns)
          .where(eq(adCampaigns.id, campaignId))
          .limit(1);

        if (!campaign) {
          return Response.json({ error: "Campaign not found" }, { status: 404 });
        }

        const variations = await db
          .select()
          .from(adVariations)
          .where(eq(adVariations.campaignId, campaignId));

        // Get performance for each variation
        const variationsWithPerformance = await Promise.all(
          variations.map(async (v) => {
            const performance = await db
              .select()
              .from(adPerformance)
              .where(eq(adPerformance.variationId, v.id))
              .orderBy(desc(adPerformance.date));
            return { ...v, performance };
          })
        );

        return Response.json({ ...campaign, variations: variationsWithPerformance });
      },
      // POST /api/ads/campaigns/$campaignId - Sync performance data
      POST: async ({ params }) => {
        const { campaignId } = params;
        const { getGoogleAdsPerformance } = await import("../../../../lib/google-ads");

        const variations = await db
          .select()
          .from(adVariations)
          .where(eq(adVariations.campaignId, campaignId));

        if (variations.length === 0) {
          return Response.json({ error: "No variations found for campaign" }, { status: 400 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const v of variations) {
          const perf = await getGoogleAdsPerformance(campaignId);
          await db.insert(adPerformance).values({
            variationId: v.id,
            date: today,
            clicks: perf.clicks,
            impressions: perf.impressions,
            conversions: perf.conversions,
            spend: perf.cost,
          });
        }

        return Response.json({ message: "Performance data synced" });
      },
    },
  },
});
