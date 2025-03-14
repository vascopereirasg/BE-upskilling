import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../config/jwt"

/**
 * Middleware to authenticate JWT token
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  // Get the authorization header
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({ error: "Authorization header missing" })
    return // Return without calling next()
  }

  // Check if the header has the correct format
  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({ error: "Invalid authorization format. Use: Bearer <token>" })
    return // Return without calling next()
  }

  const token = parts[1]

  try {
    // Verify the token
    const payload = verifyToken(token)

    // Add user info to request object
    req.user = payload

    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" })
    // No need to return anything here
  }
}

/**
 * Optional JWT authentication - doesn't fail if no token is provided
 * Useful for routes that can work with or without authentication
 */
export const optionalAuthenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  // Get the authorization header
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next() // Continue without authentication
  }

  // Check if the header has the correct format
  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next() // Continue without authentication
  }

  const token = parts[1]

  try {
    // Verify the token
    const payload = verifyToken(token)

    // Add user info to request object
    req.user = payload
  } catch (error) {
    // Continue without authentication if token is invalid
  }

  next()
}