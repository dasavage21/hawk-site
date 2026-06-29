import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
})

export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 7900,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
  },
  GROWTH: {
    id: 'growth',
    name: 'Growth',
    price: 14900,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29900,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
}
