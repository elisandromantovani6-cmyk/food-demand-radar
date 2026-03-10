import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

export const PLANS = {
  starter: {
    name: "Starter",
    price: 19700, // centavos (R$ 197)
    priceId: process.env.STRIPE_PRICE_STARTER!,
    limits: { campaigns: 5, neighborhoods: 5, users: 1 },
  },
  pro: {
    name: "Pro",
    price: 39700,
    priceId: process.env.STRIPE_PRICE_PRO!,
    limits: { campaigns: -1, neighborhoods: 20, users: 5 },
  },
  enterprise: {
    name: "Enterprise",
    price: 99700,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    limits: { campaigns: -1, neighborhoods: -1, users: -1 },
  },
} as const;

export type PlanId = keyof typeof PLANS;
