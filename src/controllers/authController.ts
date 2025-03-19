import type { Request, Response } from "express"
import { User } from "../entities/User"
import { Credentials } from "../entities/Credentials"
import bcrypt from "bcryptjs"
import { AppDataSource } from "../database/data-source"

// Get repositories
const userRepository = AppDataSource.getRepository(User)
const credentialsRepository = AppDataSource.getRepository(Credentials)

// User login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await userRepository.findOne({
      where: { email },
      relations: ["credentials"],
    })

    if (!user || !user.credentials) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.credentials.password)
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    // Don't return the password in the response
    const { credentials, ...userWithoutCredentials } = user

    res.status(200).json({
      message: "Login successful",
      user: userWithoutCredentials,
    })
  } catch (error) {
    console.error("Error during login:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id)
    const { currentPassword, newPassword } = req.body

    // Validate request
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current password and new password are required" })
      return
    }

    // Find user credentials
    const credentials = await credentialsRepository.findOne({
      where: { userId },
      relations: ["user"],
    })

    if (!credentials) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, credentials.password)
    if (!isPasswordValid) {
      res.status(401).json({ error: "Current password is incorrect" })
      return
    }

    // Update password
    const salt = await bcrypt.genSalt(10)
    credentials.password = await bcrypt.hash(newPassword, salt)

    await credentialsRepository.save(credentials)

    res.status(200).json({
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

