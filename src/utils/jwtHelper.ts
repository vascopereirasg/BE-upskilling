import * as jwt from "jsonwebtoken"
import type { User } from "../entities/User"

// Interface for token payload
export interface TokenPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

/**
 * Alternative implementation using a different approach
 * if the main implementation still has TypeScript issues
 */
export class JwtHelper {
  private readonly secret: string
  private readonly accessTokenExpiry: string
  private readonly refreshTokenExpiry: string

  constructor() {
    this.secret = process.env.JWT_SECRET || "your-secret-key-change-in-production"
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || "1h"
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  }

  generateAccessToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
    }

    // Use a more explicit approach to avoid TypeScript issues
    try {
    // Force any type to bypass TypeScript checking for this specific call
    return (jwt.sign as any)(payload, this.secret, {
        expiresIn: this.accessTokenExpiry,
    })
    } catch (error) {
        console.error("Error generating access token:", error)
        throw new Error("Failed to generate access token")
    }
  }

  generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
    }

    // Use a more explicit approach to avoid TypeScript issues
    try {
        // Force any type to bypass TypeScript checking for this specific call
        return (jwt.sign as any)(payload, this.secret, {
        expiresIn: this.refreshTokenExpiry,
    })
    } catch (error) {
        console.error("Error generating access token:", error)
        throw new Error("Failed to generate access token")
    }
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload
    } catch (error) {
      throw new Error("Invalid or expired token")
    }
  }
}

// Export a singleton instance
export const jwtHelper = new JwtHelper()

