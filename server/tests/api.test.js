import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { app } from '../app.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { Review } from '../models/Review.js'
import { User } from '../models/User.js'

process.env.JWT_SECRET = 'test-secret'
delete process.env.STRIPE_SECRET_KEY // checkout runs in demo mode

let mongo
let mouse, laptop

const signUp = async (name) => {
  const res = await request(app).post('/api/auth/sign-up').send({
    name,
    email: `${name}@test.dev`,
    password: 'Password123',
    confirmPassword: 'Password123',
  })
  return { Authorization: `Bearer ${res.body.token}` }
}

before(async () => {
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
})

after(async () => {
  await mongoose.disconnect()
  await mongo.stop()
})

beforeEach(async () => {
  await Promise.all([User, Product, Review, Order].map((model) => model.deleteMany({})))
  ;[mouse, laptop] = await Product.create([
    { title: 'Gaming Mouse', category: 'Mice', price: 120, image: 'https://example.com/m.jpg' },
    { title: 'Laptop', category: 'Laptops', price: 1600, image: 'https://example.com/l.jpg' },
  ])
})

describe('auth', () => {
  test('sign up and log in return a token, never the password', async () => {
    await signUp('ana')
    const res = await request(app).post('/api/auth/login').send({ email: 'ana@test.dev', password: 'Password123' })
    assert.equal(res.status, 200)
    assert.ok(res.body.token)
    assert.equal(res.body.user.password, undefined)
  })

  test('sign up checks every field', async () => {
    const res = await request(app).post('/api/auth/sign-up').send({ name: 'ana', email: 'ana@test.dev' })
    assert.equal(res.status, 400)
  })

  test('a fake or short token is refused', async () => {
    for (const token of ['abc', 'not-a-real-token-but-long-enough']) {
      const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${token}`)
      assert.equal(res.status, 401)
    }
  })
})

describe('products', () => {
  test('filter by category, price and search', async () => {
    const byCategory = await request(app).get('/api/products').query({ category: 'Mice' })
    assert.deepEqual(byCategory.body.map((p) => p.title), ['Gaming Mouse'])

    const byPrice = await request(app).get('/api/products').query({ minPrice: 1000 })
    assert.deepEqual(byPrice.body.map((p) => p.title), ['Laptop'])

    const bySearch = await request(app).get('/api/products').query({ search: 'lap' })
    assert.deepEqual(bySearch.body.map((p) => p.title), ['Laptop'])

    const cheapFirst = await request(app).get('/api/products').query({ sort: 'price-asc' })
    assert.deepEqual(cheapFirst.body.map((p) => p.title), ['Gaming Mouse', 'Laptop'])
  })

  test('categories and unknown ids', async () => {
    assert.deepEqual((await request(app).get('/api/products/categories')).body, ['Laptops', 'Mice'])
    assert.equal((await request(app).get('/api/products/nope')).status, 404)
  })
})

describe('reviews', () => {
  test('one review per user, and the product rating is the average', async () => {
    const ana = await signUp('ana')
    const bob = await signUp('bob')
    const url = `/api/products/${mouse._id}/reviews`

    await request(app).post(url).set(ana).send({ rating: 2, title: 'Meh', content: 'Too small.' })
    await request(app).post(url).set(ana).send({ rating: 4, title: 'Grew on me', content: 'Actually good.' })
    await request(app).post(url).set(bob).send({ rating: 5, title: 'Great', content: 'Love it.' })

    const reviews = await request(app).get(url)
    assert.equal(reviews.body.length, 2)
    const product = await request(app).get(`/api/products/${mouse._id}`)
    assert.equal(product.body.rating, 4.5)
    assert.equal(product.body.reviewCount, 2)
  })

  test('a review needs a login and a rating from 1 to 5', async () => {
    const url = `/api/products/${mouse._id}/reviews`
    assert.equal((await request(app).post(url).send({ rating: 5, title: 'a', content: 'b' })).status, 401)
    const ana = await signUp('ana')
    assert.equal((await request(app).post(url).set(ana).send({ rating: 9, title: 'a', content: 'b' })).status, 400)
  })
})

describe('wishlist', () => {
  test('each user has their own wishlist', async () => {
    const ana = await signUp('ana')
    const bob = await signUp('bob')

    await request(app).put(`/api/wishlist/${laptop._id}`).set(ana)
    await request(app).put(`/api/wishlist/${laptop._id}`).set(ana)
    assert.deepEqual((await request(app).get('/api/wishlist').set(ana)).body.map((p) => p.title), ['Laptop'])
    assert.deepEqual((await request(app).get('/api/wishlist').set(bob)).body, [])

    await request(app).delete(`/api/wishlist/${laptop._id}`).set(ana)
    assert.deepEqual((await request(app).get('/api/wishlist').set(ana)).body, [])
  })
})

describe('checkout', () => {
  test('prices come from the database, not from the request', async () => {
    const ana = await signUp('ana')
    const res = await request(app)
      .post('/api/orders/checkout')
      .set(ana)
      .send({ items: [{ productId: mouse._id, quantity: 2, price: 1 }, { productId: laptop._id, quantity: 1 }] })

    assert.equal(res.status, 201)
    const order = await Order.findOne()
    assert.equal(order.total, 120 * 2 + 1600)
    assert.equal(order.status, 'paid')

    const mine = await request(app).get('/api/orders').set(ana)
    assert.equal(mine.body.length, 1)
  })

  test('invalid carts are rejected', async () => {
    const ana = await signUp('ana')
    const checkout = (items) => request(app).post('/api/orders/checkout').set(ana).send({ items })
    assert.equal((await checkout([])).status, 400)
    assert.equal((await checkout([{ productId: mouse._id, quantity: 0 }])).status, 400)
    assert.equal((await checkout([{ productId: new mongoose.Types.ObjectId(), quantity: 1 }])).status, 400)
  })
})
