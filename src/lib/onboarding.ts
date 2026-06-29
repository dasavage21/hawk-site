import { createServerFn } from '@tanstack/react-start'
import { db } from '~/db'
import { businesses, sites } from '~/db/schema'
import { getCurrentUser } from '~/lib/get-current-user'
import { eq } from 'drizzle-orm'

export const completeOnboarding = createServerFn({ method: 'POST' })
  .validator((data: { 
    businessId: string;
    phone: string;
    address: string;
    industry: string;
    subdomain: string;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Unauthorized')
      }

      // Update business details
      const [updatedBusiness] = await db
        .update(businesses)
        .set({
          phone: data.phone,
          address: data.address,
          industry: data.industry,
        })
        .where(eq(businesses.id, data.businessId))
        .returning()

      if (!updatedBusiness) {
        throw new Error('Business not found')
      }

      // Generate initial site (placeholder for AI engineer to enhance)
      const initialHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${updatedBusiness.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div class="min-h-screen bg-gray-100 flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
              <h1 class="text-3xl font-bold mb-4">${updatedBusiness.name}</h1>
              <p class="text-gray-600 mb-6">Expert ${updatedBusiness.industry} services in ${updatedBusiness.address}</p>
              <div class="space-y-4">
                <p class="font-semibold">Contact us: ${updatedBusiness.phone}</p>
                <button class="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition">
                  Get a Quote
                </button>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      const [newSite] = await db
        .insert(sites)
        .values({
          businessId: updatedBusiness.id,
          subdomain: data.subdomain,
          generatedHtml: initialHtml,
          published: true,
        })
        .returning()

      return { success: true, business: updatedBusiness, site: newSite }
    } catch (error: any) {
      console.error('Onboarding error:', error)
      return { success: false, error: error.message }
    }
  })
