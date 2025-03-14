import type { Request, Response } from "express"
import { AppDataSource } from "../database/data-source"
import { User } from "../entities/User"
import { Credentials } from "../entities/Credentials"
import bcrypt from "bcryptjs"
// Import both implementations - use the one that works
import { generateAccessToken, generateRefreshToken, verifyToken } from "../config/jwt"
import { jwtHelper } from "../utils/jwtHelper"

// Import the extended Request type
import "../types/express"

// Get repositories
const userRepository = AppDataSource.getRepository(User)
const credentialsRepository = AppDataSource.getRepository(Credentials)

// Store refresh tokens (in a real app, use Redis or a database)
const refreshTokens = new Set<string>()

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

    // Generate tokens - try the alternative implementation if the main one has issues
    let accessToken, refreshToken
    try {
      // Try the main implementation first
      accessToken = generateAccessToken(user)
      refreshToken = generateRefreshToken(user)
    } catch (error) {
      // Fall back to the alternative implementation
      console.log("Using alternative JWT implementation due to error:", error)
      accessToken = jwtHelper.generateAccessToken(user)
      refreshToken = jwtHelper.generateRefreshToken(user)
    }

    // Store refresh token
    refreshTokens.add(refreshToken)

    // Don't return the password in the response
    const { credentials, ...userWithoutCredentials } = user

    res.status(200).json({
      message: "Login successful",
      user: userWithoutCredentials,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Error during login:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" })
      return
    }

    // Check if refresh token exists in our storage
    if (!refreshTokens.has(refreshToken)) {
      res.status(403).json({ error: "Invalid refresh token" })
      return
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken)

    // Find user
    const user = await userRepository.findOne({ where: { id: payload.userId } })

    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user)

    res.status(200).json({
      accessToken: newAccessToken,
    })
  } catch (error) {
    console.error("Error refreshing token:", error)
    res.status(401).json({ error: "Invalid refresh token" })
  }
}

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" })
      return
    }

    // Remove refresh token from storage
    refreshTokens.delete(refreshToken)

    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Error during logout:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from JWT token
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

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

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from JWT token
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    // Find user
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ["id", "email", "name", "createdAt", "updatedAt"],
    })

    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    res.status(200).json(user)
  } catch (error) {
    console.error("Error fetching current user:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}