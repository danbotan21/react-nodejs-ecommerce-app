import Stripe from 'stripe'

let client = null

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY)

// Created on first use so the app (and the tests) can run without a Stripe key
export const getStripe = () => {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY)
  return client
}
