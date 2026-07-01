import { createFileRoute } from "@tanstack/react-router";
import { db } from "../../../db";
import { adCampaigns, adVariations } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

export const Route = createFileRoute("/api/ads/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const businessId = url.searchParams.get("businessId");

        if (!businessId) {
          return Response.json({ error: "businessId is required" }, { status: 400 });
        }

        const campaigns = await db
          .select()
          .from(adCampaigns)
          .where(eq(adCampaigns.businessId, businessId))
          .orderBy(desc(adCampaigns.createdAt));

        return Response.json(campaigns);
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as any;
        const { businessId, platform, name, budget, startDate, endDate } = body;

        if (!businessId || !platform || !name || !budget) {
          return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [campaign] = await db
          .insert(adCampaigns)
          .values({
            businessId,
            platform,
            name,
            budget,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            status: "active",
          })
          .returning();

        // Auto-generate and create initial variations
        const { generateAdCopy } = await import("../../../ai/ad-generator");
        const adCopy = await generateAdCopy(businessId);
        const copies = platform === "google" ? adCopy.googleLocalServices : adCopy.socialMedia;

        for (const copy of copies) {
          await db.insert(adVariations).values({
            campaignId: campaign.id,
            copy: JSON.stringify(copy),
            status: "active",
          });
        }

        return Response.json(campaign);
      },
    },
  },
});
