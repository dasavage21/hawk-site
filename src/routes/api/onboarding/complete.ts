import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db'
import { businesses, sites } from '../../../db/schema'
import { getCurrentUser } from '../../../lib/get-current-user'
import { generateWebsite } from '../../../ai/site-generator'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/onboarding/complete')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await getCurrentUser()
          if (!user) {
            return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
          }

          const data = await request.json()
          if (!data.phone || !data.industry) {
            return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 })
          }

          // Update business details
          const [updatedBusiness] = await db
            .update(businesses)
            .set({
              phone: data.phone,
              address: `${data.address || ''}, ${data.city || ''}, ${data.state || ''} ${data.zip || ''}`,
              industry: data.industry,
            })
            .where(eq(businesses.id, data.businessId))
            .returning()

          if (!updatedBusiness) {
            return Response.json({ success: false, error: 'Business not found' }, { status: 404 })
          }

          // Generate AI website
          const generatedHtml = generateWebsite({
            name: updatedBusiness.name,
            industry: data.industry,
            phone: data.phone,
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || '',
            services: data.services || [],
            description: data.description || '',
          })

          // Save site
          const [newSite] = await db
            .insert(sites)
            .values({
              businessId: updatedBusiness.id,
              subdomain: data.subdomain || updatedBusiness.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              generatedHtml,
              published: true,
            })
            .returning()

          return Response.json({ success: true, business: updatedBusiness, site: newSite })
        } catch (error: any) {
          console.error('Onboarding error:', error)
          return Response.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
