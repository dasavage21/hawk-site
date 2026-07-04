import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.error("STRIPE_SECRET_KEY is not set. Please set it in the environment.");
  process.exit(1);
}

const stripe = new Stripe(secretKey);

async function createProducts() {
  const products = [
    {
      name: 'Starter',
      amount: 7900,
    },
    {
      name: 'Growth',
      amount: 14900,
    },
    {
      name: 'Pro',
      amount: 29900,
    },
  ];

  for (const p of products) {
    try {
      const product = await stripe.products.create({
        name: `LocalAmp ${p.name}`,
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.amount,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      });
      console.log(`${p.name}: Product ID: ${product.id}, Price ID: ${price.id}`);
    } catch (e) {
      console.error(`Failed to create ${p.name}: `, e);
    }
  }
}

createProducts();
