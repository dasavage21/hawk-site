import { createFileRoute } from "@tanstack/react-router";
import { db } from "../../../db";
import { lsaProfiles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/ads/lsa")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const businessId = url.searchParams.get("businessId");

        if (!businessId) {
          return Response.json({ error: "businessId is required" }, { status: 400 });
        }

        const [profile] = await db
          .select()
          .from(lsaProfiles)
          .where(eq(lsaProfiles.businessId, businessId));

        if (!profile) {
          return Response.json({ status: "not_started" });
        }

        return Response.json(profile);
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as any;
        const {
          businessId,
          licenseNumber,
          insuranceCarrier,
          insurancePolicyNumber,
        } = body;

        if (!businessId) {
          return Response.json({ error: "businessId is required" }, { status: 400 });
        }

        const [existing] = await db
          .select()
          .from(lsaProfiles)
          .where(eq(lsaProfiles.businessId, businessId));

        let profile;
        if (existing) {
          [profile] = await db
            .update(lsaProfiles)
            .set({
              licenseNumber,
              insuranceCarrier,
              insurancePolicyNumber,
              status: "pending_verification",
              updatedAt: new Date(),
            })
            .where(eq(lsaProfiles.businessId, businessId))
            .returning();
        } else {
          [profile] = await db
            .insert(lsaProfiles)
            .values({
              businessId,
              licenseNumber,
              insuranceCarrier,
              insurancePolicyNumber,
              status: "pending_verification",
            })
            .returning();
        }

        return Response.json(profile);
      },
    },
  },
});
