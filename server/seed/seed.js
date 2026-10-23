// Adds the demo accounts, products and reviews. Safe to run more than once.
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { Product } from '../models/Product.js'
import { Review } from '../models/Review.js'

export const DEMO_PASSWORD = 'ShopDemo123!'

const USERS = [
  { name: 'Demo Shopper', email: 'demo@shop.app' },
  { name: 'Maria Popescu', email: 'maria@shop.app' },
  { name: 'Alex Rusu', email: 'alex@shop.app' },
  { name: 'Elena Ciobanu', email: 'elena@shop.app' },
]

// [product, reviewer, rating, title, content]
const REVIEWS = [
  ['Logitech G Pro X Superlight', 'maria@shop.app', 5, 'Feels like nothing in your hand', 'Super light and the sensor is perfect. Battery lasts all week.'],
  ['Logitech G Pro X Superlight', 'alex@shop.app', 4, 'Great mouse, pricey', 'Best mouse I have used for shooters. I only wish it came with grip tape.'],
  ['AirPods Pro', 'elena@shop.app', 5, 'Noise cancelling is amazing', 'I use them on the bus every day and the city just disappears.'],
  ['AirPods Pro', 'alex@shop.app', 4, 'Comfortable and clear', 'Very comfortable for long calls. Pairing with the iPhone is instant.'],
  ['MacBook Pro 14', 'maria@shop.app', 5, 'Fast and silent', 'Compiles my projects in seconds and the fans never spin up.'],
  ['Gaming PC', 'alex@shop.app', 5, 'Runs everything on ultra', 'Cyberpunk with ray tracing at a stable framerate. Cable management is clean too.'],
  ['SteelSeries Apex Pro TKL', 'elena@shop.app', 4, 'Adjustable switches are a game changer', 'I set light actuation for gaming and deeper for typing. Solid build.'],
  ['iPhone 14 Pro', 'maria@shop.app', 4, 'Great camera', 'Photos at night look incredible. Battery gets me through the day.'],
  ['Alienware Monitor', 'alex@shop.app', 5, 'Colors pop', 'High refresh rate makes everything smooth. Worth every cent.'],
  ['Grand Theft Auto V', 'elena@shop.app', 4, 'Still fun after all these years', 'The story is great and online with friends is chaos in the best way.'],
]

export async function seed() {
  const products = JSON.parse(await readFile(new URL('./products.json', import.meta.url)))
  const password = await bcrypt.hash(DEMO_PASSWORD, 10)

  const users = {}
  for (const { name, email } of USERS) {
    users[email] = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { name, password } },
      { upsert: true, new: true }
    )
  }

  // replaceOne keeps the _id of a product that is already there (links and wishlists keep working)
  const day = 24 * 60 * 60 * 1000
  for (const [index, product] of products.entries()) {
    const createdAt = new Date(Date.now() - index * day)
    await Product.collection.replaceOne(
      { title: product.title },
      { ...product, rating: 0, reviewCount: 0, createdAt, updatedAt: createdAt },
      { upsert: true }
    )
  }

  for (const [title, email, rating, reviewTitle, content] of REVIEWS) {
    const product = await Product.findOne({ title })
    await Review.findOneAndUpdate(
      { product: product._id, user: users[email]._id },
      { rating, title: reviewTitle, content },
      { upsert: true }
    )
  }

  for (const product of await Product.find()) {
    await Review.updateProductRating(product._id)
  }

  return products.length
}

// run directly: npm run seed
if (fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await mongoose.connect(process.env.MONGODB_URI)
  const count = await seed()
  console.log(`Seeded ${count} products. Log in with demo@shop.app / ${DEMO_PASSWORD}`)
  await mongoose.disconnect()
}
