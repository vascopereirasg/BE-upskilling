import type { Request, Response, NextFunction } from "express"

/**
 * Middleware to validate purchase creation request.
 */
const validatePurchaseRequest = (req: Request, res: Response, next: NextFunction) => {
  const { userId, productId, quantity } = req.body

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" })
  }

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" })
  }

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be a positive number" })
  }

  next() // Proceed to the route handler
}

export default validatePurchaseRequest

