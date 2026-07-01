import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { businesses, sites, leads } from "~/db/schema";
import { getCurrentUser } from "~/lib/get-current-user";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { generateWebsite } from "~/ai/site-generator";

// --- Types ---

export interface BusinessData {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  industry: string | null;
  websiteUrl: string | null;
}

export interface SiteData {
  id: string;
  subdomain: string;
  published: boolean;
  generatedHtml: string | null;
}

export interface LocationData extends BusinessData {
  site: SiteData | null;
  leadCount: number;
}

// --- Get all locations for the current user ---

export const getAllLocations = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { locations: [] };

    const userBusinesses = await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, user.id))
      .orderBy(desc(businesses.createdAt));

    if (userBusinesses.length === 0) return { locations: [] };

    const businessIds = userBusinesses.map((b) => b.id);

    const allSites = await db
      .select()
      .from(sites)
      .where(inArray(sites.businessId, businessIds));

    const leadCounts = await db
      .select({
        businessId: leads.businessId,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(inArray(leads.businessId, businessIds))
      .groupBy(leads.businessId);

    const leadCountMap = new Map(leadCounts.map((l) => [l.businessId, l.count]));
    const siteMap = new Map(allSites.map((s) => [s.businessId, s]));

    const locations: LocationData[] = userBusinesses.map((b) => {
      const site = siteMap.get(b.id);
      return {
        id: b.id,
        name: b.name,
        phone: b.phone,
        address: b.address,
        industry: b.industry,
        websiteUrl: b.websiteUrl,
        site: site
          ? {
              id: site.id,
              subdomain: site.subdomain,
              published: site.published,
              generatedHtml: site.generatedHtml,
            }
          : null,
        leadCount: leadCountMap.get(b.id) || 0,
      };
    });

    return { locations };
  } catch (error) {
    return { locations: [] };
  }
});

// --- Get primary (first) business data (backward compat) ---

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

// --- Get leads for a business ---

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

// --- Get all leads across all user's businesses ---

export const getAllLeadsData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { leads: [] };

    const userBusinesses = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.userId, user.id));

    if (userBusinesses.length === 0) return { leads: [] };

    const businessIds = userBusinesses.map((b) => b.id);

    const businessMap = await db
      .select({ id: businesses.id, name: businesses.name })
      .from(businesses)
      .where(inArray(businesses.id, businessIds));

    const nameMap = new Map(businessMap.map((b) => [b.id, b.name]));

    const allLeads = await db
      .select()
      .from(leads)
      .where(inArray(leads.businessId, businessIds))
      .orderBy(desc(leads.createdAt));

    const enrichedLeads = allLeads.map((lead) => ({
      ...lead,
      businessName: nameMap.get(lead.businessId) || "Unknown",
    }));

    return { leads: enrichedLeads };
  } catch (error) {
    return { leads: [] };
  }
});

// --- Create a new location ---

export const createLocation = createServerFn({ method: "POST" })
  .validator((data: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    industry: string;
    services: string[];
    description: string;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Unauthorized");

      const [newBusiness] = await db
        .insert(businesses)
        .values({
          userId: user.id,
          name: data.name,
          phone: data.phone,
          address: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
          industry: data.industry,
        })
        .returning();

      const generatedHtml = generateWebsite({
        name: data.name,
        industry: data.industry,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        services: data.services,
        description: data.description,
      });

      const subdomain = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 30) + "-" + Math.random().toString(36).slice(2, 6);

      const [newSite] = await db
        .insert(sites)
        .values({
          businessId: newBusiness.id,
          subdomain,
          generatedHtml,
          published: true,
        })
        .returning();

      return {
        success: true,
        location: {
          id: newBusiness.id,
          name: newBusiness.name,
          site: newSite,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });