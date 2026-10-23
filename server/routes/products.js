import express from 'express'
import mongoose from 'mongoose'
import { Product } from '../models/Product.js'
import { Review } from '../models/Review.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1, reviewCount: -1 },
}

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=
router.get('/', async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query
    const filter = {}

    if (search?.trim()) filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' }
    if (category && category !== 'all') filter.category = category
    if (minPrice || maxPrice) {
      filter.price = {}
      if (Number(minPrice) > 0) filter.price.$gte = Number(minPrice)
      if (Number(maxPrice) > 0) filter.price.$lte = Number(maxPrice)
    }

    const products = await Product.find(filter).sort(SORTS[sort] || SORTS.newest)
    res.json(products)
  } catch (error) {
    next(error)
  }
})

router.get('/categories', async (req, res, next) => {
  try {
    res.json((await Product.distinct('category')).sort())
  } catch (error) {
    next(error)
  }
})

// Loads :id into req.product for the routes below
router.param('id', async (req, res, next, id) => {
  try {
    req.product = mongoose.isValidObjectId(id) ? await Product.findById(id) : null
    if (!req.product) return res.status(404).json({ message: 'This product does not exist.' })
    next()
  } catch (error) {
    next(error)
  }
})

router.get('/:id', (req, res) => res.json(req.product))

router.get('/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.product._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name')
    res.json(reviews)
  } catch (error) {
    next(error)
  }
})

// Writing a second review for the same product replaces the first one
router.post('/:id/reviews', requireAuth, async (req, res, next) => {
  try {
    const rating = Number(req.body.rating)
    const title = String(req.body.title || '').trim()
    const content = String(req.body.content || '').trim()

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Pick a rating from 1 to 5 stars.' })
    }
    if (!title || !content) {
      return res.status(400).json({ message: 'Please add a title and a few words about the product.' })
    }

    const review = await Review.findOneAndUpdate(
      { product: req.product._id, user: req.userId },
      { rating, title, content },
      { upsert: true, new: true, runValidators: true }
    ).populate('user', 'name')

    await Review.updateProductRating(req.product._id)
    res.status(201).json(review)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'The review is too long.' })
    }
    next(error)
  }
})

export { router as productRoutes }
