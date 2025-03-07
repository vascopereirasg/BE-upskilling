import type { Request, Response } from "express"
import { AppDataSource } from "../database/data-source"
import { Purchase } from "../entities/Purchase"
import { Product } from "../entities/Product"
import { User } from "../entities/User"

// Get repositories
const purchaseRepository = AppDataSource.getRepository(Purchase)
const productRepository = AppDataSource.getRepository(Product)
const userRepository = AppDataSource.getRepository(User)

// Create a new purchase
export const createPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, productId, quantity } = req.body

    // Validate input
    if (!userId || !productId || !quantity) {
      res.status(400).json({ error: "userId, productId, and quantity are required" })
      return
    }

    // Check if user exists
    const user = await userRepository.findOne({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // Check if product exists and has enough stock
    const product = await productRepository.findOne({ where: { id: productId } })
    if (!product) {
      res.status(404).json({ error: "Product not found" })
      return
    }

    if (product.stock < quantity) {
      res.status(400).json({ error: "Not enough stock available" })
      return
    }

    // Create purchase with current product price
    const purchase = purchaseRepository.create({
      userId,
      productId,
      quantity,
      purchasePrice: product.price,
      status: "completed",
    })

    // Update product stock
    product.stock -= quantity

    // Save both changes in a transaction
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(purchase)
      await transactionalEntityManager.save(product)
    })

    // Return purchase with related entities
    const savedPurchase = await purchaseRepository.findOne({
      where: { id: purchase.id },
      relations: ["user", "product"],
    })

    res.status(201).json({
      message: "Purchase completed successfully",
      purchase: savedPurchase,
    })
  } catch (error) {
    console.error("Error creating purchase:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get all purchases
export const getPurchases = async (_req: Request, res: Response): Promise<void> => {
  try {
    const purchases = await purchaseRepository.find({
      relations: ["user", "product"],
    })
    res.status(200).json(purchases)
  } catch (error) {
    console.error("Error fetching purchases:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get purchases by user ID
export const getPurchasesByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId)

    // Check if user exists
    const user = await userRepository.findOne({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    const purchases = await purchaseRepository.find({
      where: { userId },
      relations: ["product"],
    })

    res.status(200).json(purchases)
  } catch (error) {
    console.error("Error fetching user purchases:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get a purchase by ID
export const getPurchaseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const purchase = await purchaseRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user", "product"],
    })

    if (!purchase) {
      res.status(404).json({ error: "Purchase not found" })
      return
    }

    res.status(200).json(purchase)
  } catch (error) {
    console.error("Error fetching purchase:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Update purchase status
export const updatePurchaseStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body

    if (!status) {
      res.status(400).json({ error: "Status is required" })
      return
    }

    const purchase = await purchaseRepository.findOne({
      where: { id: Number(req.params.id) },
    })

    if (!purchase) {
      res.status(404).json({ error: "Purchase not found" })
      return
    }

    purchase.status = status
    await purchaseRepository.save(purchase)

    res.status(200).json({
      message: "Purchase status updated successfully",
      purchase,
    })
  } catch (error) {
    console.error("Error updating purchase status:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

