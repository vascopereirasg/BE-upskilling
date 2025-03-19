import type { Request, Response, NextFunction } from "express"

// Simple in-memory rate limiting
// For production, use a more robust solution like redis-based rate limiting
interface RateLimitRecord {
  count: number
  resetTime: number
}

const ipRequests = new Map<string, RateLimitRecord>()

/**
 * Rate limiting middleware to prevent brute force attacks
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param windowMs Time window in milliseconds
 */
export const rateLimit = (maxRequests = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get client IP
    const ip = req.ip || req.socket.remoteAddress || "unknown"

    // Get current time
    const now = Date.now()

    // Get or create rate limit record for this IP
    const record = ipRequests.get(ip) || { count: 0, resetTime: now + windowMs }

    // If the reset time has passed, reset the counter
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + windowMs
    }

    // Increment request count
    record.count += 1

    // Update the record
    ipRequests.set(ip, record)

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests.toString())
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count).toString())
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000).toString())

    // If the request count exceeds the limit, return 429 Too Many Requests
    if (record.count > maxRequests) {
      res.status(429).json({
        error: "Too many requests, please try again later.",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      })
      // Don't call next() and don't return anything
      return
    }

    // If we're under the limit, proceed to the next middleware
    next()
  }
}

/**
 * Stricter rate limiting for sensitive routes like login
 */
export const authRateLimit = rateLimit(5, 15 * 60 * 1000) // 5 requests per 15 minutes

