import express from 'express'
import cors from 'cors'
import { authRoutes } from './routes/auth.js'
import { productRoutes } from './routes/products.js'
import { wishlistRoutes } from './routes/wishlist.js'
import { orderRoutes } from './routes/orders.js'
import { stripeEnabled } from './stripe.js'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }))
app.use(express.json())

// lets the frontend explain how checkout works
app.get('/api/config', (req, res) => res.json({ payments: stripeEnabled() ? 'stripe' : 'demo' }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)

app.use((req, res) => res.status(404).json({ message: 'Not found.' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong on the server.' })
})
