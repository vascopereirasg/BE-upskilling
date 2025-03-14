import type { Request, Response, NextFunction } from "express"

/**
 * Middleware to log requests (method, URL, timestamp).
 */
const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next() // Continue to the next middleware or route handler
}

export default loggerMiddleware