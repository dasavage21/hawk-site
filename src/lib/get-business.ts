import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { businesses, sites, leads } from "~/db/schema";
import { getCurrentUser } from "~/lib/get-current-user";
import { eq, desc } from "drizzle-orm";

export const getBusinessData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { business: null, site: null };

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.userId, user.id),
    });

    if (!business) return { business: null, site: null };

    const site = await db.query.sites.findFirst({
      where: eq(sites.businessId, business.id),
    });

    return {
      business: {
        id: business.id,
        name: business.name,
        phone: business.phone,
        address: business.address,
        industry: business.industry,
        websiteUrl: business.websiteUrl,
      },
      site: site
        ? {
            id: site.id,
            subdomain: site.subdomain,
            published: site.published,
            generatedHtml: site.generatedHtml,
          }
        : null,
    };
  } catch (error) {
    return { business: null, site: null };
  }
});

export const getLeadsData = createServerFn({ method: "POST" })
  .validator((data: { businessId: string }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await getCurrentUser();
      if (!user) return { leads: [] };

      const businessLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.businessId, data.businessId))
        .orderBy(desc(leads.createdAt));

      return { leads: businessLeads };
    } catch (error) {
      return { leads: [] };
    }
  });