import { Hono } from 'hono'
import type { Env, Variables } from '../types/env'

const webhooks = new Hono<{ Bindings: Env; Variables: Variables }>()

// ── POST /api/webhooks/stripe ── Stripe billing webhooks
webhooks.post('/stripe', async (c) => {
  const signature = c.req.header('stripe-signature')
  if (!signature) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing stripe signature' } }, 400)
  }

  // In production, verify event signature with STRIPE_WEBHOOK_SECRET
  // Handle subscription created / invoice paid events
  return c.json({ received: true })
})

// ── POST /api/webhooks/razorpay ── Razorpay payment gateway webhooks
webhooks.post('/razorpay', async (c) => {
  const signature = c.req.header('x-razorpay-signature')
  const body = await c.req.json().catch(() => ({}))

  console.log('[Razorpay Webhook Received]', body.event, 'Signature present:', !!signature)

  // In production, verify crypto HMAC SHA256 signature with RAZORPAY_WEBHOOK_SECRET
  if (body.event === 'payment.captured' || body.event === 'order.paid') {
    const payment = body.payload?.payment?.entity
    console.log(`[Razorpay Payment Captured] ID: ${payment?.id}, Amount: ${payment?.amount}`)
  }

  return c.json({ status: 'ok', received: true, gateway: 'razorpay' })
})

// ── POST /api/webhooks/inbound ── External trigger webhook
webhooks.post('/inbound', async (c) => {
  return c.json({ success: true, processedAt: new Date().toISOString() })
})

export default webhooks
