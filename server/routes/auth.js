import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { requireAuth, signToken } from '../middleware/auth.js'

const router = express.Router()

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post('/sign-up', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const { password = '', confirmPassword = '' } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }
    if (name.length < 3) {
      return res.status(400).json({ message: 'The name must have at least 3 letters.' })
    }
    if (!EMAIL.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'The password must have at least 8 characters.' })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'The passwords do not match.' })
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
    res.status(201).json({ token: signToken(user), user: user.toPublic() })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Wrong email or password.' })
    }

    res.json({ token: signToken(user), user: user.toPublic() })
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(401).json({ message: 'Please log in first.' })
    res.json(user.toPublic())
  } catch (error) {
    next(error)
  }
})

export { router as authRoutes }
