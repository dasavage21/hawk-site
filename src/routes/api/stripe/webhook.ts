import { createFileRoute } from '@tanstack/react-router'
import { stripe } from '../../../lib/stripe'
import { db } from '../../../db'
import { subscriptions } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.text()
        const sig = request.headers.get('stripe-signature')

        if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
          return new Response('Webhook secret or signature missing', { status: 400 })
        }

        let event

        try {
          event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
          )
        } catch (err: any) {
          console.error(`Webhook Error: ${err.message}`)
          return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        try {
          switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object as any
              const businessId = session.client_reference_id
              const stripeSubscriptionId = session.subscription
              const planTier = session.metadata.planTier

              if (businessId && stripeSubscriptionId) {
                await db.insert(subscriptions).values({
                  businessId,
                  stripeSubscriptionId,
                  planTier,
                  status: 'active',
                })
              }
              break
            }
            case 'customer.subscription.deleted': {
              const subscription = event.data.object as any
              await db
                .update(subscriptions)
                .set({ status: 'canceled' })
                .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
              break
            }
            case 'customer.subscription.updated': {
              const subscription = event.data.object as any
              await db
                .update(subscriptions)
                .set({ status: subscription.status })
                .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
              break
            }
          }

          return Response.json({ received: true })
        } catch (error: any) {
          console.error('Webhook processing error:', error)
          return new Response('Webhook processing error', { status: 500 })
        }
      },
    },
  },
})
