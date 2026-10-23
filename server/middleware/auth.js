import jwt from 'jsonwebtoken'

export const signToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// Reads "Authorization: Bearer <token>" and puts the user id on req.userId
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Please log in first.' })
  }

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId
    next()
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }
}
