import { createFileRoute } from "@tanstack/react-router";
import { db } from "../../../db";
import { adCampaigns, adVariations, adPerformance } from "../../../db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

/** Simple UUID format check (hex groups separated by dashes) */
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export const Route = createFileRoute("/api/ads/performance")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const businessId = url.searchParams.get("businessId");
          const campaignId = url.searchParams.get("campaignId");
          const startDate = url.searchParams.get("startDate");
          const endDate = url.searchParams.get("endDate");

          if (!businessId && !campaignId) {
            return Response.json({ error: "businessId or campaignId is required" }, { status: 400 });
          }

          if (businessId && !isValidUUID(businessId)) {
            return Response.json({ error: "Invalid businessId format" }, { status: 400 });
          }
          if (campaignId && !isValidUUID(campaignId)) {
            return Response.json({ error: "Invalid campaignId format" }, { status: 400 });
          }

          let query = db
            .select({
              date: adPerformance.date,
              clicks: sql<number>`sum(${adPerformance.clicks})`,
              impressions: sql<number>`sum(${adPerformance.impressions})`,
              conversions: sql<number>`sum(${adPerformance.conversions})`,
              spend: sql<number>`sum(${adPerformance.spend})`,
            })
            .from(adPerformance)
            .innerJoin(adVariations, eq(adPerformance.variationId, adVariations.id))
            .innerJoin(adCampaigns, eq(adVariations.campaignId, adCampaigns.id))
            .groupBy(adPerformance.date);

          const conditions = [];
          if (businessId) {
            conditions.push(eq(adCampaigns.businessId, businessId));
          }
          if (campaignId) {
            conditions.push(eq(adCampaigns.id, campaignId));
          }
          if (startDate) {
            conditions.push(gte(adPerformance.date, new Date(startDate)));
          }
          if (endDate) {
            conditions.push(lte(adPerformance.date, new Date(endDate)));
          }

          if (conditions.length > 0) {
            query = query.where(and(...conditions));
          }

          const performanceData = await query;

          // Best performing variations
          const variationsQuery = db
            .select({
              variationId: adVariations.id,
              copy: adVariations.copy,
              clicks: sql<number>`sum(${adPerformance.clicks})`,
              impressions: sql<number>`sum(${adPerformance.impressions})`,
              conversions: sql<number>`sum(${adPerformance.conversions})`,
              spend: sql<number>`sum(${adPerformance.spend})`,
            })
            .from(adPerformance)
            .innerJoin(adVariations, eq(adPerformance.variationId, adVariations.id))
            .innerJoin(adCampaigns, eq(adVariations.campaignId, adCampaigns.id))
            .groupBy(adVariations.id);

          if (conditions.length > 0) {
            variationsQuery.where(and(...conditions));
          }

          const variationsPerformance = await variationsQuery;

          // Calculate totals
          const totals = performanceData.reduce(
            (acc, curr) => ({
              clicks: acc.clicks + Number(curr.clicks),
              impressions: acc.impressions + Number(curr.impressions),
              conversions: acc.conversions + Number(curr.conversions),
              spend: acc.spend + Number(curr.spend),
            }),
            { clicks: 0, impressions: 0, conversions: 0, spend: 0 }
          );

          return Response.json({
            daily: performanceData,
            variations: variationsPerformance,
            totals,
          });
        } catch (err: any) {
          console.error("Ads performance error:", err);
          const message = err?.message || "Internal server error";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
