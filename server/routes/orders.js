import express from 'express'
import mongoose from 'mongoose'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'
import { getStripe, stripeEnabled } from '../stripe.js'

const router = express.Router()

router.use(requireAuth)

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:3000'

router.get('/', async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.userId, status: 'paid' }).sort({ createdAt: -1 }))
  } catch (error) {
    next(error)
  }
})

// Body: { items: [{ productId, quantity }] }. Prices always come from the database, never from the browser.
router.post('/checkout', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : []
    const valid = items.every(
      (item) =>
        mongoose.isValidObjectId(item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 10
    )
    if (!items.length || !valid) {
      return res.status(400).json({ message: 'Your cart is empty or has an invalid item.' })
    }

    const products = await Product.find({ _id: { $in: items.map((item) => item.productId) } })
    const byId = new Map(products.map((product) => [String(product._id), product]))
    if (items.some((item) => !byId.has(String(item.productId)))) {
      return res.status(400).json({ message: 'A product in your cart is no longer available.' })
    }

    const lines = items.map(({ productId, quantity }) => {
      const product = byId.get(String(productId))
      return { product: product._id, title: product.title, image: product.image, price: product.price, quantity }
    })
    const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
    const order = await Order.create({ user: req.userId, items: lines, total })

    // Without a Stripe key the order is confirmed right away, so the app can be tried without payments
    if (!stripeEnabled()) {
      order.status = 'paid'
      await order.save()
      return res.status(201).json({ url: `${clientUrl()}/checkout/success?order=${order._id}` })
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(line.price * 100),
          product_data: { name: line.title, images: [line.image] },
        },
      })),
      metadata: { orderId: String(order._id) },
      success_url: `${clientUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl()}/cart`,
    })

    order.stripeSessionId = session.id
    await order.save()
    res.status(201).json({ url: session.url })
  } catch (error) {
    next(error)
  }
})

// Called by the success page: asks Stripe whether the session was paid
router.post('/confirm', async (req, res, next) => {
  try {
    const { sessionId, orderId } = req.body
    const query = sessionId ? { stripeSessionId: String(sessionId) } : { _id: orderId }
    if (!sessionId && !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'Missing order.' })
    }

    const order = await Order.findOne({ ...query, user: req.userId })
    if (!order) return res.status(404).json({ message: 'Order not found.' })

    if (order.status !== 'paid' && sessionId && stripeEnabled()) {
      const session = await getStripe().checkout.sessions.retrieve(order.stripeSessionId)
      if (session.payment_status === 'paid') {
        order.status = 'paid'
        await order.save()
      }
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
})

export { router as orderRoutes }
