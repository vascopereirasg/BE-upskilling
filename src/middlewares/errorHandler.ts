import type { Request, Response, NextFunction } from "express"

interface ErrorWithStatus extends Error {
  status?: number
  stack?: string
}

/**
 * Centralized error-handling middleware with security considerations.
 */
const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void => {
  // Log error for debugging but avoid exposing sensitive details
  console.error(err.stack)

  // Set appropriate status code
  const statusCode = err.status || 500

  // Create safe error response
  const errorResponse: { error: string; stack?: string } = {
    error: statusCode === 500 ? "Internal Server Error" : err.message || "Something went wrong",
  }

  // Add more details in development mode
  if (process.env.NODE_ENV === "development" && statusCode !== 500) {
    errorResponse.stack = err.stack
  }

  res.status(statusCode).json(errorResponse)
  // No need to return anything or call next() in error handlers
}

export default errorHandler

