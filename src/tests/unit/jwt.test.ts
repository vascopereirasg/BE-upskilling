import { generateAccessToken, generateRefreshToken, verifyToken } from "../../config/jwt"
import type { User } from "../../entities/User"
import jwt from "jsonwebtoken"
import { describe, it, expect } from "@jest/globals"

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key"
process.env.JWT_EXPIRES_IN = "15m"
process.env.JWT_REFRESH_EXPIRES_IN = "7d"

describe("JWT Utilities", () => {
  // Mock user object
  const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
      // Fix: Create a proper mock for credentials instead of null
      credentials: undefined,
  } as unknown as User // Use type assertion to treat as User

  describe("generateAccessToken", () => {
    it("should generate a valid JWT token", () => {
      // Generate token
      const token = generateAccessToken(mockUser)

      // Verify it's a string
      expect(typeof token).toBe("string")

      // Decode token to verify payload
      const decoded = jwt.decode(token) as jwt.JwtPayload
      expect(decoded).toBeTruthy()
      expect(decoded.userId).toBe(mockUser.id)
      expect(decoded.email).toBe(mockUser.email)

      // Verify token has expiration
      expect(decoded.exp).toBeTruthy()
    })
  })

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token with longer expiry", () => {
      // Generate token
      const token = generateRefreshToken(mockUser)

      // Verify it's a string
      expect(typeof token).toBe("string")

      // Decode token to verify payload
      const decoded = jwt.decode(token) as jwt.JwtPayload
      expect(decoded).toBeTruthy()
      expect(decoded.userId).toBe(mockUser.id)
      expect(decoded.email).toBe(mockUser.email)

      // Verify token has expiration
      expect(decoded.exp).toBeTruthy()

      // Verify refresh token has longer expiry than access token
      const accessToken = generateAccessToken(mockUser)
      const accessDecoded = jwt.decode(accessToken) as jwt.JwtPayload
      expect(decoded.exp).toBeGreaterThan(accessDecoded.exp as number)
    })
  })

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      // Generate token
      const token = generateAccessToken(mockUser)

      // Verify token
      const payload = verifyToken(token)

      // Check payload
      expect(payload).toBeTruthy()
      expect(payload.userId).toBe(mockUser.id)
      expect(payload.email).toBe(mockUser.email)
    })

    it("should throw an error for an invalid token", () => {
      // Invalid token
      const invalidToken = "invalid.token.here"

      // Verify it throws
      expect(() => verifyToken(invalidToken)).toThrow()
    })

    it("should throw an error for an expired token", () => {
      // Create a token that's already expired
      const expiredToken = jwt.sign({ userId: mockUser.id, email: mockUser.email }, process.env.JWT_SECRET as string, {
        expiresIn: "0s",
      })

      // Wait a moment to ensure it's expired
      setTimeout(() => {
        // Verify it throws
        expect(() => verifyToken(expiredToken)).toThrow()
      }, 10)
    })
  })
})

