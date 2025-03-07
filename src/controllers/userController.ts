import type { Request, Response } from "express"
import { AppDataSource } from "../database/data-source"
import { User } from "../entities/User"
import bcrypt from "bcryptjs"

// Get repository for User entity
const userRepository = AppDataSource.getRepository(User)

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } })
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" })
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = userRepository.create({
      email,
      password: hashedPassword,
      name,
    })

    await userRepository.save(user)

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user
    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get all users
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await userRepository.find({
      select: ["id", "email", "name", "createdAt", "updatedAt"], // Exclude password
    })
    res.status(200).json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Get a user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userRepository.findOne({
      where: { id: Number(req.params.id) },
      select: ["id", "email", "name", "createdAt", "updatedAt"], // Exclude password
    })

    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    res.status(200).json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Update a user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userRepository.findOne({ where: { id: Number(req.params.id) } })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // If updating password, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10)
      req.body.password = await bcrypt.hash(req.body.password, salt)
    }

    userRepository.merge(user, req.body)
    await userRepository.save(user)

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user
    res.status(200).json({
      message: "User updated successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Delete a user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await userRepository.delete(req.params.id)
    if (result.affected === 0) {
      res.status(404).json({ error: "User not found" })
      return
    }
    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// User login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await userRepository.findOne({ where: { email } })
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error during login:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

