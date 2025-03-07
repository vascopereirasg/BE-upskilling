import type { Request, Response } from "express"
import { AppDataSource } from "../database/data-source"
import { Product } from "../entities/Product"

// Get repository for Product entity
const productRepository = AppDataSource.getRepository(Product)

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock } = req.body
    const product = productRepository.create({ name, description, price, stock })
    await productRepository.save(product)
    res.status(201).json({ message: "Product created successfully", product })
  } catch (error) {
    console.error("Error creating product:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get all products
export const getProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await productRepository.find()
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get a product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productRepository.findOne({ where: { id: Number(req.params.id) } })
    if (!product) res.status(404).json({ error: "Product not found" })
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productRepository.findOne({ where: { id: Number(req.params.id) } })
    if (!product) {
      res.status(404).json({ error: "Product not found" })
      return
    }

    productRepository.merge(product, req.body)
    await productRepository.save(product)
    res.status(200).json({ message: "Product updated successfully", product })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productRepository.delete(req.params.id)
    if (result.affected === 0) res.status(404).json({ error: "Product not found" })
    res.status(200).json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}