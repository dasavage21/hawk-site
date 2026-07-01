import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db'
import { businesses, sites, leads } from '../../../db/schema'
import { getCurrentUser } from '../../../lib/get-current-user'
import { generateWebsite } from '../../../ai/site-generator'
import { eq, and } from 'drizzle-orm'

// GET /api/business/data — get user's primary business + site
function createGetBusinessDataRoute() {
  return createFileRoute('/api/business/data')({
    server: {
      handlers: {
        GET: async () => {
          const user = await getCurrentUser()
          if (!user) return Response.json({ business: null, site: null })

          const business = await db.query.businesses.findFirst({
            where: eq(businesses.userId, user.id),
          })
          if (!business) return Response.json({ business: null, site: null })

          const site = await db.query.sites.findFirst({
            where: eq(sites.businessId, business.id),
          })
          return Response.json({ business, site })
        },
      },
    },
  })
}

// GET /api/business/locations — get all user businesses with sites and lead counts
function createGetAllLocationsRoute() {
  return createFileRoute('/api/business/locations')({
    server: {
      handlers: {
        GET: async () => {
          const user = await getCurrentUser()
          if (!user) return Response.json({ locations: [] })

          const userBusinesses = await db.query.businesses.findMany({
            where: eq(businesses.userId, user.id),
            with: { sites: true },
          })

          const locations = await Promise.all(
            userBusinesses.map(async (biz) => {
              const leadCount = await db.$count(leads, eq(leads.businessId, biz.id))
              return { ...biz, leadCount }
            })
          )

          return Response.json({ locations })
        },
      },
    },
  })
}

// POST /api/business/create-location — create new location + generate website
function createCreateLocationRoute() {
  return createFileRoute('/api/business/create-location')({
    server: {
      handlers: {
        POST: async ({ request }) => {
          const user = await getCurrentUser()
          if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })

          const data = await request.json()
          const [newBusiness] = await db.insert(businesses).values({
            userId: user.id,
            name: data.name,
            phone: data.phone || '',
            address: `${data.address || ''}, ${data.city || ''}, ${data.state || ''} ${data.zip || ''}`,
            industry: data.industry,
          }).returning()

          const html = generateWebsite({
            name: data.name,
            industry: data.industry || 'generic',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || '',
            services: data.services || [],
            description: data.description || '',
          })

          const [newSite] = await db.insert(sites).values({
            businessId: newBusiness.id,
            subdomain: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            generatedHtml: html,
            published: true,
          }).returning()

          return Response.json({ success: true, business: newBusiness, site: newSite })
        },
      },
    },
  })
}

// POST /api/leads/all — get leads across all user businesses
function createGetAllLeadsRoute() {
  return createFileRoute('/api/leads/all')({
    server: {
      handlers: {
        POST: async ({ request }) => {
          const user = await getCurrentUser()
          if (!user) return Response.json({ leads: [] })

          const data = await request.json()
          const userBusinesses = await db.query.businesses.findMany({
            where: eq(businesses.userId, user.id),
          })
          const businessIds = userBusinesses.map(b => b.id)

          let result
          if (data.businessId) {
            result = await db.query.leads.findMany({
              where: and(eq(leads.businessId, data.businessId), ...(data.source ? [eq(leads.source, data.source)] : [])),
              orderBy: (leads, { desc }) => [desc(leads.createdAt)],
            })
          } else {
            result = await db.query.leads.findMany({
              where: data.source ? eq(leads.source, data.source) : undefined,
              orderBy: (leads, { desc }) => [desc(leads.createdAt)],
            })
          }

          const enriched = result.map(l => {
            const biz = userBusinesses.find(b => b.id === l.businessId)
            return { ...l, businessName: biz?.name || '' }
          })

          return Response.json({ leads: enriched })
        },
      },
    },
  })
}

export const BusinessDataRoute = createGetBusinessDataRoute()
export const AllLocationsRoute = createGetAllLocationsRoute()
export const CreateLocationRoute = createCreateLocationRoute()
export const AllLeadsRoute = createGetAllLeadsRoute()