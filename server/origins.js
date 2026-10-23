// Frontend address(es) from CLIENT_URL (comma-separated). Outside production any
// http://localhost:<port> is also accepted, since Next moves to 3001, 3002... when 3000 is taken.
const configured = () => (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((url) => url.trim())

export const isAllowedOrigin = (origin) =>
  configured().includes(origin) ||
  (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin ?? ''))

// where Stripe / demo checkout sends the shopper back: the site they are using
export const clientUrl = (req) => (isAllowedOrigin(req.headers.origin) ? req.headers.origin : configured()[0])
