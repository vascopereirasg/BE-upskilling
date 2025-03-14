import type { Request, Response, NextFunction } from "express"

/**
 * Middleware to validate user creation request.
 */
const validateUserRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" })
    return // Return without calling next()
  }

  next() // Proceed to the route handler
}

export default validateUserRequest