import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db'
import { businesses, sites } from '../../../db/schema'
import { getCurrentUser } from '../../../lib/get-current-user'
import { eq } from 'drizzle-orm'

/**
 * GET /api/business — get user's primary business + site data
 */
export const Route = createFileRoute('/api/business/')({
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