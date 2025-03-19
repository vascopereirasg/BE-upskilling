import type { Request, Response } from "express"
import { User } from "../entities/User"
import { Credentials } from "../entities/Credentials"
import bcrypt from "bcryptjs"
import { AppDataSource } from "../database/data-source"

// Get repositories
const userRepository = AppDataSource.getRepository(User)
const credentialsRepository = AppDataSource.getRepository(Credentials)

// Create a new user with credentials
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

    // Create new user and credentials in a transaction
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // Create and save user
      const user = userRepository.create({
        email,
        name,
      })

      await transactionalEntityManager.save(user)

      // Create and save credentials
      const credentials = credentialsRepository.create({
        userId: user.id,
        password: hashedPassword,
      })

      await transactionalEntityManager.save(credentials)
    })

    // Fetch the created user (without password)
    const createdUser = await userRepository.findOne({
      where: { email },
      relations: ["credentials"],
    })

    // Remove password from response
    // if (createdUser && createdUser.credentials && createdUser.credentials.password) {
    //   delete createdUser.credentials.password
    // }

    res.status(201).json({
      message: "User created successfully",
      user: createdUser,
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
      select: ["id", "email", "name", "createdAt", "updatedAt"],
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
      select: ["id", "email", "name", "createdAt", "updatedAt"],
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
    const userId = Number(req.params.id)
    const { email, name, password } = req.body

    // Start a transaction
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // Update user details
      if (email || name) {
        const user = await userRepository.findOne({ where: { id: userId } })
        if (!user) {
          res.status(404).json({ error: "User not found" })
          return
        }

        if (email) user.email = email
        if (name) user.name = name

        await transactionalEntityManager.save(user)
      }

      // Update password if provided
      if (password) {
        const credentials = await credentialsRepository.findOne({ where: { userId } })
        if (!credentials) {
          res.status(404).json({ error: "Credentials not found" })
          return
        }

        const salt = await bcrypt.genSalt(10)
        credentials.password = await bcrypt.hash(password, salt)

        await transactionalEntityManager.save(credentials)
      }
    })

    // Get updated user
    const updatedUser = await userRepository.findOne({
      where: { id: userId },
      select: ["id", "email", "name", "createdAt", "updatedAt"],
    })

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
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

