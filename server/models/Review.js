import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
)

// one review per user and product
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

// Recalculates the average rating shown on the product
reviewSchema.statics.updateProductRating = async function (productId) {
  const [stats] = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, rating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  await mongoose.model('Product').updateOne(
    { _id: productId },
    { rating: stats ? Math.round(stats.rating * 10) / 10 : 0, reviewCount: stats?.count ?? 0 }
  )
}

export const Review = mongoose.model('Review', reviewSchema, 'product_reviews')
