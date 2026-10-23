import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        image: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    stripeSessionId: String,
  },
  { timestamps: true }
)

export const Order = mongoose.model('Order', orderSchema, 'orders')
