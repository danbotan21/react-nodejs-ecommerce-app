import express from 'express'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { Product } from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

const sendWishlist = async (res, userId) => {
  const user = await User.findById(userId).populate('wishlist')
  res.json(user?.wishlist ?? [])
}

router.get('/', async (req, res, next) => {
  try {
    await sendWishlist(res, req.userId)
  } catch (error) {
    next(error)
  }
})

router.put('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params
    if (!mongoose.isValidObjectId(productId) || !(await Product.exists({ _id: productId }))) {
      return res.status(404).json({ message: 'This product does not exist.' })
    }
    await User.updateOne({ _id: req.userId }, { $addToSet: { wishlist: productId } })
    await sendWishlist(res, req.userId)
  } catch (error) {
    next(error)
  }
})

router.delete('/:productId', async (req, res, next) => {
  try {
    if (mongoose.isValidObjectId(req.params.productId)) {
      await User.updateOne({ _id: req.userId }, { $pull: { wishlist: req.params.productId } })
    }
    await sendWishlist(res, req.userId)
  } catch (error) {
    next(error)
  }
})

export { router as wishlistRoutes }
