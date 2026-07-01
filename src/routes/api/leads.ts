import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../db'
import { leads, businesses, users } from '../../db/schema'
import { getCurrentUser } from '../../lib/get-current-user'
import { eq, and } from 'drizzle-orm'
import { sendLeadNotification } from '../../lib/email'
import { sendLeadSMSNotification } from '../../lib/sms'

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

        // Trigger notifications
        try {
          const businessWithUser = await db.query.businesses.findFirst({
            where: eq(businesses.id, data.businessId),
            with: {
              user: true,
            },
          })

          if (businessWithUser) {
            // Email notification
            if (businessWithUser.user) {
              await sendLeadNotification({
                businessId: data.businessId,
                to: businessWithUser.user.email,
                businessName: businessWithUser.name,
                leadName: newLead.name,
                leadEmail: newLead.email,
                leadPhone: newLead.phone,
                leadMessage: newLead.message,
              })
            }

            // SMS notification (parallel channel)
            if (businessWithUser.phone) {
              await sendLeadSMSNotification({
                businessId: data.businessId,
                to: businessWithUser.phone,
                businessName: businessWithUser.name,
                leadName: newLead.name,
                leadPhone: newLead.phone,
              })
            }
          }
        } catch (error) {
          console.error('Notification trigger error:', error)
        }

        return Response.json(newLead)
      },
    },
  },
})
