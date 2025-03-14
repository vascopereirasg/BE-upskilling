import type { Request, Response, NextFunction } from "express"

/**
 * Middleware to validate API key in headers.
 */
const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.header("x-api-key") // Get API key from request headers

  if (!apiKey) {
    res.status(401).json({ error: "API key is missing" })
    return // Return without calling next()
  }

  if (apiKey !== "secure-api-key") {
    res.status(403).json({ error: "Invalid API key" })
    return // Return without calling next()
  }

  next() // Allow the request to proceed
}

export default apiKeyMiddleware

