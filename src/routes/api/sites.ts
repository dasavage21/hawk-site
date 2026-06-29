import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../db'
import { sites, businesses } from '../../db/schema'
import { getCurrentUser } from '../../lib/get-current-user'
import { eq, and } from 'drizzle-orm'

export const Route = createFileRoute('/api/sites')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getCurrentUser()
        if (!user) {
          return new Response('Unauthorized', { status: 401 })
        }

        const url = new URL(request.url)
        const businessId = url.searchParams.get('businessId')

        if (!businessId) {
          return new Response('businessId is required', { status: 400 })
        }

        // Verify user owns the business
        const business = await db.query.businesses.findFirst({
          where: and(eq(businesses.id, businessId), eq(businesses.userId, user.id)),
        })

        if (!business) {
          return new Response('Forbidden', { status: 403 })
        }

        const businessSites = await db
          .select()
          .from(sites)
          .where(eq(sites.businessId, businessId))

        return Response.json(businessSites)
      },
      POST: async ({ request }) => {
        const user = await getCurrentUser()
        if (!user) {
          return new Response('Unauthorized', { status: 401 })
        }

        const data = await request.json()
        
        // Verify user owns the business
        const business = await db.query.businesses.findFirst({
          where: and(eq(businesses.id, data.businessId), eq(businesses.userId, user.id)),
        })

        if (!business) {
          return new Response('Forbidden', { status: 403 })
        }

        const [newSite] = await db
          .insert(sites)
          .values({
            businessId: data.businessId,
            subdomain: data.subdomain,
            generatedHtml: data.generatedHtml,
            published: data.published ?? false,
          })
          .returning()

        return Response.json(newSite)
      },
    },
  },
})
