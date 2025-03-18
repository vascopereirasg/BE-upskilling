import type { Request, Response, NextFunction } from "express"
import { authenticateJWT, optionalAuthenticateJWT } from "../../middlewares/authMiddleware"
import { generateAccessToken } from "../../config/jwt"
import type { User } from "../../entities/User"
import { describe, it, expect, beforeEach, jest } from "@jest/globals"

// Mock user
const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
    // Fix: Create a proper mock for credentials
    credentials: undefined,
} as unknown as User // Use type assertion to treat as User

// Mock JWT secret
process.env.JWT_SECRET = "test-secret-key"

describe("Authentication Middleware", () => {
  // Mock Express request, response, and next function
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: jest.Mock

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {}

    // Fix: Properly type the mock response methods
    const jsonMock = jest.fn().mockReturnThis()
    const statusMock = jest.fn().mockReturnThis()

    mockResponse = {
      status: statusMock as unknown as Response["status"],
      json: jsonMock as unknown as Response["json"],
    }

    nextFunction = jest.fn()
  })

  describe("authenticateJWT", () => {
    it("should call next() when a valid token is provided", () => {
      // Generate a valid token
      const token = generateAccessToken(mockUser)

      // Set up request with authorization header
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      }

      // Call middleware
      authenticateJWT(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction)

      // Verify next was called
      expect(nextFunction).toHaveBeenCalled()

      // Verify user was added to request
      expect(mockRequest.user).toBeDefined()
      expect(mockRequest.user?.userId).toBe(mockUser.id)
      expect(mockRequest.user?.email).toBe(mockUser.email)
    })

    it("should return 401 when no authorization header is provided", () => {
      // Set up request with no authorization header
      mockRequest.headers = {}

      // Call middleware
      authenticateJWT(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction)

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Authorization header missing",
      })

      // Verify next was not called
      expect(nextFunction).not.toHaveBeenCalled()
    })

    it("should return 401 when an invalid token format is provided", () => {
      // Set up request with invalid token format
      mockRequest.headers = {
        authorization: "InvalidFormat token123",
      }

      // Call middleware
      authenticateJWT(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction)

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid authorization format. Use: Bearer <token>",
      })

      // Verify next was not called
      expect(nextFunction).not.toHaveBeenCalled()
    })

    it("should return 401 when an invalid token is provided", () => {
      // Set up request with invalid token
      mockRequest.headers = {
        authorization: "Bearer invalid.token.here",
      }

      // Call middleware
      authenticateJWT(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction)

      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      })

      // Verify next was not called
      expect(nextFunction).not.toHaveBeenCalled()
    })
  })

  describe("optionalAuthenticateJWT", () => {
    it("should call next() and set user when a valid token is provided", () => {
      // Generate a valid token
      const token = generateAccessToken(mockUser)

      // Set up request with authorization header
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      }

      // Call middleware
      optionalAuthenticateJWT(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction)

      // Verify next was called
      expect(nextFunction).toHaveBeenCalled()

      // Verify user was added to request
      expect(mockRequest.user).toBeDefined()
      expect(mockRequest.user?.userId).toBe(mockUser.id)
      expect(mockRequest.user?.email).toBe(mockUser.email)
    })

    it("should call next() without setting user when no token is provided", () => {
      // Set up request with no authorization header
      mockRequest.headers = {}

      // Call middleware
      optionalAuthenticateJWT(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction)

      // Verify next was called
      expect(nextFunction).toHaveBeenCalled()

      // Verify user was not added to request
      expect(mockRequest.user).toBeUndefined()
    })

    it("should call next() without setting user when an invalid token is provided", () => {
      // Set up request with invalid token
      mockRequest.headers = {
        authorization: "Bearer invalid.token.here",
      }

      // Call middleware
      optionalAuthenticateJWT(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction)

      // Verify next was called
      expect(nextFunction).toHaveBeenCalled()

      // Verify user was not added to request
      expect(mockRequest.user).toBeUndefined()
    })
  })
})

