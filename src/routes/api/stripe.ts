import { createFileRoute } from '@tanstack/react-router'
import { stripe, PLANS } from '../../lib/stripe'
import { getCurrentUser } from '../../lib/get-current-user'
import { db } from '../../db'
import { businesses } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export const Route = createFileRoute('/api/stripe')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await getCurrentUser()
          if (!user) {
            return new Response('Unauthorized', { status: 401 })
          }

          const data = await request.json()
          const { businessId, planTier } = data

          if (!businessId || !planTier) {
            return new Response('businessId and planTier are required', { status: 400 })
          }

          // Verify user owns the business
          const business = await db.query.businesses.findFirst({
            where: and(eq(businesses.id, businessId), eq(businesses.userId, user.id)),
          })

          if (!business) {
            return new Response('Forbidden', { status: 403 })
          }

          const plan = PLANS[planTier.toUpperCase() as keyof typeof PLANS]
          if (!plan || !plan.priceId) {
            return new Response('Invalid plan or price not configured', { status: 400 })
          }

          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price: plan.priceId,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL}/dashboard`,
            customer_email: user.email,
            client_reference_id: businessId,
            metadata: {
              businessId,
              planTier,
            },
          })

          return Response.json({ url: session.url })
        } catch (error: any) {
          console.error('Checkout error:', error)
          return Response.json({ error: error.message }, { status: 500 })
        }
      },
    },
  },
})
