import * as jwt from "jsonwebtoken"
import type { User } from "../entities/User"

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d"

// Interface for token payload
export interface TokenPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

// Generate access token
export const generateAccessToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  }

  // Use a more explicit approach to avoid TypeScript issues
  try {
    // Force any type to bypass TypeScript checking for this specific call
    return (jwt.sign as any)(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })
  } catch (error) {
    console.error("Error generating access token:", error)
    throw new Error("Failed to generate access token")
  }
}

// Generate refresh token
export const generateRefreshToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  }

  try {
    // Force any type to bypass TypeScript checking for this specific call
    return (jwt.sign as any)(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    })
  } catch (error) {
    console.error("Error generating refresh token:", error)
    throw new Error("Failed to generate refresh token")
  }
}

// Verify token and return payload
export const verifyToken = (token: string): TokenPayload => {
  try {
    // Force any type to bypass TypeScript checking for this specific call
    const decoded = (jwt.verify as any)(token, JWT_SECRET)
    return decoded as TokenPayload
  } catch (error) {
    console.error("Error verifying token:", error)
    throw new Error("Invalid or expired token")
  }
}

