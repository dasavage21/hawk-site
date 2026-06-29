import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../db'
import { leads, businesses } from '../../db/schema'
import { getCurrentUser } from '../../lib/get-current-user'
import { eq, and } from 'drizzle-orm'

export const Route = createFileRoute('/api/leads')({
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

        const businessLeads = await db
          .select()
          .from(leads)
          .where(eq(leads.businessId, businessId))

        return Response.json(businessLeads)
      },
      POST: async ({ request }) => {
        // This is a public endpoint for lead capture from generated sites
        const data = await request.json()
        
        if (!data.businessId) {
          return new Response('businessId is required', { status: 400 })
        }

        const [newLead] = await db
          .insert(leads)
          .values({
            businessId: data.businessId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
            source: data.source || 'web',
          })
          .returning()

        return Response.json(newLead)
      },
    },
  },
})
