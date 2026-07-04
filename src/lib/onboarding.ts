import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { businesses, sites } from "~/db/schema";
import { getCurrentUser } from "~/lib/get-current-user";
import { generateWebsite } from "~/ai/site-generator";
import { eq } from "drizzle-orm";

export const completeOnboarding = createServerFn({ method: "POST" })
  .validator((data: {
    businessId: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    industry: string;
    services: string[];
    description: string;
    subdomain: string;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Update business details
      const [updatedBusiness] = await db
        .update(businesses)
        .set({
          phone: data.phone,
          address: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
          industry: data.industry,
        })
        .where(eq(businesses.id, data.businessId))
        .returning();

      if (!updatedBusiness) {
        throw new Error("Business not found");
      }

      // Generate AI website
      const generatedHtml = generateWebsite({
        name: updatedBusiness.name,
        industry: data.industry,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        services: data.services,
        description: data.description,
      });

      // Save site
      const [newSite] = await db
        .insert(sites)
        .values({
          businessId: updatedBusiness.id,
          subdomain: data.subdomain,
          generatedHtml,
          published: true,
        })
        .returning();

      return { success: true, business: updatedBusiness, site: newSite };
    } catch (error: any) {
      console.error("Onboarding error:", error);
      return { success: false, error: error.message };
    }
  });